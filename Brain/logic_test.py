import os
import json
import time
import PyPDF2
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from google.genai import errors

load_dotenv()

# All API Keys being used
key_1 = os.getenv("GEMINI_KEY_TOPICS")
key_2 = os.getenv("GEMINI_KEY_ASKER")
key_3 = os.getenv("GEMINI_KEY_GRADER")

if not key_1 or not key_2 or not key_3:
    print("❌ ERROR: Please ensure you have 3 keys in your .env file:")
    print("GEMINI_KEY_TOPICS, GEMINI_KEY_ASKER, GEMINI_KEY_GRADER")
    exit()

# Initializing 3 Clients
client_topics = genai.Client(api_key=key_1)
client_asker  = genai.Client(api_key=key_2)
client_grader = genai.Client(api_key=key_3)

TARGET_JOB_DESCRIPTION = """
File clerk
"""

# Schemas
class AnswerGrade(BaseModel):
    is_correct: bool = Field(description="True if correct")
    feedback: str = Field(description="Reason")

class TopicGenerator(BaseModel):
    
    topics: list[str] = Field(description="List of 1 technical topic.")

# Brain
class AdaptiveInterviewer:
    def __init__(self, resume_text, job_description):
        self.job_description = job_description
        
        # Storage for scores
        self.skill_scores = [] 
        self.current_skill_score = 0 
        
        print(f"\n  Reading Resume (Using Key 1)...")
        self.topics = self._get_topics_from_resume(resume_text)
        print(f"✅ Topic Locked: {self.topics}")
        
        self.current_topic_index = 0
        self.difficulty_level = 2 
        self.current_question_text = ""
        self.questions_asked_in_current_topic = 0
        self.correct_answers_in_current_topic = 0

    def _safe_api_call(self, client_instance, model, contents, config=None):
        max_retries = 3
        for attempt in range(max_retries):
            try:
                if config:
                    return client_instance.models.generate_content(model=model, contents=contents, config=config)
                return client_instance.models.generate_content(model=model, contents=contents)
            except Exception as e:
                if "429" in str(e) or "503" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                    wait_time = 5 * (attempt + 1)
                    print(f"   ⏳ Traffic spike. Waiting {wait_time}s... (Attempt {attempt+1}/{max_retries})")
                    time.sleep(wait_time)
                else:
                    print(f"❌ API Error: {e}")
                    return None
        return None

    def _get_topics_from_resume(self, text):
        prompt = f"""
        You are a Technical Recruiter.
        RESUME: {text[:2000]}...
        TARGET JOB: {self.job_description}
        TASK: Identify the TOP 1 single most important technical skill that appears in BOTH.
        """
        # Using client Topic
        response = self._safe_api_call(
            client_instance=client_topics, 
            model="gemini-flash-latest",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=TopicGenerator
            )
        )
        if response and response.text:
            try:
                
                return json.loads(response.text)['topics'][:1]
            except:
                pass
        return ["General Skills"]

    def generate_question(self):
        topic = self.topics[self.current_topic_index]
        prompt = f"""
        You are a technical interviewer.
        CONTEXT:
        - Job Role: {self.job_description}
        - Topic: {topic}
        - Difficulty: {self.difficulty_level}/3 (1=Easy, 3=Hard)
        TASK:
        Ask ONE direct interview question about {topic}.
        - STRICTLY 1 or 2 sentences max.
        """
        
        # Using Client Asker
        response = self._safe_api_call(
            client_instance=client_asker,
            model="gemini-flash-latest", 
            contents=prompt
        )
        
        if response and response.text:
            self.current_question_text = response.text.strip()
        else:
            self.current_question_text = f"Tell me about your experience with {topic}."
            
        return self.current_question_text

    def evaluate_answer(self, user_answer):
        prompt = f"""
        Question: "{self.current_question_text}"
        User Answer: "{user_answer}"
        Task: Check if factually correct.
        """
        
        # USing Client Grader
        response = self._safe_api_call(
            client_instance=client_grader,
            model="gemini-flash-latest",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=AnswerGrade
            )
        )
        
        if not response or not response.text:
            print("   ⚠️ API Error. Skipping grading.")
            is_correct = True
        else:
            try:
                result = json.loads(response.text)
                is_correct = result['is_correct']
            except:
                is_correct = True

        self.questions_asked_in_current_topic += 1
        
        # Scoring Logic
        if is_correct:
            if self.difficulty_level == 1: points = 30
            elif self.difficulty_level == 2: points = 32
            else: points = 34
            
            self.current_skill_score += points
            self.correct_answers_in_current_topic += 1 
            
            print(f"   ✅ Correct! (+{points} pts)")
            self.difficulty_level = min(3, self.difficulty_level + 1)
        else:
            print(f"   ❌ Wrong. (+0 pts)")
            self.difficulty_level = max(1, self.difficulty_level - 1)

        # Switching Logic
        if self.correct_answers_in_current_topic >= 3:
            print(f"   (🎯 3 Correct. Section Complete!)")
            self._move_next_topic()
            return "SWITCHED_TOPIC"
            
        if self.questions_asked_in_current_topic >= 5:
            print(f"   (⚠️ 5 Questions asked. Section Complete!)")
            self._move_next_topic()
            return "SWITCHED_TOPIC"
            
        return "CONTINUE"

    def _move_next_topic(self):
        print(f"   📝 Section Score Locked: {self.current_skill_score}")
        self.skill_scores.append(self.current_skill_score)
        
    
        self.current_topic_index += 1
        self.current_skill_score = 0
        self.questions_asked_in_current_topic = 0
        self.correct_answers_in_current_topic = 0
        self.difficulty_level = 2 
        
        if self.current_topic_index < len(self.topics):
            print(f"\n➡ Next Topic: {self.topics[self.current_topic_index]}...")

# Pdf Helper
def extract_text_from_pdf(pdf_path):
    print(f"📄 Reading PDF: {pdf_path}...")
    try:
        text = ""
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"❌ Error reading PDF: {e}")
        return None

if __name__ == "__main__":
    resume_path = "brain\Alex_Taylor_Resume.pdf"
    
    if os.path.exists(resume_path):
        resume_content = extract_text_from_pdf(resume_path)
    else:
        print(f"❌ '{resume_path}' not found!")
        exit()

    if not resume_content: exit()

    bot = AdaptiveInterviewer(resume_content, TARGET_JOB_DESCRIPTION)
    
    print("\n" + "="*40)
    print("🤖 INTERVIEW STARTED")
    print("="*40)
    
    while bot.current_topic_index < len(bot.topics):
        print(f"\n[Diff: {bot.difficulty_level}] Question:")
        q = bot.generate_question()
        print(f"🤖 {q}") 
        
        ans = input("👤 ")
        status = bot.evaluate_answer(ans)
        
        if status == "SWITCHED_TOPIC" and bot.current_topic_index >= len(bot.topics):
            break

    print("\n" + "="*40)
    print("📊 FINAL RESULTS")
    print("="*40)
    
    if len(bot.skill_scores) > 0:
        total_sum = sum(bot.skill_scores)
        count = len(bot.skill_scores) 
        final_average = total_sum / count
        
        print(f"Total Score Earned: {total_sum}")
        print(f"🏆 FINAL RATING:     {final_average:.2f}")
        
        if final_average > 80: print("Verdict: HIRED! 🌟")
        elif final_average > 50: print("Verdict: MAYBE. 😐")
        else: print("Verdict: REJECTED. ❌")
    else:
        print("No questions answered.")