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

api_key = os.getenv("GEMINI-API-KEY")

# --- 1. CONFIGURATION ---
os.environ["GEMINI_API_KEY"] = api_key
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

TARGET_JOB_DESCRIPTION = """
File clerk
"""

# --- 2. SCHEMAS ---
class AnswerGrade(BaseModel):
    is_correct: bool = Field(description="True if correct")
    feedback: str = Field(description="Reason")

class TopicGenerator(BaseModel):
    topics: list[str] = Field(description="List of 2 technical topics.")

# --- 3. THE BRAIN CLASS ---
class AdaptiveInterviewer:
    def __init__(self, resume_text, job_description):
        self.job_description = job_description
        self.current_score = 0
        self.total_questions_session = 0
        
        print(f"\n  Reading Resume & Matching Skills...")
        self.topics = self._get_topics_from_resume(resume_text)
        print(f"✅ Topics Locked: {self.topics}")
        
        self.current_topic_index = 0
        self.difficulty_level = 5
        self.current_question_text = ""
        self.questions_asked_in_current_topic = 0
        self.correct_answers_in_current_topic = 0

    # ✅ ROBUST API CALLER
    def _safe_api_call(self, model, contents, config=None):
        max_retries = 3
        for attempt in range(max_retries):
            try:
                if config:
                    return client.models.generate_content(model=model, contents=contents, config=config)
                return client.models.generate_content(model=model, contents=contents)
            except Exception as e:
                # Handle Quota (429) or Service Unavailable (503)
                if "429" in str(e) or "503" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                    wait_time = 10 * (attempt + 1) # Exponential backoff (10s, 20s, 30s)
                    print(f"   ⏳ High traffic. Waiting {wait_time}s... (Attempt {attempt+1}/{max_retries})")
                    time.sleep(wait_time)
                else:
                    print(f"❌ API Error: {e}")
                    return None
        print("❌ Failed after retries.")
        return None

    def _get_topics_from_resume(self, text):
        prompt = f"""
        You are a Technical Recruiter.
        RESUME: {text[:2000]}...
        TARGET JOB: {self.job_description}
        TASK: Identify the TOP 1 technical skill that appear in BOTH.
        """
        response = self._safe_api_call(
            model="gemini-flash-latest",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=TopicGenerator
            )
        )
        if response and response.text:
            try:
                return json.loads(response.text)['topics'][:2]
            except:
                pass
        return ["Python", "Software Engineering"] # Fallback

    def generate_question(self):
        topic = self.topics[self.current_topic_index]
        prompt = f"""
        You are a technical interviewer.
        CONTEXT:
        - Job Role: {self.job_description}
        - Topic: {topic}
        - Difficulty: {self.difficulty_level}/10 
        TASK:
        Ask ONE direct interview question about {topic}.
        - STRICTLY 1 or 2 sentences max.
        """
        
        # ✅ FIX: Check if response exists before using it
        response = self._safe_api_call(model="gemini-flash-latest", contents=prompt)
        
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
        
        response = self._safe_api_call(
            model="gemini-flash-latest",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=AnswerGrade
            )
        )
        
        # ✅ FIX: Handle empty response gracefully
        if not response or not response.text:
            print("   ⚠️ Couldn't grade answer (API busy). Assuming correct to move on.")
            is_correct = True
        else:
            try:
                result = json.loads(response.text)
                is_correct = result['is_correct']
            except:
                is_correct = True # Fallback

        self.questions_asked_in_current_topic += 1
        self.total_questions_session += 1
        
        if is_correct:
            points_earned = self.difficulty_level
            self.current_score += points_earned
            self.correct_answers_in_current_topic += 1 
            print(f"   ✅ Correct! (+{points_earned} pts)")
            self.difficulty_level = min(10, self.difficulty_level + 1)
        else:
            print(f"   ❌ Wrong. (+0 pts)")
            self.difficulty_level = max(1, self.difficulty_level - 1)

        if self.correct_answers_in_current_topic >= 3:
            print(f"   (🎯 3 Correct. Next Topic...)")
            self._move_next_topic()
            return "SWITCHED_TOPIC"
            
        if self.questions_asked_in_current_topic >= 5:
            print(f"   (⚠️ 5 Questions asked. Next Topic...)")
            self._move_next_topic()
            return "SWITCHED_TOPIC"
            
        return "CONTINUE"

    def _move_next_topic(self):
        self.current_topic_index += 1
        self.questions_asked_in_current_topic = 0
        self.correct_answers_in_current_topic = 0
        self.difficulty_level = 5 
        if self.current_topic_index < len(self.topics):
            print(f"\n➡ Next Topic: {self.topics[self.current_topic_index]}...")

# --- 4. PDF HELPER ---
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

# --- 5. MAIN EXECUTION ---
if __name__ == "__main__":
    resume_path = "Brain\Alex_Taylor_Resume.pdf"
    
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
        print(f"\n[Difficulty {bot.difficulty_level}]")
        q = bot.generate_question()
        print(f"🤖 {q}") 
        
        ans = input("👤 ")
        status = bot.evaluate_answer(ans)
        
        if status == "SWITCHED_TOPIC" and bot.current_topic_index >= len(bot.topics):
            break

    print("\n" + "="*40)
    print("📊 FINAL RESULTS")
    print("="*40)
    
    if bot.total_questions_session > 0:
        print(f"Total Questions: {bot.total_questions_session}")
        print(f"🏆 TOTAL SCORE:   {bot.current_score}")
        avg = bot.current_score / bot.total_questions_session
        print(f"Average Rating:  {avg:.2f} / 10")
        if avg > 7: print("Verdict: HIRED! 🌟")
        elif avg > 4: print("Verdict: MAYBE. 😐")
        else: print("Verdict: REJECTED. ❌")