import { useState,useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Video, BarChart3, TrendingUp, Calendar, Play, FileText, User, LogOut, LayoutDashboard, MessageCircle, Eye, Users, Smile } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import api from '../../api/axios';

// Dummy data for the progress chart
const progressData = [
  { date: 'Week 1', score: 65 },
  { date: 'Week 2', score: 72 },
  { date: 'Week 3', score: 68 },
  { date: 'Week 4', score: 78 },
  { date: 'Week 5', score: 85 },
  { date: 'Week 6', score: 89 },
];

// Dummy data for recent interviews
const recentInterviews = [
  { id: 1, date: '2026-01-10', confidenceScore: 89, successScore: 92 },
  { id: 2, date: '2026-01-08', confidenceScore: 85, successScore: 88 },
  { id: 3, date: '2026-01-05', confidenceScore: 78, successScore: 82 },
  { id: 4, date: '2026-01-02', confidenceScore: 72, successScore: 75 },
  { id: 5, date: '2025-12-30', confidenceScore: 68, successScore: 71 },
];

// Dummy data for informal conversation progress
const informalProgressData = [
  { date: 'Week 1', score: 60 },
  { date: 'Week 2', score: 68 },
  { date: 'Week 3', score: 72 },
  { date: 'Week 4', score: 75 },
  { date: 'Week 5', score: 80 },
  { date: 'Week 6', score: 85 },
];

// Dummy data for recent informal sessions
const recentInformalSessions = [
  { id: 1, date: '2026-01-12', socialConfidence: 85, engagement: 88 },
  { id: 2, date: '2026-01-09', socialConfidence: 80, engagement: 82 },
  { id: 3, date: '2026-01-06', socialConfidence: 75, engagement: 78 },
  { id: 4, date: '2026-01-03', socialConfidence: 72, engagement: 75 },
  { id: 5, date: '2025-12-29', socialConfidence: 68, engagement: 70 },
];

