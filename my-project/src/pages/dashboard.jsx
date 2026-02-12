
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e, text = null) => {
        if (e) e.preventDefault();
        const finalMessage = text || message;
        if (!finalMessage.trim()) return;

        const userMessage = { role: 'user', content: finalMessage };
        setMessages(prev => [...prev, userMessage]);
        setMessage('');
        setLoading(true);

        const token = localStorage.getItem('access_token');

        try {
            const res = await fetch('http://127.0.0.1:8000/ai_response', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: finalMessage })
            });

            if (res.ok) {
                const data = await res.json();
                const aiMessage = { role: 'assistant', content: data.response || JSON.stringify(data) };
                setMessages(prev => [...prev, aiMessage]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Could not get response.' }]);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    const suggestions = [
        { title: "Help me write", desc: "a thank you note to my interviewer", icon: "✍️" },
        { title: "Suggest a recipe", desc: "for a quick healthy dinner", icon: "🥗" },
        { title: "Summarize text", desc: "this long article into 3 bullets", icon: "📝" },
        { title: "Explain a concept", desc: "quantum computing in simple terms", icon: "💡" }
    ];

    return (
        <div className="flex h-screen bg-white text-gray-800 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-[260px] bg-[#f9fafb] border-r border-gray-200 flex flex-col transition-all duration-300">
                <div className="p-3">
                    <button
                        onClick={() => setMessages([])}
                        className="flex items-center gap-3 w-full px-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium text-gray-700 shadow-sm"
                    >
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        New chat
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3">
                    <div className="flex flex-col gap-1 mt-4">
                        <div className="px-3 py-2 text-[11px] text-gray-400 font-bold uppercase tracking-wider">Today</div>
                        <div className="group flex items-center gap-3 px-3 py-2.5 bg-gray-100 rounded-lg text-sm cursor-pointer border-l-4 border-l-indigo-600 font-medium">
                            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            <span className="truncate">Current Chat</span>
                        </div>
                    </div>
                </div>

                <div className="p-3 border-t border-gray-200 bg-[#f9fafb]">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-gray-100 transition-all text-sm text-gray-600"
                    >
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        Home
                    </button>
                    <button
                        onClick={() => {
                            localStorage.removeItem('access_token');
                            localStorage.removeItem('refresh_token');
                            navigate('/login');
                        }}
                        className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-red-50 transition-all text-sm text-red-600 mt-1"
                    >
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col relative bg-white">
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto pt-8 pb-32">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto px-4">
                            <div className="w-16 h-16 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-md mb-8">
                                <span className="text-3xl">🤖</span>
                            </div>
                            <h1 className="text-3xl font-bold mb-12 text-gray-800">How can I help you today?</h1>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSendMessage(null, `${s.title} ${s.desc}`)}
                                        className="text-left p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all group shadow-sm"
                                    >
                                        <span className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                                            {s.icon} {s.title}
                                        </span>
                                        <span className="block text-xs text-gray-500 group-hover:text-gray-600">{s.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col w-full">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`py-12 flex justify-center border-b border-gray-50 ${msg.role === 'assistant' ? 'bg-[#f7f7f8]' : 'bg-white'}`}
                                >
                                    <div className="max-w-3xl w-full flex gap-6 px-4">
                                        <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 shadow-sm text-[10px] font-bold ${msg.role === 'assistant' ? 'bg-[#10a37f] text-white' : 'bg-indigo-600 text-white'}`}>
                                            {msg.role === 'assistant' ? 'AI' : 'YOU'}
                                        </div>
                                        <div className="flex-1 text-[15px] leading-relaxed text-gray-700 whitespace-pre-wrap">
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Floating Input Area */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
                    <div className="max-w-3xl mx-auto pointer-events-auto">
                        <div className="relative">
                            <form onSubmit={handleSendMessage} className="relative group">
                                <textarea
                                    rows="1"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e);
                                        }
                                    }}
                                    placeholder="Message ChatGPT..."
                                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 pr-14 shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-[15px] text-gray-800 placeholder-gray-400 resize-none transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !message.trim()}
                                    className="absolute right-3 bottom-3 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-300 transition-all text-white shadow-lg"
                                >
                                    <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                </button>
                            </form>
                            <div className="text-[11px] text-center mt-4 text-gray-400 font-medium">
                                ChatGPT can make mistakes. Check important info.
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
