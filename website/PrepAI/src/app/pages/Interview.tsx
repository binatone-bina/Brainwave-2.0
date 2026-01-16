import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  X, 
  Send, 
  Clock,
  Eye,
  TrendingUp,
  MessageSquare,
  User,
  Briefcase,
  Award,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Progress } from '@/app/components/ui/progress';

interface Message {
  id: number;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

// Mock interview questions
const mockInterviewQuestions = [
  "Tell me about yourself and your background.",
  "What interests you most about this role?",
  "Can you describe a challenging project you've worked on?",
  "How do you handle stress and tight deadlines?",
  "Where do you see yourself in five years?",
  "Do you have any questions for me?"
];

// Mock informal conversation topics
const mockInformalTopics = [
  "So, what have you been up to lately? Tell me about your day!",
  "What are some hobbies or interests you're passionate about?",
  "If you could travel anywhere right now, where would you go and why?",
  "What's something new you've learned recently that excited you?",
  "Tell me about a memorable experience you've had this year.",
  "What kind of music, books, or shows are you into these days?"
];

export default function Interview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get mode from URL params (set from dashboard)
  const [mode, setMode] = useState<'interview' | 'informal'>('interview');
  
  // Interview state
  const [duration, setDuration] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  
  // Media state
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  
  // AI status
  const [aiStatus, setAiStatus] = useState<'listening' | 'analyzing' | 'generating' | 'idle'>('idle');
  
  // Live scores (mock data - will update dynamically)
  const [confidenceScore, setConfidenceScore] = useState(75);
  const [answerQuality, setAnswerQuality] = useState(82);
  const [fluencyScore, setFluencyScore] = useState(78);
  const [eyeContact, setEyeContact] = useState(85);
  const [postureScore, setPostureScore] = useState(80);
  
  // Resume context (mock data)
  const resumeContext = {
    name: "Sarah Johnson",
    role: "Senior Software Engineer",
    skills: ["React", "TypeScript", "Node.js", "AWS", "System Design"]
  };

