import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Video, 
  FileText, 
  User, 
  LogOut, 
  LayoutDashboard,
  Play,
  Download,
  Save,
  History,
  TrendingUp,
  MessageSquare,
  Eye,
  Users,
  Smile,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Target,
  Lightbulb,
  BookOpen,
  Activity,
  Heart,
  MessageCircle,
  Clock
} from 'lucide-react';
import { Progress } from '@/app/components/ui/progress';
import { Button } from '@/app/components/ui/button';

// Mock data for the INTERVIEW report
const mockInterviewReportData = {
  interviewDate: '2026-01-13',
  duration: '22:45',
  overallScore: {
    success: 85,
    confidence: 82
  },
  scoreBreakdown: {
    answerQuality: 88,
    voiceConfidence: 85,
    faceConfidence: 78
  },
  strengths: [
    'Strong technical knowledge and clear explanations',
    'Good eye contact throughout the interview',
    'Confident voice tone and steady pace',
    'Well-structured answers with concrete examples',
    'Professional demeanor and positive attitude'
  ],
  weaknesses: [
    'Occasional filler words ("um", "like") during complex answers',
    'Some nervous hand movements when discussing challenges',
    'Could improve smile frequency and facial expressiveness',
    'Tendency to speak quickly when nervous',
    'Limited pauses between thoughts'
  ],
  nonVerbal: {
    eyeContact: {
      score: 85,
      feedback: 'Excellent eye contact maintained throughout. You looked at the camera 85% of the time, showing confidence and engagement.'
    },
    posture: {
      score: 80,
      feedback: 'Good upright posture. Minor slouching detected in the last 5 minutes. Try to maintain energy throughout.'
    },
    facialExpressions: {
      score: 72,
      feedback: 'Neutral expressions most of the time. Try to smile more and show enthusiasm, especially when discussing your achievements.'
    },
    nervousMovements: {
      score: 75,
      feedback: 'Some hand fidgeting detected during difficult questions. Practice keeping hands still or use purposeful gestures.'
    }
  },
  answers: [
    {
      id: 1,
      question: 'Tell me about yourself and your background.',
      userAnswer: 'I\'m a software engineer with 5 years of experience in full-stack development. I\'ve worked primarily with React and Node.js, building scalable web applications...',
      aiFeedback: 'Great answer! You provided a clear structure and highlighted relevant experience.',
      rating: 'good'
    },
    {
      id: 2,
      question: 'What interests you most about this role?',
      userAnswer: 'I\'m really excited about the opportunity to work on challenging problems and, um, the company culture seems great...',
      aiFeedback: 'Good start, but be more specific about what excites you. Mention concrete aspects of the role.',
      rating: 'average'
    },
    {
      id: 3,
      question: 'Can you describe a challenging project you\'ve worked on?',
      userAnswer: 'Sure, I worked on a project that involved migrating our legacy system to a microservices architecture. We faced multiple challenges including...',
      aiFeedback: 'Excellent! You used the STAR method effectively and provided measurable results.',
      rating: 'good'
    },
    {
      id: 4,
      question: 'How do you handle stress and tight deadlines?',
      userAnswer: 'I, um, usually try to stay calm and prioritize tasks. I break things down into smaller pieces...',
      aiFeedback: 'The approach is good, but reduce filler words and provide a specific example to strengthen your answer.',
      rating: 'average'
    },
    {
      id: 5,
      question: 'Where do you see yourself in five years?',
      userAnswer: 'In five years, I see myself in a senior leadership role, mentoring junior developers and driving technical strategy...',
      aiFeedback: 'Strong answer showing ambition and alignment with company growth. Well articulated.',
      rating: 'good'
    }
  ],
  improvementPlan: [
    {
      category: 'Speaking Tips',
      icon: MessageSquare,
      suggestions: [
        'Practice pausing for 1-2 seconds before answering to gather your thoughts',
        'Record yourself and identify filler words, then practice replacing them with pauses',
        'Speak at 140-160 words per minute for optimal clarity',
        'Use the STAR method (Situation, Task, Action, Result) for behavioral questions'
      ]
    },
    {
      category: 'Knowledge Gaps',
      icon: BookOpen,
      suggestions: [
        'Research the company\'s recent projects and news before interviews',
        'Prepare 3-4 specific examples for common interview questions',
        'Review key technical concepts related to the role',
        'Prepare thoughtful questions to ask the interviewer'
      ]
    },
    {
      category: 'Body Language',
      icon: Activity,
      suggestions: [
        'Practice power poses for 2 minutes before interviews to boost confidence',
        'Maintain eye contact 60-70% of the time (look away naturally)',
        'Use purposeful hand gestures to emphasize key points',
        'Smile genuinely when appropriate, especially during introductions'
      ]
    },
    {
      category: 'Practice Recommendations',
      icon: Target,
      suggestions: [
        'Schedule 2-3 mock interviews per week to build confidence',
        'Practice with different interview formats (technical, behavioral, case)',
        'Get feedback from peers or mentors on your performance',
        'Review and refine your answers after each practice session'
      ]
    }
  ]
};

