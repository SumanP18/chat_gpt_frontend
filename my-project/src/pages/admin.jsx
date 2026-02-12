
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart,
    Users,
    MessageSquare,
    Zap,
    TrendingUp,
    Clock,
    ShieldCheck,
    ArrowLeft,
    Activity,
    Database,
    Cpu,
    Settings,
    Save,
    Key,
    Cpu as ModelIcon,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

const Admin = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        total_users: 0,
        total_conversations: 0,
        total_messages: 0,
        total_tokens: 0
    });
    const [recentConvos, setRecentConvos] = useState([]);
    const [topUsers, setTopUsers] = useState([]);
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState(null);

    useEffect(() => {
        const fetchAdminData = async () => {
            const token = localStorage.getItem('access_token');
            try {
                const [statsRes, convoRes, usersRes, settingsRes] = await Promise.all([
                    fetch('http://127.0.0.1:8000/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('http://127.0.0.1:8000/admin/recent_conversations', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('http://127.0.0.1:8000/admin/top_users', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('http://127.0.0.1:8000/admin/settings', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                if (statsRes.ok) setStats(await statsRes.json());
                if (convoRes.ok) setRecentConvos(await convoRes.json());
                if (usersRes.ok) setTopUsers(await usersRes.json());
                if (settingsRes.ok) {
                    const data = await settingsRes.json();
                    setSettings(data.length > 0 ? data : [
                        { key: 'GITHUB_TOKEN', value: '', description: 'GitHub Models / Azure AI Token' },
                        { key: 'AI_MODEL', value: 'gpt-4o-mini', description: 'Primary LLM Model' }
                    ]);
                }
            } catch (error) {
                console.error("Admin fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    const handleUpdateSetting = async (key, value) => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch('http://127.0.0.1:8000/admin/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ key, value })
            });
            if (res.ok) {
                setSaveStatus({ key, type: 'success' });
                setTimeout(() => setSaveStatus(null), 3000);
            } else {
                setSaveStatus({ key, type: 'error' });
            }
        } catch (error) {
            setSaveStatus({ key, type: 'error' });
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, trend }) => (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:scale-150 transition-transform ${color}`} />
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
                    <Icon size={24} className={color.replace('bg-', 'text-')} />
                </div>
                {trend && <span className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">+{trend}%</span>}
            </div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</h3>
            <p className="text-3xl font-black text-gray-800 dark:text-white">
                {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
        </div>
    );

    if (loading) return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-gray-950">
            <Activity size={48} className="text-indigo-600 animate-pulse mb-4" />
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Initializing Dashboard...</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fcfcfd] dark:bg-gray-950 p-8 font-sans transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/dashboard')} className="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm">
                            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
                        </button>
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                                Admin Suite <ShieldCheck className="text-indigo-600" size={32} />
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Configure & monitor your AI ecosystem</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Settings
                        </button>
                    </div>
                </header>

                {activeTab === 'overview' ? (
                    <>
                        {/* Grid Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            <StatCard title="Total Users" value={stats.total_users} icon={Users} color="bg-blue-500" trend="12" />
                            <StatCard title="Conversations" value={stats.total_conversations} icon={MessageSquare} color="bg-indigo-500" trend="45" />
                            <StatCard title="Messages Sent" value={stats.total_messages} icon={Activity} color="bg-emerald-500" trend="28" />
                            <StatCard title="Tokens Used" value={stats.total_tokens} icon={Zap} color="bg-amber-500" trend="15" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Recent Activities */}
                            <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                                        <Clock size={22} className="text-indigo-600" /> Recent Activity
                                    </h2>
                                    <button className="text-[10px] font-black text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900/50 uppercase tracking-widest transition-all">Export Logs</button>
                                </div>
                                <div className="space-y-4">
                                    {recentConvos.map(convo => (
                                        <div key={convo.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/40 border border-transparent hover:border-gray-100 dark:hover:border-gray-800 transition-all group cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-[10px]">
                                                    #{convo.id}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 transition-colors tracking-tight truncate max-w-[200px]">{convo.title || "Untitled Chat"}</h4>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">User ID: {convo.user_id}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg uppercase tracking-widest">{new Date(convo.created_at).toLocaleDateString()}</span>
                                                <ShieldCheck size={14} className="text-emerald-500 opacity-50" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Users Sidebar */}
                            <div className="bg-gray-950 p-8 rounded-3xl shadow-xl relative overflow-hidden border border-gray-800">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-30" />
                                <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-8 relative">
                                    <TrendingUp size={22} className="text-amber-500" /> Leaderboard
                                </h2>
                                <div className="space-y-6 relative">
                                    {topUsers.map((user, idx) => (
                                        <div key={idx} className="flex items-center gap-4 group cursor-pointer">
                                            <div className="relative">
                                                <div className="w-12 h-12 bg-gray-900 rounded-2xl border border-gray-800 flex items-center justify-center text-indigo-400 font-bold text-sm group-hover:border-indigo-600 transition-all">
                                                    {user.email[0].toUpperCase()}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-[8px] font-black px-1.5 rounded-md text-gray-950 border-2 border-gray-950 shadow-sm">
                                                    #{idx + 1}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-100 truncate group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{user.email.split('@')[0]}</p>
                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.15em]">{user.convo_count} Sessions</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="mt-12 p-5 bg-gray-900/50 rounded-2xl border border-gray-800 backdrop-blur-sm">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Cpu size={18} className="text-indigo-400" />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Compute Load</span>
                                        </div>
                                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-[68%] rounded-full shadow-[0_0_12px_rgba(99,102,241,0.4)]" />
                                        </div>
                                        <div className="flex justify-between items-center mt-3">
                                            <span className="text-[9px] text-gray-500 font-bold uppercase">Optimal</span>
                                            <span className="text-[9px] text-indigo-400 font-black uppercase">68% Capacity</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-5 duration-500">
                        <div className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl text-indigo-600">
                                    <Settings size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">System Configuration</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-tight">Manage API keys and global system parameters</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {settings.map((s, idx) => (
                                    <div key={s.key} className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                {s.key.includes('TOKEN') ? <Key size={14} /> : <ModelIcon size={14} />} {s.key.replace('_', ' ')}
                                            </label>
                                            {saveStatus?.key === s.key && (
                                                <span className={`text-[10px] font-bold flex items-center gap-1 uppercase tracking-widest ${saveStatus.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {saveStatus.type === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                                    {saveStatus.type === 'success' ? 'Synchronized' : 'Failed'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative group">
                                            <input
                                                type={s.key.includes('TOKEN') ? 'password' : 'text'}
                                                value={s.value}
                                                onChange={(e) => {
                                                    const newSettings = [...settings];
                                                    newSettings[idx].value = e.target.value;
                                                    setSettings(newSettings);
                                                }}
                                                className="w-full bg-gray-50 dark:bg-gray-950 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-600 rounded-2xl px-5 py-4 text-sm font-semibold transition-all focus:outline-none focus:ring-8 focus:ring-indigo-500/5 text-gray-800 dark:text-white placeholder-gray-400"
                                                placeholder={`Input ${s.key.toLowerCase()}...`}
                                            />
                                            <button
                                                onClick={() => handleUpdateSetting(s.key, s.value)}
                                                className="absolute right-3 top-3 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm group-focus-within:border-indigo-500 text-gray-400"
                                            >
                                                <Save size={18} />
                                            </button>
                                        </div>
                                        <p className="text-[11px] text-gray-400 font-medium italic pl-1">{s.description}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/30 flex gap-4">
                                <AlertCircle className="text-amber-600 shrink-0" size={24} />
                                <div>
                                    <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400 uppercase tracking-tight mb-1">Security Notice</h4>
                                    <p className="text-xs text-amber-700 dark:text-amber-500/80 leading-relaxed font-medium">Changes to core system keys are applied instantly. Ensure your tokens have the correct inference permissions before saving. Invalid keys will halt the AI completion pipeline.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