  // Initialize mode from URL params on mount
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'informal') {
      setMode('informal');
    } else {
      setMode('interview');
    }
  }, [searchParams]);

  // Initialize messages when component mounts or mode changes
  useEffect(() => {
    const questions = mode === 'interview' ? mockInterviewQuestions : mockInformalTopics;
    const greeting = mode === 'interview' 
      ? "Hello! I'm excited to interview you today. Let's begin with the first question: " 
      : "Hey there! Let's have a casual chat. I'm curious - ";
    
    setMessages([
      { 
        id: 1, 
        type: 'ai', 
        content: greeting + questions[0],
        timestamp: new Date()
      }
    ]);
    setCurrentQuestionIndex(0);
  }, [mode]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Simulate AI response
  const generateAIResponse = (userAnswer: string) => {
    setAiStatus('analyzing');
    
    const questions = mode === 'interview' ? mockInterviewQuestions : mockInformalTopics;
    const informalAcknowledgments = ["Nice!", "Cool!", "Interesting!", "I hear you!", "That's great!"];
    const formalAcknowledgments = ["I see...", "Okay...", "That's interesting...", "Great...", "Understood..."];
    const acknowledgments = mode === 'interview' ? formalAcknowledgments : informalAcknowledgments;
    
    // Simulate random score updates
    setTimeout(() => {
      setConfidenceScore(Math.min(100, confidenceScore + Math.floor(Math.random() * 10 - 3)));
      setAnswerQuality(Math.min(100, answerQuality + Math.floor(Math.random() * 10 - 2)));
      setFluencyScore(Math.min(100, fluencyScore + Math.floor(Math.random() * 10 - 4)));
      
      setAiStatus('generating');
      
      setTimeout(() => {
        const randomAck = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
        
        // Add acknowledgment
        const ackMessage: Message = {
          id: messages.length + 1,
          type: 'ai',
          content: randomAck,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, ackMessage]);
        
        // Move to next question after brief pause
        setTimeout(() => {
          if (currentQuestionIndex < questions.length - 1) {
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);
            
            const transition = mode === 'interview' 
              ? "Let's move to the next question... " 
              : "Awesome! Here's another one - ";
            
            const nextQuestion: Message = {
              id: messages.length + 2,
              type: 'ai',
              content: transition + questions[nextIndex],
              timestamp: new Date()
            };
            setMessages(prev => [...prev, nextQuestion]);
          } else {
            const farewell = mode === 'interview'
              ? "Thank you for your time today. We've completed the interview. Click 'Finish Interview' to see your detailed report."
              : "That was fun! Thanks for chatting with me. Click 'Finish Chat' to see how you did!";
            
            const finalMessage: Message = {
              id: messages.length + 2,
              type: 'ai',
              content: farewell,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, finalMessage]);
          }
          setAiStatus('idle');
        }, 1500);
      }, 2000);
    }, 1500);
  };

  const handleSendAnswer = () => {
    if (userInput.trim()) {
      // Add user message
      const userMessage: Message = {
        id: messages.length + 1,
        type: 'user',
        content: userInput,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setUserInput('');
      
      // Simulate AI processing
      generateAIResponse(userInput);
    }
  };

  const handleEndSession = () => {
    setIsActive(false);
    const sessionType = mode === 'interview' ? 'interview' : 'chat session';
    const confirm = window.confirm(`Are you sure you want to end the ${sessionType}?`);
    if (confirm) {
      navigate('/home');
    } else {
      setIsActive(true);
    }
  };

  const handleFinishSession = () => {
    navigate(`/report?mode=${mode}`);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${
      mode === 'interview' 
        ? 'from-gray-900 via-indigo-900 to-purple-900' 
        : 'from-gray-900 via-pink-900 to-purple-900'
    }`}>
      {/* Top Bar */}
      <div className="bg-gray-900/50 backdrop-blur-md border-b border-gray-700/50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 bg-gradient-to-br rounded-xl flex items-center justify-center ${
                mode === 'interview' 
                  ? 'from-teal-400 to-indigo-500' 
                  : 'from-pink-400 to-purple-500'
              }`}>
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {mode === 'interview' ? 'AI Mock Interview' : 'AI Conversation Practice'}
                </h1>
                <p className="text-sm text-gray-400">Practice Session</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
                <Clock className={`w-5 h-5 ${mode === 'interview' ? 'text-teal-400' : 'text-pink-400'}`} />
                <span className="text-white font-mono text-lg">{formatDuration(duration)}</span>
              </div>
              
              <Button
                onClick={handleEndSession}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-500"
              >
                <X className="w-4 h-4 mr-2" />
                End {mode === 'interview' ? 'Interview' : 'Chat'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT SIDE - Camera and Chat */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Frame - LARGEST ELEMENT */}
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6">
              <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden relative">
                {cameraEnabled ? (
                  <div className={`absolute inset-0 flex items-center justify-center ${
                    mode === 'interview' 
                      ? 'bg-gradient-to-br from-indigo-500/20 to-teal-500/20' 
                      : 'bg-gradient-to-br from-pink-500/20 to-purple-500/20'
                  }`}>
                    <div className="text-center">
                      <div className={`w-48 h-48 bg-gradient-to-br rounded-full mx-auto mb-4 flex items-center justify-center ${
                        mode === 'interview' 
                          ? 'from-indigo-500 to-teal-500' 
                          : 'from-pink-500 to-purple-500'
                      }`}>
                        <User className="w-24 h-24 text-white" />
                      </div>
                      <p className="text-gray-400 text-lg">Camera Active</p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <VideoOff className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">Camera Off</p>
                    </div>
                  </div>
                )}
                
                {/* Media Controls */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                  <button
                    onClick={() => setCameraEnabled(!cameraEnabled)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                      cameraEnabled 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {cameraEnabled ? (
                      <Video className="w-7 h-7 text-white" />
                    ) : (
                      <VideoOff className="w-7 h-7 text-white" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => setMicEnabled(!micEnabled)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                      micEnabled 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {micEnabled ? (
                      <Mic className="w-7 h-7 text-white" />
                    ) : (
                      <MicOff className="w-7 h-7 text-white" />
                    )}
                  </button>
                </div>
              </div>

              {/* Analysis Text */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
                  <Eye className={`w-4 h-4 ${mode === 'interview' ? 'text-teal-400' : 'text-pink-400'}`} />
                  Analyzing eye contact, posture, and tone...
                </p>
              </div>
            </div>

            {/* AI Chat - UNDER CAMERA */}
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 bg-gradient-to-br rounded-full flex items-center justify-center ${
                  mode === 'interview' 
                    ? 'from-purple-500 to-indigo-500' 
                    : 'from-pink-500 to-purple-500'
                }`}>
                  <MessageSquare className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {mode === 'interview' ? 'AI Interviewer' : 'AI Conversation Partner'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {aiStatus === 'listening' && '🎤 Listening...'}
                    {aiStatus === 'analyzing' && '🔍 Analyzing response...'}
                    {aiStatus === 'generating' && (mode === 'interview' ? '✨ Generating next question...' : '✨ Thinking...')}
                    {aiStatus === 'idle' && '✅ Ready'}
                  </p>
                </div>
              </div>

              {/* Chat History */}
              <div className="bg-gray-900/50 rounded-xl p-4 h-[400px] overflow-y-auto mb-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.type === 'user'
                          ? mode === 'interview' 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-pink-600 text-white'
                          : 'bg-gray-700 text-gray-100'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className="text-xs mt-2 opacity-60">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="flex gap-3">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendAnswer()}
                  placeholder={mode === 'interview' ? "Type your answer here (or speak)..." : "Type your response here (or speak)..."}
                  className="flex-1 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                  disabled={aiStatus !== 'idle'}
                />
                <Button
                  onClick={handleSendAnswer}
                  disabled={!userInput.trim() || aiStatus !== 'idle'}
                  className={mode === 'interview' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-pink-600 hover:bg-pink-700'}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {mode === 'interview' ? 'Answer' : 'Send'}
                </Button>
              </div>
            </div>

            {/* Finish Button */}
            {currentQuestionIndex >= (mode === 'interview' ? mockInterviewQuestions : mockInformalTopics).length - 1 && messages.length > 6 && (
              <div className={`bg-gradient-to-r rounded-2xl p-6 text-center ${
                mode === 'interview' 
                  ? 'from-indigo-600 to-teal-600' 
                  : 'from-pink-600 to-purple-600'
              }`}>
                <h3 className="text-white font-bold text-xl mb-2">
                  {mode === 'interview' ? 'Interview Complete!' : 'Chat Complete!'}
                </h3>
                <p className={mode === 'interview' ? 'text-indigo-100 mb-4' : 'text-pink-100 mb-4'}>
                  {mode === 'interview' 
                    ? 'Great job! Click below to view your detailed performance report.' 
                    : 'That was great! Click below to see how you did.'}
                </p>
                <Button
                  onClick={handleFinishSession}
                  className={`font-semibold ${
                    mode === 'interview' 
                      ? 'bg-white text-indigo-600 hover:bg-indigo-50' 
                      : 'bg-white text-pink-600 hover:bg-pink-50'
                  }`}
                  size="lg"
                >
                  View Detailed Report
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>

          {/* RIGHT SIDE - Resume Context and Live Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resume Context Panel - Interview Mode Only */}
            {mode === 'interview' && (
              <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6">
                <h3 className="text-white font-semibold mb-6 flex items-center gap-2 text-lg">
                  <Briefcase className="w-6 h-6 text-indigo-400" />
                  Resume Context
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Candidate</p>
                    <p className="text-white font-medium text-lg">{resumeContext.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Role</p>
                    <p className="text-white font-medium">{resumeContext.role}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Key Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {resumeContext.skills.map((skill, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg text-sm border border-indigo-500/30"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Live Analysis - UNDER RESUME CONTEXT (or standalone in Informal mode) */}
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className={`w-5 h-5 ${mode === 'interview' ? 'text-teal-400' : 'text-pink-400'}`} />
                Live Analysis
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Confidence</span>
                    <span className="text-white font-semibold">{confidenceScore}%</span>
                  </div>
                  <Progress value={confidenceScore} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Eye Contact</span>
                    <span className="text-white font-semibold">{eyeContact}%</span>
                  </div>
                  <Progress value={eyeContact} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Posture</span>
                    <span className="text-white font-semibold">{postureScore}%</span>
                  </div>
                  <Progress value={postureScore} className="h-2" />
                </div>
              </div>

              {/* Performance Scores */}
              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Live Performance Scoring
                </h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-2 relative">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          className="text-gray-700"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 32}`}
                          strokeDashoffset={`${2 * Math.PI * 32 * (1 - confidenceScore / 100)}`}
                          className={mode === 'interview' ? 'text-indigo-500' : 'text-pink-500'}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">{confidenceScore}</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs">Confidence</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-2 relative">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          className="text-gray-700"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 32}`}
                          strokeDashoffset={`${2 * Math.PI * 32 * (1 - answerQuality / 100)}`}
                          className={mode === 'interview' ? 'text-teal-500' : 'text-purple-400'}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">{answerQuality}</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs">{mode === 'interview' ? 'Answer Quality' : 'Engagement'}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-2 relative">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          className="text-gray-700"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 32}`}
                          strokeDashoffset={`${2 * Math.PI * 32 * (1 - fluencyScore / 100)}`}
                          className={mode === 'interview' ? 'text-purple-500' : 'text-rose-400'}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">{fluencyScore}</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs">{mode === 'interview' ? 'Fluency' : 'Naturalness'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}