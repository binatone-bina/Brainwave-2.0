import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Database, LogOut, Camera, Save, ArrowLeft, Video, MessageCircle, BarChart3 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import api from '../../api/axios';

export default function Profile() {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('User'); // Default role
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Settings state (Local only for now)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [saveHistory, setSaveHistory] = useState(true);
  const [allowAIData, setAllowAIData] = useState(true);
  const [historyTab, setHistoryTab] = useState<'interview' | 'informal'>('interview');

  // --- 1. FETCH DATA (Matches your GET /me route) ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await api.get('/auth/me', {
          headers: { 'x-auth-token': token }
        });

        // Set state from backend
        setFullName(response.data.name);
        setEmail(response.data.email);
        
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // --- 2. UPDATE PROFILE (Matches your PUT /update route) ---
  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // We send both name and email because your backend accepts { name, email }
      await api.put('/auth/update', 
        { 
          name: fullName, 
          email: email 
        },
        { headers: { 'x-auth-token': token } }
      );

      alert("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (err) {
      console.error("Error updating profile", err);
      alert("Failed to update profile.");
    }
  };

  // --- LOGOUT ---
  const handleLogoutAllDevices = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // --- MOCK DATA FOR HISTORY ---
  const interviewHistory = [
    { id: 1, date: '2026-01-10', duration: '22:45', confidence: 89, success: 92 },
    { id: 2, date: '2026-01-08', duration: '20:30', confidence: 85, success: 88 },
  ];

  const informalHistory = [
    { id: 1, date: '2026-01-12', duration: '18:30', socialConfidence: 85, engagement: 88 },
    { id: 2, date: '2026-01-09', duration: '16:20', socialConfidence: 80, engagement: 82 },
  ];

  if (loading) return <div className="p-10 text-center">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Profile & Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* --- PROFILE INFORMATION SECTION (Edit Name & Email here) --- */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <User className="w-6 h-6 text-indigo-600" />
              Profile Information
            </h2>
            {!isEditingProfile && (
              <Button
                onClick={() => setIsEditingProfile(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Edit Profile
              </Button>
            )}
          </div>

          <div className="space-y-6">
            {/* Avatar Display */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-teal-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border-2 border-indigo-200 flex items-center justify-center hover:bg-indigo-50 transition-colors shadow-md">
                  <Camera className="w-4 h-4 text-indigo-600" />
                </button>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{fullName}</h3>
                <p className="text-gray-600">{email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  {role}
                </span>
              </div>
            </div>

            {/* Edit Form */}
            {isEditingProfile && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="profileEmail">Email Address</Label>
                  <Input
                    id="profileEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSaveProfile} className="bg-indigo-600 hover:bg-indigo-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => setIsEditingProfile(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- PRACTICE HISTORY SECTION --- */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              Practice History
            </h2>

            {/* History Tab Toggle */}
            <div className="mb-6 flex justify-center">
              <div className="bg-gray-100 rounded-lg p-1 inline-flex gap-1">
                <button
                  onClick={() => setHistoryTab('interview')}
                  className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${
                    historyTab === 'interview'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Video className="w-4 h-4 inline mr-2" />
                  Interview Mode
                </button>
                <button
                  onClick={() => setHistoryTab('informal')}
                  className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${
                    historyTab === 'informal'
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 inline mr-2" />
                  Informal Mode
                </button>
              </div>
            </div>

            {/* Interview History Table */}
            {historyTab === 'interview' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-3 text-sm font-semibold text-gray-600">Date</th>
                      <th className="text-left py-3 px-3 text-sm font-semibold text-gray-600">Duration</th>
                      <th className="text-left py-3 px-3 text-sm font-semibold text-gray-600">Confidence</th>
                      <th className="text-left py-3 px-3 text-sm font-semibold text-gray-600">Success</th>
                      <th className="text-left py-3 px-3 text-sm font-semibold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interviewHistory.map((session) => (
                      <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-3 text-sm text-gray-900">{session.date}</td>
                        <td className="py-4 px-3 text-sm text-gray-600">{session.duration}</td>
                        <td className="py-4 px-3"><span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">{session.confidence}%</span></td>
                        <td className="py-4 px-3"><span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">{session.success}%</span></td>
                        <td className="py-4 px-3">
                          <button onClick={() => navigate('/report?mode=interview')} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium hover:underline">View Report</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Informal History Table */}
            {historyTab === 'informal' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-3 text-sm font-semibold text-gray-600">Date</th>
                      <th className="text-left py-3 px-3 text-sm font-semibold text-gray-600">Duration</th>
                      <th className="text-left py-3 px-3 text-sm font-semibold text-gray-600">Social</th>
                      <th className="text-left py-3 px-3 text-sm font-semibold text-gray-600">Engagement</th>
                      <th className="text-left py-3 px-3 text-sm font-semibold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {informalHistory.map((session) => (
                      <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-3 text-sm text-gray-900">{session.date}</td>
                        <td className="py-4 px-3 text-sm text-gray-600">{session.duration}</td>
                        <td className="py-4 px-3"><span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700">{session.socialConfidence}%</span></td>
                        <td className="py-4 px-3"><span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">{session.engagement}%</span></td>
                        <td className="py-4 px-3">
                          <button onClick={() => navigate('/report?mode=informal')} className="text-teal-600 hover:text-teal-700 text-sm font-medium hover:underline">View Report</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>

        {/* --- ACCOUNT SETTINGS (Removed Password/Email forms to stop errors) --- */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            Account Settings
          </h2>

          <div className="space-y-6">
            {/* Two-Factor Authentication Toggle (Frontend Only) */}
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-600" />
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Add an extra layer of security (Coming Soon)
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                />
              </div>
            </div>

            {/* Logout All Devices */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <LogOut className="w-5 h-5 text-red-600" />
                Logout from All Devices
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                This will sign you out of this session.
              </p>
              <Button
                onClick={handleLogoutAllDevices}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
              >
                Logout Now
              </Button>
            </div>
          </div>
        </div>

        {/* --- PRIVACY SETTINGS --- */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-600" />
            Privacy & Data
          </h2>

          <div className="space-y-6">
            <div className="flex items-start justify-between pb-6 border-b border-gray-200">
              <div className="flex-1 pr-4">
                <h3 className="text-lg font-semibold text-gray-900">Save Practice History</h3>
                <p className="text-sm text-gray-600 mt-1">Store your past sessions and progress data</p>
              </div>
              <Switch checked={saveHistory} onCheckedChange={setSaveHistory} />
            </div>

            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <h3 className="text-lg font-semibold text-gray-900">AI Data Storage</h3>
                <p className="text-sm text-gray-600 mt-1">Allow AI to store facial expressions for analysis</p>
              </div>
              <Switch checked={allowAIData} onCheckedChange={setAllowAIData} />
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