// Mock data for the INFORMAL conversation report
const mockInformalReportData = {
  sessionDate: '2026-01-12',
  duration: '18:30',
  overallScore: {
    socialConfidence: 82,
    engagement: 85
  },
  scoreBreakdown: {
    socialConfidence: 82,
    eyeContact: 88,
    engagement: 85,
    talkListenRatio: 65, // 65% balanced (ideal is 50-50)
    naturalness: 80
  },
  strengths: [
    'Very friendly and approachable demeanor throughout the conversation',
    'Excellent eye contact that made the conversation feel natural',
    'Showed genuine interest through active listening and follow-up questions',
    'Natural body language without nervous fidgeting',
    'Warm smile and positive facial expressions'
  ],
  weaknesses: [
    'Talked slightly more than listened - aim for better balance',
    'A few moments of hesitation when changing topics',
    'Could ask more open-ended questions to deepen the conversation',
    'Occasional tendency to fill silences too quickly',
    'Some repeated phrases when discussing similar topics'
  ],
  conversationAnalysis: {
    friendliness: {
      score: 88,
      feedback: 'You came across as very friendly and warm. Your tone was welcoming, and you showed genuine interest in the conversation partner.'
    },
    relaxation: {
      score: 78,
      feedback: 'Overall relaxed demeanor, but there were a few moments where you seemed slightly tense when the conversation took unexpected turns.'
    },
    confidence: {
      score: 82,
      feedback: 'Good social confidence. You spoke clearly and didn\'t shy away from sharing your thoughts and opinions.'
    },
    interruptions: {
      score: 85,
      feedback: 'You were respectful and rarely interrupted. Only 2 minor interruptions detected, showing good conversation awareness.'
    }
  },
  bodyLanguageAnalysis: {
    eyeContact: {
      score: 88,
      feedback: 'Excellent natural eye contact. You maintained eye contact 88% of the time without staring, creating a comfortable connection.'
    },
    facialExpressions: {
      score: 85,
      feedback: 'Great use of smiles and natural expressions. Your face showed genuine reactions to what was being said.'
    },
    posture: {
      score: 80,
      feedback: 'Relaxed and open posture throughout. Leaning in slightly showed engagement and interest.'
    },
    gestures: {
      score: 82,
      feedback: 'Natural hand gestures that complemented your speech. No nervous movements detected.'
    }
  },
  conversationTopics: [
    {
      id: 1,
      topic: 'Hobbies and interests',
      engagement: 90,
      feedback: 'You were very animated when discussing your hobbies. Great energy and enthusiasm!',
      rating: 'good'
    },
    {
      id: 2,
      topic: 'Recent experiences',
      engagement: 82,
      feedback: 'Good storytelling, but could add more descriptive details to make it more engaging.',
      rating: 'good'
    },
    {
      id: 3,
      topic: 'Future plans',
      engagement: 75,
      feedback: 'Seemed a bit hesitant here. Practice expressing your aspirations with more confidence.',
      rating: 'average'
    }
  ],
  improvementPlan: [
    {
      category: 'Conversation Balance',
      icon: Users,
      suggestions: [
        'Practice the 50-50 rule: aim to talk and listen equally',
        'Ask more follow-up questions to encourage others to share',
        'Count to 3 before responding to avoid filling every silence',
        'Use phrases like "Tell me more about..." to invite deeper sharing'
      ]
    },
    {
      category: 'Social Confidence',
      icon: Smile,
      suggestions: [
        'Practice small talk scenarios daily to build comfort',
        'Embrace pauses in conversation - they\'re natural and okay',
        'Share personal stories to create connection and vulnerability',
        'Remember: most people are focused on themselves, not judging you'
      ]
    },
    {
      category: 'Active Listening',
      icon: MessageCircle,
      suggestions: [
        'Use verbal nods like "I see", "That makes sense", "Interesting"',
        'Paraphrase what you heard to show understanding',
        'Remember key details and reference them later in conversation',
        'Put away distractions and give full attention to the speaker'
      ]
    },
    {
      category: 'Body Language Tips',
      icon: Activity,
      suggestions: [
        'Keep your shoulders relaxed and posture open',
        'Smile naturally when appropriate, especially when greeting',
        'Use hand gestures to emphasize points but keep them controlled',
        'Mirror the other person\'s energy level subtly to build rapport'
      ]
    }
  ]
};