export default function Home() {
  const navigate = useNavigate();
  
  // 1. State for dynamic user data
  const [userName, setUserName] = useState('User'); // Default fallback
  const [loading, setLoading] = useState(true);

  // Existing state
  const [mode, setMode] = useState<'interview' | 'informal'>('interview');
  const [jobProfile, setJobProfile] = useState('Software Engineer');

  // 2. Fetch User Name on Load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // No token found? Redirect to login immediately
          navigate('/'); 
          return;
        }

        const res = await api.get('/auth/me', {
          headers: { 'x-auth-token': token }
        });
        
        // Set the real name from DB
        setUserName(res.data.name); 
      } catch (err) {
        console.error("Failed to load user data", err);
        // Optional: if token is invalid, force logout
        // handleLogout(); 
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // 3. Update Logout to clear token
  const handleLogout = () => {
    localStorage.removeItem('token'); // <--- CRITICAL: Remove the key
    navigate('/');
  };

  const handleStartInterview = () => {
    console.log('Starting new interview...');
    navigate('/interview?mode=interview');
  };

  const handleStartInformalSession = () => {
    console.log('Starting new informal session...');
    navigate('/interview?mode=informal');
  };

  const handleStartMeeting = () => {
    if (mode === 'interview') {
      handleStartInterview();
    } else {
      handleStartInformalSession();
    }
  };

  // If you want a loading state while fetching the name:
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-indigo-500 rounded-xl flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PrepAI</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <button className="flex items-center gap-2 px-3 py-2 text-indigo-600 bg-indigo-50 rounded-lg font-medium transition-colors">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={handleStartMeeting}
                title={mode === 'interview' ? 'Start New Interview' : 'Start New Chat'}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors"
              >
                <Video className="w-4 h-4" />
                Start Meeting
              </button>
              <button 
                onClick={() => navigate(`/report?mode=${mode}`)}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors"
              >
                <FileText className="w-4 h-4" />
                Reports
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome back, {userName} 👋
            </h1>
            <Select value={mode} onValueChange={(value: 'interview' | 'informal') => setMode(value)}>
              <SelectTrigger className="w-[200px] h-12 bg-white border-gray-300 rounded-lg shadow-sm text-base font-medium px-4">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interview" className="text-base py-2.5">Interview Mode</SelectItem>
                <SelectItem value="informal" className="text-base py-2.5">Informal Mode</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xl text-gray-600">
            Ready to practice and improve your interview skills?
          </p>
        </div>

        {/* INTERVIEW MODE DASHBOARD */}
        {mode === 'interview' && (
          <>
            {/* Main Action Card */}
            <div className="mb-8 bg-gradient-to-r from-indigo-600 to-teal-600 rounded-3xl p-8 shadow-xl relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl" />
              
              <div className="relative z-10 flex items-center justify-between gap-8">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-3">
                    Ready for Your Next Interview?
                  </h2>
                  <p className="text-lg text-indigo-100 mb-6">
                    Upload your resume, turn on camera and mic, and begin.
                  </p>
                  <Button
                    onClick={handleStartInterview}
                    className="bg-white text-indigo-600 hover:bg-indigo-50 h-14 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    <Video className="w-5 h-5 mr-2" />
                    Start New Interview
                  </Button>
                </div>
                <div className="flex-shrink-0">
                  <label className="block text-white text-sm font-medium mb-2">
                    Job Profile
                  </label>
                  <Select value={jobProfile} onValueChange={setJobProfile}>
                    <SelectTrigger className="w-[240px] h-14 bg-white border-0 rounded-lg shadow-lg text-base font-medium px-4">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Software Engineer" className="text-base py-2.5">Software Engineer</SelectItem>
                      <SelectItem value="Frontend Developer" className="text-base py-2.5">Frontend Developer</SelectItem>
                      <SelectItem value="Backend Developer" className="text-base py-2.5">Backend Developer</SelectItem>
                      <SelectItem value="Product Manager" className="text-base py-2.5">Product Manager</SelectItem>
                      <SelectItem value="Data Analyst" className="text-base py-2.5">Data Analyst</SelectItem>
                      <SelectItem value="UX/UI Designer" className="text-base py-2.5">UX/UI Designer</SelectItem>
                      <SelectItem value="Custom" className="text-base py-2.5">+ Add Custom Role</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Interviews */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Video className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Total Interviews</h3>
                <p className="text-3xl font-bold text-gray-900">24</p>
                <p className="text-sm text-teal-600 mt-2">+3 this week</p>
              </div>

              {/* Average Confidence Score */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Avg Confidence</h3>
                <p className="text-3xl font-bold text-gray-900">85%</p>
                <p className="text-sm text-teal-600 mt-2">+12% improvement</p>
              </div>

              {/* Best Score */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-teal-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Best Score</h3>
                <p className="text-3xl font-bold text-gray-900">92%</p>
                <p className="text-sm text-gray-500 mt-2">Jan 10, 2026</p>
              </div>

              {/* Last Interview */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-cyan-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Last Interview</h3>
                <p className="text-3xl font-bold text-gray-900">Jan 10</p>
                <p className="text-sm text-gray-500 mt-2">3 days ago</p>
              </div>
            </div>

            {/* Progress Chart and Recent Interviews */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Progress Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Confidence Progress</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      dot={{ fill: '#6366f1', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Interviews Table */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Interviews</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Date</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Confidence</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Success</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentInterviews.map((interview) => (
                        <tr key={interview.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-2 text-sm text-gray-900">{interview.date}</td>
                          <td className="py-4 px-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              {interview.confidenceScore}%
                            </span>
                          </td>
                          <td className="py-4 px-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                              {interview.successScore}%
                            </span>
                          </td>
                          <td className="py-4 px-2">
                            <button 
                              onClick={() => navigate('/report?mode=interview')}
                              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium hover:underline"
                            >
                              View Report
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* INFORMAL MODE DASHBOARD */}
        {mode === 'informal' && (
          <>
            {/* Main Action Card */}
            <div className="mb-8 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl p-8 shadow-xl relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/20 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-3">
                  Ready for a Friendly Chat?
                </h2>
                <p className="text-lg text-cyan-100 mb-6">
                  Practice casual conversations and build social confidence.
                </p>
                <Button
                  onClick={handleStartInformalSession}
                  className="bg-white text-teal-600 hover:bg-cyan-50 h-14 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Start New Chat Session
                </Button>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Conversations */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-teal-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Total Conversations</h3>
                <p className="text-3xl font-bold text-gray-900">18</p>
                <p className="text-sm text-teal-600 mt-2">+2 this week</p>
              </div>

              {/* Social Confidence */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <Smile className="w-6 h-6 text-cyan-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Social Confidence</h3>
                <p className="text-3xl font-bold text-gray-900">80%</p>
                <p className="text-sm text-teal-600 mt-2">+15% improvement</p>
              </div>

              {/* Best Engagement */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Best Engagement</h3>
                <p className="text-3xl font-bold text-gray-900">88%</p>
                <p className="text-sm text-gray-500 mt-2">Jan 12, 2026</p>
              </div>

              {/* Last Session */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-sky-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Last Session</h3>
                <p className="text-3xl font-bold text-gray-900">Jan 12</p>
                <p className="text-sm text-gray-500 mt-2">1 day ago</p>
              </div>
            </div>

            {/* Progress Chart and Recent Sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Progress Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Social Confidence Progress</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={informalProgressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#14b8a6" 
                      strokeWidth={3}
                      dot={{ fill: '#14b8a6', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Sessions Table */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Conversations</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Date</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Confidence</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Engagement</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentInformalSessions.map((session) => (
                        <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-2 text-sm text-gray-900">{session.date}</td>
                          <td className="py-4 px-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700">
                              {session.socialConfidence}%
                            </span>
                          </td>
                          <td className="py-4 px-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                              {session.engagement}%
                            </span>
                          </td>
                          <td className="py-4 px-2">
                            <button 
                              onClick={() => navigate('/report?mode=informal')}
                              className="text-teal-600 hover:text-teal-700 text-sm font-medium hover:underline"
                            >
                              View Report
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}