import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Video, Mic, MicOff, VideoOff, Send, Clock, TrendingUp, ArrowRight
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

const mockInterviewQuestions = [
  "Tell me about yourself and your background.",
  "What interests you most about this role?",
  "Can you describe a challenging project you've worked on?",
  "How do you handle stress and tight deadlines?",
  "Where do you see yourself in five years?",
  "Do you have any questions for me?"
];

const mockInformalTopics = [
  "So, what have you been up to lately?",
  "What are some hobbies you're passionate about?",
  "If you could travel anywhere, where would you go?",
  "What's something new you've learned recently?",
];

export default function Interview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Mode State
  const [mode, setMode] = useState<'interview' | 'informal'>('interview');
  
  // Logic State
  const [duration, setDuration] = useState(0);
  const [isActive, setIsActive] = useState(true); // <--- Controls the timer
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  
  // Media State
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  
  // AI Status
  const [aiStatus, setAiStatus] = useState<'listening' | 'analyzing' | 'generating' | 'idle'>('idle');
  
  // Scores
  const [answerQuality, setAnswerQuality] = useState(0);
  const [attention, setAttention] = useState(0);
  const [stability, setStability] = useState(0);
  const [smoothness, setSmoothness] = useState(0);
  const [confidenceScore, setConfidenceScore] = useState(0);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
  // 1. ADD THIS REF TO TRACK TIME ACCURATELY FOR DATABASE
  const durationRef = useRef(0); 

  const resumeContext = {
    name: "Sarah Johnson",
    role: "Senior Software Engineer",
    skills: ["React", "TypeScript", "Node.js", "AWS", "System Design"]
  };

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    setMode(modeParam === 'informal' ? 'informal' : 'interview');
  }, [searchParams]);

  useEffect(() => {
    const questions = mode === 'interview' ? mockInterviewQuestions : mockInformalTopics;
    const greeting = mode === 'interview' 
      ? "Hello! Let's begin with the first question: " 
      : "Hey! Let's have a casual chat. ";
    
    setMessages([{ 
      id: 1, type: 'ai', content: greeting + questions[0], timestamp: new Date()
    }]);
    setCurrentQuestionIndex(0);
  }, [mode]);

  // 2. UPDATED TIMER LOGIC
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setDuration(prev => {
          const newTime = prev + 1;
          durationRef.current = newTime; // Sync ref with state
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 3. WEBSOCKET LOGIC
  useEffect(() => {
    let stream: MediaStream | null = null;
    let intervalId: NodeJS.Timeout;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 }, 
            audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
             videoRef.current?.play();
          };
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    if (cameraEnabled) startCamera();

    wsRef.current = new WebSocket("ws://localhost:8000/ws");
    
    wsRef.current.onopen = () => console.log("✅ Connected to Python AI Server");
    
    wsRef.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'realtime') {
        setAttention(data.attention || 0);
        setStability(data.stability || 0);
        setSmoothness(data.smoothness || 0);
        setConfidenceScore(data.confidence || 0);
      } 
      else if (data.type === 'final_report') {
        console.log("🏆 FINAL REPORT RECEIVED:", data);
        
        // Stop Everything
        setCameraEnabled(false);
        setIsActive(false); // Ensure timer stops if not already
        
        // Save
        await saveInterviewData(data);
      }
    };

    intervalId = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN && videoRef.current && canvasRef.current && cameraEnabled && videoRef.current.readyState === 4) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.4); 
          wsRef.current.send(base64Image);
        }
      }
    }, 100); 

    return () => {
      clearInterval(intervalId);
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (wsRef.current) wsRef.current.close();
    };
  }, [cameraEnabled]);

  // Helper to extract data from JWT token
  const getUserIdFromToken = () => {
    try {
      let token = localStorage.getItem('token');
      if (!token) return "guest_user";

      // 1. Clean the token (Remove 'Bearer ' if it exists)
      if (token.startsWith('Bearer ')) {
        token = token.slice(7).trim();
      }

      // 2. Decode the payload safely
      const base64Url = token.split('.')[1];
      if (!base64Url) return "invalid_token";

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const decoded = JSON.parse(jsonPayload);
      
      // 🔍 DEBUG: This will print your token data in the console!
      console.log("🔍 DECIPHERED TOKEN:", decoded); 

      // 3. Try to find the ID in all common locations
      // Check 'id', '_id', 'userId', 'sub' (subject), or nested inside 'user' object
      return decoded.id || decoded._id || decoded.userId || decoded.sub || decoded.user?.id || decoded.user?._id || "unknown_user";
    
    } catch (error) {
      console.error("❌ Token Decode Error:", error);
      return "guest_user";
    }
  };

  // 4. UPDATED SAVE FUNCTION
  const saveInterviewData = async (finalData: any) => {

    
    try {
      // Get ID using the new robust function
      const realUserId = getUserIdFromToken();
      console.log("💾 Sending data for User ID:", realUserId);

      if (realUserId === "unknown_user" || realUserId === "guest_user") {
        console.warn("⚠️ Warning: User ID could not be found in token.");
      }

      const payload = {
        userId: realUserId, 
        duration: durationRef.current,
        scores: {
          attention: finalData.attention,
          stability: finalData.stability,
          smoothness: finalData.smoothness,
          confidence: finalData.confidence
        }
      };

      // ... existing fetch code ...
      const response = await fetch('http://localhost:5000/api/interviews/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      // ...

      if (response.ok) {
        console.log("✅ Saved successfully!");
      }
    } catch (error) {
      console.error("❌ Network Error:", error);
    }
  };

  // 5. UPDATED END HANDLER
  const handleEndInterview = () => {
    setIsActive(false); // <--- PAUSE TIMER IMMEDIATELY
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send("STOP"); 
    } else {
      setCameraEnabled(false);
    }
  };

  const handleSendAnswer = () => {
    if (userInput.trim()) {
      setMessages(prev => [...prev, { id: Date.now(), type: 'user', content: userInput, timestamp: new Date() }]);
      setUserInput('');
      // Mock AI response logic...
      setAiStatus('analyzing');
      setTimeout(() => setAiStatus('idle'), 1000);
    }
  };

  const handleFinishSession = () => navigate(`/report?mode=${mode}`);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${mode === 'interview' ? 'from-gray-900 via-indigo-900 to-purple-900' : 'from-gray-900 via-pink-900 to-purple-900'}`}>
      
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {/* ... inside the return (...) statement ... */}

      {/* Top Bar */}
      <div className="bg-gray-900/50 backdrop-blur-md border-b border-gray-700/50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side (Logo/Title) - Unchanged */}
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 bg-gradient-to-br rounded-xl flex items-center justify-center ${mode === 'interview' ? 'from-teal-400 to-indigo-500' : 'from-pink-400 to-purple-500'}`}>
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{mode === 'interview' ? 'AI Mock Interview' : 'AI Conversation Practice'}</h1>
                <p className="text-sm text-gray-400">Live Python Analysis Active</p>
              </div>
            </div>
            
            {/* Right side (Timer & Buttons) - UPDATED */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
                <Clock className={`w-5 h-5 ${mode === 'interview' ? 'text-teal-400' : 'text-pink-400'}`} />
                <span className="text-white font-mono text-lg">{formatDuration(duration)}</span>
              </div>
              
              {isActive ? (
                <button 
                  onClick={handleEndInterview} 
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                >
                  End Interview
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/home')} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 animate-in fade-in zoom-in duration-300"
                >
                  Return to Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* Video Feed */}
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6">
              <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden relative">
                {cameraEnabled ? (
                   <div className="w-full h-full relative">
                     <VideoMirror stream={videoRef.current?.srcObject as MediaStream} />
                     <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-full border border-teal-500/30">
                        <p className="text-xs text-teal-400 font-mono">AI TRACKING ACTIVE</p>
                     </div>
                   </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-500">Camera Off</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat */}
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6">
              <div className="bg-gray-900/50 rounded-xl p-4 h-[300px] overflow-y-auto mb-4 space-y-4">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.type === 'user' ? 'bg-indigo-600' : 'bg-gray-700'} text-white`}>
                      <p className="text-sm">{m.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Input value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendAnswer()} placeholder="Type answer..." className="bg-gray-700/50 border-gray-600 text-white" />
                <Button onClick={handleSendAnswer} className="bg-indigo-600"><Send className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-400" />
                Live Analysis
              </h3>
              <div className="space-y-4">
                <div>
                   <div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Attention</span><span className="text-white">{attention}%</span></div>
                   <Progress value={attention} className="h-2" />
                </div>
                <div>
                   <div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Stability</span><span className="text-white">{stability}%</span></div>
                   <Progress value={stability} className="h-2" />
                </div>
                <div>
                   <div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Smoothness</span><span className="text-white">{smoothness}%</span></div>
                   <Progress value={smoothness} className="h-2" />
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-700/50 grid grid-cols-2 gap-4 text-center">
                 <div><div className="text-2xl font-bold text-teal-400">{confidenceScore}%</div><div className="text-xs text-gray-400">Confidence</div></div>
                 <div><div className="text-2xl font-bold text-purple-400">{answerQuality}</div><div className="text-xs text-gray-400">Quality</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoMirror({ stream }: { stream: MediaStream | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => { if (videoRef.current && stream) videoRef.current.srcObject = stream; }, [stream]);
  return <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />;
}