export default function Report() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'interview' | 'informal'>('interview');

  // Get mode from URL params
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'informal') {
      setMode('informal');
    } else {
      setMode('interview');
    }
  }, [searchParams]);

  const reportData = mode === 'interview' ? mockInterviewReportData : mockInformalReportData;

  const handleLogout = () => {
    navigate('/');
  };

  const handleStartNewSession = () => {
    navigate('/interview');
  };

  const handleSaveReport = () => {
    console.log('Saving report...');
    alert('Report saved successfully!');
  };

  const handleDownloadPDF = () => {
    console.log('Downloading PDF...');
    alert('PDF download started!');
  };

  const handleViewHistory = () => {
    console.log('Viewing history...');
    navigate('/home');
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'bg-teal-500/20 text-teal-400 border-teal-500/50';
      case 'average':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'needs improvement':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'good':
        return <CheckCircle className="w-4 h-4" />;
      case 'average':
        return <AlertCircle className="w-4 h-4" />;
      case 'needs improvement':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${
      mode === 'interview' 
        ? 'bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900'
        : 'bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900'
    }`}>
      {/* Navigation Bar */}
      <nav className="bg-gray-900/50 backdrop-blur-md border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-indigo-500 rounded-xl flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">PrepAI</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => navigate('/home')}
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg font-medium transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={handleStartNewSession}
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg font-medium transition-colors"
              >
                <Video className="w-4 h-4" />
                Start {mode === 'interview' ? 'Interview' : 'Session'}
              </button>
              <button className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                mode === 'interview' 
                  ? 'text-teal-400 bg-teal-500/10' 
                  : 'text-cyan-400 bg-cyan-500/10'
              }`}>
                <FileText className="w-4 h-4" />
                Reports
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg font-medium transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {mode === 'interview' ? 'Interview Performance Report' : 'Conversation Session Report'}
              </h1>
              <p className="text-xl text-gray-300">
                {mode === 'interview' 
                  ? "Here's how you did in your mock interview" 
                  : "Here's how you did in your casual conversation practice"
                }
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {mode === 'interview' 
                  ? `Interview Date: ${mockInterviewReportData.interviewDate} • Duration: ${mockInterviewReportData.duration}`
                  : `Session Date: ${mockInformalReportData.sessionDate} • Duration: ${mockInformalReportData.duration}`
                }
              </p>
            </div>
            <Button
              onClick={handleStartNewSession}
              className={`h-12 px-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all ${
                mode === 'interview'
                  ? 'bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700'
                  : 'bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700'
              } text-white`}
            >
              <Video className="w-5 h-5 mr-2" />
              Start New {mode === 'interview' ? 'Interview' : 'Session'}
            </Button>
          </div>
        </div>

        {/* INTERVIEW MODE REPORT */}
        {mode === 'interview' && (
          <>
            {/* Overall Score Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Success Score Card */}
              <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-300">Success Score</h3>
                    <TrendingUp className="w-6 h-6 text-teal-400" />
                  </div>
                  
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <svg className="w-48 h-48 transform -rotate-90">
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-gray-700"
                        />
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 88}`}
                          strokeDashoffset={`${2 * Math.PI * 88 * (1 - mockInterviewReportData.overallScore.success / 100)}`}
                          className="text-teal-400"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-white">{mockInterviewReportData.overallScore.success}</div>
                          <div className="text-gray-400 text-sm">out of 100</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-center text-sm text-gray-400">
                    Success = 70% Answers + 30% Confidence
                  </p>
                </div>
              </div>

              {/* Confidence Score Card */}
              <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-300">Confidence Score</h3>
                    <Smile className="w-6 h-6 text-indigo-400" />
                  </div>
                  
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <svg className="w-48 h-48 transform -rotate-90">
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-gray-700"
                        />
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 88}`}
                          strokeDashoffset={`${2 * Math.PI * 88 * (1 - mockInterviewReportData.overallScore.confidence / 100)}`}
                          className="text-indigo-400"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-white">{mockInterviewReportData.overallScore.confidence}</div>
                          <div className="text-gray-400 text-sm">out of 100</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-center text-sm text-gray-400">
                    Based on voice, face, and body language analysis
                  </p>
                </div>
              </div>
            </div>

            {/* Score Breakdown Section */}
            <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 shadow-xl mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Score Breakdown</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium">Answer Quality</span>
                    <span className="text-2xl font-bold text-teal-400">{mockInterviewReportData.scoreBreakdown.answerQuality}%</span>
                  </div>
                  <Progress value={mockInterviewReportData.scoreBreakdown.answerQuality} className="h-3" />
                  <p className="text-sm text-gray-400">Content and structure of your responses</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium">Voice Confidence</span>
                    <span className="text-2xl font-bold text-indigo-400">{mockInterviewReportData.scoreBreakdown.voiceConfidence}%</span>
                  </div>
                  <Progress value={mockInterviewReportData.scoreBreakdown.voiceConfidence} className="h-3" />
                  <p className="text-sm text-gray-400">Tone, pace, and vocal clarity</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium">Face Confidence</span>
                    <span className="text-2xl font-bold text-purple-400">{mockInterviewReportData.scoreBreakdown.faceConfidence}%</span>
                  </div>
                  <Progress value={mockInterviewReportData.scoreBreakdown.faceConfidence} className="h-3" />
                  <p className="text-sm text-gray-400">Facial expressions and eye contact</p>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-teal-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Your Strengths</h2>
                </div>
                
                <div className="space-y-4">
                  {mockInterviewReportData.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-gray-300">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Areas to Improve</h2>
                </div>
                
                <div className="space-y-4">
                  {mockInterviewReportData.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-gray-300">{weakness}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Non-Verbal Feedback Section */}
            <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 shadow-xl mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Non-Verbal Feedback</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                        <Eye className="w-5 h-5 text-indigo-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Eye Contact</h3>
                    </div>
                    <span className="text-2xl font-bold text-indigo-400">{mockInterviewReportData.nonVerbal.eyeContact.score}%</span>
                  </div>
                  <Progress value={mockInterviewReportData.nonVerbal.eyeContact.score} className="h-2 mb-3" />
                  <p className="text-sm text-gray-400">{mockInterviewReportData.nonVerbal.eyeContact.feedback}</p>
                </div>

                <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-teal-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Posture</h3>
                    </div>
                    <span className="text-2xl font-bold text-teal-400">{mockInterviewReportData.nonVerbal.posture.score}%</span>
                  </div>
                  <Progress value={mockInterviewReportData.nonVerbal.posture.score} className="h-2 mb-3" />
                  <p className="text-sm text-gray-400">{mockInterviewReportData.nonVerbal.posture.feedback}</p>
                </div>

                <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Smile className="w-5 h-5 text-purple-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Facial Expressions</h3>
                    </div>
                    <span className="text-2xl font-bold text-purple-400">{mockInterviewReportData.nonVerbal.facialExpressions.score}%</span>
                  </div>
                  <Progress value={mockInterviewReportData.nonVerbal.facialExpressions.score} className="h-2 mb-3" />
                  <p className="text-sm text-gray-400">{mockInterviewReportData.nonVerbal.facialExpressions.feedback}</p>
                </div>

                <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-cyan-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Nervous Movements</h3>
                    </div>
                    <span className="text-2xl font-bold text-cyan-400">{mockInterviewReportData.nonVerbal.nervousMovements.score}%</span>
                  </div>
                  <Progress value={mockInterviewReportData.nonVerbal.nervousMovements.score} className="h-2 mb-3" />
                  <p className="text-sm text-gray-400">{mockInterviewReportData.nonVerbal.nervousMovements.feedback}</p>
                </div>
              </div>
            </div>

            {/* Answer Review Section */}
            <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 shadow-xl mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Answer Review</h2>
              
              <div className="space-y-4">
                {mockInterviewReportData.answers.map((answer) => (
                  <div key={answer.id} className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/30">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-gray-400">Question {answer.id}</span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getRatingColor(answer.rating)}`}>
                            {getRatingIcon(answer.rating)}
                            {answer.rating.charAt(0).toUpperCase() + answer.rating.slice(1)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-3">{answer.question}</h3>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Your Answer:</h4>
                      <p className="text-gray-300 bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                        {answer.userAnswer}
                      </p>
                    </div>
                    
                    <div className="flex items-start gap-3 bg-indigo-500/10 rounded-lg p-4 border border-indigo-500/20">
                      <MessageSquare className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-indigo-300 mb-1">AI Feedback:</h4>
                        <p className="text-gray-300">{answer.aiFeedback}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* INFORMAL MODE REPORT */}
        {mode === 'informal' && (
          <>
            {/* Overall Score Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Social Confidence Score Card */}
              <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-300">Social Confidence</h3>
                    <Smile className="w-6 h-6 text-teal-400" />
                  </div>
                  
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <svg className="w-48 h-48 transform -rotate-90">
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-gray-700"
                        />
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 88}`}
                          strokeDashoffset={`${2 * Math.PI * 88 * (1 - mockInformalReportData.overallScore.socialConfidence / 100)}`}
                          className="text-teal-400"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-white">{mockInformalReportData.overallScore.socialConfidence}</div>
                          <div className="text-gray-400 text-sm">out of 100</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-center text-sm text-gray-400">
                    Overall ease and comfort in conversation
                  </p>
                </div>
              </div>

              {/* Engagement Score Card */}
              <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-300">Engagement</h3>
                    <Heart className="w-6 h-6 text-cyan-400" />
                  </div>
                  
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <svg className="w-48 h-48 transform -rotate-90">
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-gray-700"
                        />
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 88}`}
                          strokeDashoffset={`${2 * Math.PI * 88 * (1 - mockInformalReportData.overallScore.engagement / 100)}`}
                          className="text-cyan-400"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-white">{mockInformalReportData.overallScore.engagement}</div>
                          <div className="text-gray-400 text-sm">out of 100</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-center text-sm text-gray-400">
                    How engaged and interested you appeared
                  </p>
                </div>
              </div>
            </div>

            {/* Score Breakdown Section */}
            <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 shadow-xl mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Performance Breakdown</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium">Social Confidence</span>
                    <span className="text-2xl font-bold text-teal-400">{mockInformalReportData.scoreBreakdown.socialConfidence}%</span>
                  </div>
                  <Progress value={mockInformalReportData.scoreBreakdown.socialConfidence} className="h-3" />
                  <p className="text-sm text-gray-400">Comfort and ease in conversation</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium">Eye Contact</span>
                    <span className="text-2xl font-bold text-cyan-400">{mockInformalReportData.scoreBreakdown.eyeContact}%</span>
                  </div>
                  <Progress value={mockInformalReportData.scoreBreakdown.eyeContact} className="h-3" />
                  <p className="text-sm text-gray-400">Natural and comfortable eye contact</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium">Engagement</span>
                    <span className="text-2xl font-bold text-emerald-400">{mockInformalReportData.scoreBreakdown.engagement}%</span>
                  </div>
                  <Progress value={mockInformalReportData.scoreBreakdown.engagement} className="h-3" />
                  <p className="text-sm text-gray-400">Interest and active participation</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium">Talk/Listen Balance</span>
                    <span className="text-2xl font-bold text-sky-400">{mockInformalReportData.scoreBreakdown.talkListenRatio}%</span>
                  </div>
                  <Progress value={mockInformalReportData.scoreBreakdown.talkListenRatio} className="h-3" />
                  <p className="text-sm text-gray-400">Balance between speaking and listening</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium">Naturalness</span>
                    <span className="text-2xl font-bold text-purple-400">{mockInformalReportData.scoreBreakdown.naturalness}%</span>
                  </div>
                  <Progress value={mockInformalReportData.scoreBreakdown.naturalness} className="h-3" />
                  <p className="text-sm text-gray-400">How natural and relaxed you seemed</p>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-teal-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Your Strengths</h2>
                </div>
                
                <div className="space-y-4">
                  {mockInformalReportData.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-gray-300">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Areas to Improve</h2>
                </div>
                
                <div className="space-y-4">
                  {mockInformalReportData.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-gray-300">{weakness}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Conversation Analysis Section */}
            <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 shadow-xl mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Conversation Analysis</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                        <Smile className="w-5 h-5 text-teal-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Friendliness</h3>
                    </div>
                    <span className="text-2xl font-bold text-teal-400">{mockInformalReportData.conversationAnalysis.friendliness.score}%</span>
                  </div>
                  <Progress value={mockInformalReportData.conversationAnalysis.friendliness.score} className="h-2 mb-3" />
                  <p className="text-sm text-gray-400">{mockInformalReportData.conversationAnalysis.friendliness.feedback}</p>
                </div>

                <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <Heart className="w-5 h-5 text-cyan-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Relaxation</h3>
                    </div>
                    <span className="text-2xl font-bold text-cyan-400">{mockInformalReportData.conversationAnalysis.relaxation.score}%</span>
                  </div>
                  <Progress value={mockInformalReportData.conversationAnalysis.relaxation.score} className="h-2 mb-3" />
                  <p className="text-sm text-gray-400">{mockInformalReportData.conversationAnalysis.relaxation.feedback}</p>
                </div>

                <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Confidence</h3>
                    </div>
                    <span className="text-2xl font-bold text-emerald-400">{mockInformalReportData.conversationAnalysis.confidence.score}%</span>
                  </div>
                  <Progress value={mockInformalReportData.conversationAnalysis.confidence.score} className="h-2 mb-3" />
                  <p className="text-sm text-gray-400">{mockInformalReportData.conversationAnalysis.confidence.feedback}</p>
                </div>

                <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-purple-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Interruptions/Hesitations</h3>
                    </div>
                    <span className="text-2xl font-bold text-purple-400">{mockInformalReportData.conversationAnalysis.interruptions.score}%</span>
                  </div>
                  <Progress value={mockInformalReportData.conversationAnalysis.interruptions.score} className="h-2 mb-3" />
                  <p className="text-sm text-gray-400">{mockInformalReportData.conversationAnalysis.interruptions.feedback}</p>
                </div>
              </div>
            </div>

            {/* Conversation Topics Review */}
            <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 shadow-xl mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Conversation Topics Review</h2>
              
              <div className="space-y-4">
                {mockInformalReportData.conversationTopics.map((topic) => (
                  <div key={topic.id} className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/30">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-gray-400">Topic {topic.id}</span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getRatingColor(topic.rating)}`}>
                            {getRatingIcon(topic.rating)}
                            {topic.rating.charAt(0).toUpperCase() + topic.rating.slice(1)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-3">{topic.topic}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-teal-400">{topic.engagement}%</span>
                        <p className="text-xs text-gray-400">Engagement</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 bg-teal-500/10 rounded-lg p-4 border border-teal-500/20">
                      <MessageCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-teal-300 mb-1">AI Feedback:</h4>
                        <p className="text-gray-300">{topic.feedback}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Improvement Plan Section (shared for both modes) */}
        <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 shadow-xl mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              mode === 'interview' 
                ? 'bg-gradient-to-br from-teal-500 to-indigo-600' 
                : 'bg-gradient-to-br from-cyan-500 to-teal-600'
            }`}>
              <Target className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Personalized Improvement Plan</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reportData.improvementPlan.map((plan, index) => {
              const IconComponent = plan.icon;
              return (
                <div key={index} className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      mode === 'interview' 
                        ? 'bg-indigo-500/20' 
                        : 'bg-teal-500/20'
                    }`}>
                      <IconComponent className={`w-5 h-5 ${
                        mode === 'interview' 
                          ? 'text-indigo-400' 
                          : 'text-teal-400'
                      }`} />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{plan.category}</h3>
                  </div>
                  
                  <ul className="space-y-3">
                    {plan.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <ArrowRight className={`w-4 h-4 flex-shrink-0 mt-1 ${
                          mode === 'interview' 
                            ? 'text-teal-400' 
                            : 'text-cyan-400'
                        }`} />
                        <span className="text-gray-300 text-sm">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* History & Actions Section */}
        <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 shadow-xl mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Save & Share Your Report</h2>
          
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleSaveReport}
              className={`text-white h-12 px-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all ${
                mode === 'interview' 
                  ? 'bg-teal-600 hover:bg-teal-700' 
                  : 'bg-cyan-600 hover:bg-cyan-700'
              }`}
            >
              <Save className="w-5 h-5 mr-2" />
              Save Report
            </Button>
            
            <Button
              onClick={handleDownloadPDF}
              className={`text-white h-12 px-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all ${
                mode === 'interview' 
                  ? 'bg-indigo-600 hover:bg-indigo-700' 
                  : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              <Download className="w-5 h-5 mr-2" />
              Download PDF
            </Button>
            
            <Button
              onClick={handleViewHistory}
              className={`text-white h-12 px-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all ${
                mode === 'interview' 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <History className="w-5 h-5 mr-2" />
              View {mode === 'interview' ? 'Interview' : 'Session'} History
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
