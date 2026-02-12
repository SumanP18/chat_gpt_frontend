
import React, { useEffect, useState, useRef, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import {
    Copy,
    RotateCcw,
    Sun,
    Moon,
    Check,
    Trash2,
    Home,
    LogOut,
    Plus,
    MessageSquare,
    Send,
    Terminal,
    User,
    Paperclip,
    FileText,
    File,
    X,
    Loader2,
    BarChart,
    Image as ImageIcon,
    Download
} from 'lucide-react';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// ── Memoized Message Component ──
const MessageItem = memo(({ msg, idx, isLast, isDarkMode, copiedId, onCopy, onRegenerate, canRegenerate }) => {
    const MarkdownComponents = useMemo(() => ({
        code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
                <div className="relative group/code my-4 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-mono uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                        <span className="flex items-center gap-2 italic"> {match[1]} </span>
                        <button onClick={() => onCopy(String(children).replace(/\n$/, ''), 'code')} className="hover:text-indigo-600 transition-colors">
                            <Copy size={14} />
                        </button>
                    </div>
                    <SyntaxHighlighter style={isDarkMode ? oneDark : oneLight} language={match[1]} PreTag="div" className="!m-0 !p-4 !text-sm scrollbar-thin dark:scrollbar-thumb-gray-800" {...props}>
                        {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                </div>
            ) : (
                <code className="bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded text-sm font-mono text-indigo-700 dark:text-indigo-300" {...props}>{children}</code>
            );
        }
    }), [isDarkMode, onCopy]);

    return (
        <div className={`py-12 flex justify-center border-b border-gray-100 dark:border-gray-900/30 transition-all duration-300 animate-in fade-in ${msg.role === 'assistant' ? 'bg-gray-50 dark:bg-gray-900/20' : 'bg-white dark:bg-gray-950'}`}>
            <div className="max-w-3xl w-full flex gap-5 px-6 group/msg transition-all">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-xs font-bold ${msg.role === 'assistant' ? 'bg-emerald-500 text-white shadow-emerald-200/50 dark:shadow-none' : 'bg-indigo-600 text-white shadow-indigo-200/50 dark:shadow-none'}`}>
                    {msg.role === 'assistant' ? 'AI' : <User size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="prose prose-md dark:prose-invert max-w-none text-[16px] leading-[1.7] text-gray-700 dark:text-gray-300 font-medium">
                        {msg.content.startsWith('IMAGE:') ? (
                            <div className="relative group/img overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl bg-white dark:bg-gray-900 ring-1 ring-black/5 max-w-[512px] animate-in zoom-in duration-500">
                                <img
                                    src={msg.content.replace('IMAGE:', '')}
                                    alt="Generated AI Art"
                                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-4 right-4 flex gap-2 translate-y-2 group-hover/img:translate-y-0 opacity-0 group-hover/img:opacity-100 transition-all duration-300">
                                    <button
                                        onClick={() => window.open(msg.content.replace('IMAGE:', ''), '_blank')}
                                        className="p-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl text-gray-700 dark:text-gray-200 hover:text-indigo-600 transition-all shadow-xl border border-white/20"
                                    >
                                        <Download size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                                {msg.content}
                            </ReactMarkdown>
                        )}
                    </div>
                    {msg.role === 'assistant' && (
                        <div className="mt-8 flex items-center gap-4 opacity-0 group-hover/msg:opacity-100 transition-all duration-300 translate-y-2 group-hover/msg:translate-y-0">
                            <button onClick={() => onCopy(msg.content, msg.id)} className="p-2 px-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-600 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm">
                                {copiedId === msg.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />} {copiedId === msg.id ? 'Copied' : 'Copy Content'}
                            </button>
                            {isLast && canRegenerate && (
                                <button onClick={onRegenerate} className="p-2 px-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-600 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm">
                                    <RotateCcw size={14} /> Regenerate Response
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

// ── Streaming Message Component (isolated re-renders) ──
const StreamingMessage = memo(({ streamingText, loading, isDarkMode, onCopy }) => {
    const MarkdownComponents = useMemo(() => ({
        code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
                <div className="relative group/code my-4 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-mono uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                        <span className="flex items-center gap-2 italic"> {match[1]} </span>
                        <button onClick={() => onCopy(String(children).replace(/\n$/, ''), 'code')} className="hover:text-indigo-600 transition-colors">
                            <Copy size={14} />
                        </button>
                    </div>
                    <SyntaxHighlighter style={isDarkMode ? oneDark : oneLight} language={match[1]} PreTag="div" className="!m-0 !p-4 !text-sm scrollbar-thin dark:scrollbar-thumb-gray-800" {...props}>
                        {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                </div>
            ) : (
                <code className="bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded text-sm font-mono text-indigo-700 dark:text-indigo-300" {...props}>{children}</code>
            );
        }
    }), [isDarkMode, onCopy]);

    return (
        <div className="py-12 flex justify-center border-b border-gray-100 dark:border-gray-900/30 bg-gray-50 dark:bg-gray-900/20">
            <div className="max-w-3xl w-full flex gap-5 px-6">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-xs font-bold bg-emerald-500 text-white">AI</div>
                <div className="flex-1 min-w-0 pt-2">
                    {loading ? (
                        <div className="flex gap-2 items-center">
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                            </div>
                            <span className="text-xs text-indigo-500 font-bold uppercase tracking-widest ml-4">Thinking...</span>
                        </div>
                    ) : (
                        <div className="prose prose-md dark:prose-invert max-w-none text-[16px] leading-[1.7] text-gray-700 dark:text-gray-300 font-medium">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                                {streamingText + ' ▋'}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

const Dashboard = () => {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [sessions, setSessions] = useState(() => {
        try {
            const saved = localStorage.getItem('chat_sessions');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse sessions:", e);
            return [];
        }
    });
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [streamingText, setStreamingText] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });
    const [copiedId, setCopiedId] = useState(null);
    const [attachedFile, setAttachedFile] = useState(null);
    const [isParsing, setIsParsing] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        console.log("DASHBOARD_DEBUG: Mounting Dashboard component");
        const token = localStorage.getItem('access_token');
        console.log("DASHBOARD_DEBUG: Token status:", token ? "Exists" : "Missing");
        if (!token) {
            console.log("DASHBOARD_DEBUG: No token found, redirecting to /login");
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        localStorage.setItem('chat_sessions', JSON.stringify(sessions));
    }, [sessions]);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    useEffect(() => {
        scrollToBottom();
    }, [activeSessionId, sessions, streamingText, isStreaming, scrollToBottom]);

    const activeSession = useMemo(() => sessions.find(s => s.id === activeSessionId) || null, [sessions, activeSessionId]);
    const messages = useMemo(() => activeSession ? activeSession.messages : [], [activeSession]);

    const createNewSession = useCallback(() => {
        const newId = Date.now().toString();
        const newSession = {
            id: newId,
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString()
        };
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newId);
    }, []);

    const parsePDF = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(" ") + "\n";
        }
        return text;
    };

    const parseDOCX = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    };

    const handleFileUpload = useCallback(async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsParsing(true);
        try {
            let extractedText = "";
            if (file.type === "application/pdf") {
                extractedText = await parsePDF(file);
            } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                extractedText = await parseDOCX(file);
            } else {
                extractedText = await file.text();
            }
            setAttachedFile({ name: file.name, content: extractedText, type: file.type });
        } catch (error) {
            console.error("File parsing error:", error);
            alert("Error parsing file. Please try a different document.");
        } finally {
            setIsParsing(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }, []);

    const simulateStreaming = useCallback(async (text, sessionId) => {
        setIsStreaming(true);
        setStreamingText('');
        const chunks = text.length > 200 ? text.split(' ') : text.split('');
        let currentText = '';
        for (let i = 0; i < chunks.length; i++) {
            currentText += chunks[i] + (text.length > 200 && i !== chunks.length - 1 ? ' ' : '');
            setStreamingText(currentText);
            await new Promise(resolve => setTimeout(resolve, text.length > 200 ? 30 : 15));
        }
        const aiMessage = { role: 'assistant', content: text, id: Date.now().toString() };
        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: [...s.messages, aiMessage] } : s));
        setStreamingText('');
        setIsStreaming(false);
    }, []);

    const handleSendMessage = useCallback(async (e, text = null) => {
        if (e) e.preventDefault();
        let finalMessage = text || message;
        if (!finalMessage.trim() && !attachedFile) return;
        if (loading || isStreaming) return;

        let displayMessage = finalMessage;
        if (attachedFile) {
            finalMessage = `Context from file (${attachedFile.name}):\n\n${attachedFile.content}\n\nUser Question: ${displayMessage || "Summarize this document"}`;
            displayMessage = displayMessage || `Analyzed document: ${attachedFile.name}`;
        }

        let currentSessionId = activeSessionId;
        if (!currentSessionId) {
            const newId = Date.now().toString();
            const newSession = { id: newId, title: displayMessage.substring(0, 30), messages: [], createdAt: new Date().toISOString() };
            setSessions(prev => [newSession, ...prev]);
            setActiveSessionId(newId);
            currentSessionId = newId;
        }

        const userMessage = { role: 'user', content: displayMessage, id: Date.now().toString() };
        setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                const updatedMessages = [...s.messages, userMessage];
                const updatedTitle = s.messages.length === 0 ? displayMessage.substring(0, 30) + (displayMessage.length > 30 ? '...' : '') : s.title;
                return { ...s, messages: updatedMessages, title: updatedTitle };
            }
            return s;
        }));

        setMessage('');
        setAttachedFile(null);
        setLoading(true);

        const token = localStorage.getItem('access_token');
        // Check for Image Generation Command
        if (finalMessage.startsWith('/image ')) {
            const prompt = finalMessage.replace('/image ', '').trim();
            try {
                const response = await fetch('http://127.0.0.1:8000/generate_image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ prompt })
                });
                const data = await response.json();
                if (response.ok) {
                    const aiImageMessage = {
                        role: 'assistant',
                        content: `IMAGE:${data.image_url}`,
                        id: Date.now().toString(),
                        isImage: true
                    };
                    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, aiImageMessage] } : s));
                    setLoading(false);
                    return;
                }
            } catch (err) {
                console.error("Image generation error:", err);
            }
        }

        try {
            const res = await fetch('http://127.0.0.1:8000/ai_response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ message: finalMessage })
            });

            if (res.ok) {
                const data = await res.json();
                setLoading(false);
                await simulateStreaming(data.response || JSON.stringify(data), currentSessionId);
            } else {
                setLoading(false);
                const errorMessage = { role: 'assistant', content: 'Error: Could not get response.', id: Date.now().toString() };
                setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, errorMessage] } : s));
            }
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
            const networkError = { role: 'assistant', content: 'Network error. Please try again.', id: Date.now().toString() };
            setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, networkError] } : s));
        }
    }, [message, attachedFile, loading, isStreaming, activeSessionId, simulateStreaming]);

    const deleteSession = useCallback((id, e) => {
        e.stopPropagation();
        setSessions(prev => prev.filter(s => s.id !== id));
        if (activeSessionId === id) setActiveSessionId(null);
    }, [activeSessionId]);

    const copyToClipboard = useCallback((text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    }, []);

    const regenerateResponse = useCallback(() => {
        if (!activeSession || messages.length === 0 || loading || isStreaming) return;
        const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
        if (lastUserMsg) handleSendMessage(null, lastUserMsg.content);
    }, [activeSession, messages, loading, isStreaming, handleSendMessage]);

    const groupedSessions = useMemo(() => {
        const groups = { Today: [], Yesterday: [], Previous: [] };
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
        sessions.forEach(s => {
            const date = new Date(s.createdAt);
            if (date >= today) groups.Today.push(s);
            else if (date >= yesterday) groups.Yesterday.push(s);
            else groups.Previous.push(s);
        });
        return groups;
    }, [sessions]);

    const suggestions = useMemo(() => [
        { title: "Help me write", desc: "a thank you note to my interviewer", icon: "✍️" },
        { title: "Suggest a recipe", desc: "for a quick healthy dinner", icon: "🥗" },
        { title: "Summarize text", desc: "this long article into 3 bullets", icon: "📝" },
        { title: "Explain a concept", desc: "quantum computing in simple terms", icon: "💡" }
    ], []);

    return (
        <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-950 text-gray-100' : 'bg-white text-gray-800'}`}>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.docx,.txt" className="hidden" />
            {/* Sidebar */}
            <aside className="w-[260px] bg-[#f9fafb] dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col z-20">
                <div className="p-3.5">
                    <button onClick={createNewSession} className="flex items-center gap-3 w-full px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm font-semibold shadow-sm text-gray-700 dark:text-gray-300">
                        <Plus size={18} /> New chat
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 scrollbar-thin dark:scrollbar-thumb-gray-800">
                    {Object.entries(groupedSessions).map(([name, group]) => group.length > 0 && (
                        <div key={name} className="flex flex-col gap-1.5 mt-8">
                            <div className="px-3 py-2 text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em]">{name}</div>
                            {group.map(s => (
                                <div key={s.id} onClick={() => !isStreaming && setActiveSessionId(s.id)} className={`group flex items-center gap-3 px-3 py-3 rounded-xl text-sm cursor-pointer transition-all ${activeSessionId === s.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-800/60 text-gray-600 dark:text-gray-400'}`}>
                                    <MessageSquare size={16} className={activeSessionId === s.id ? 'text-indigo-500' : 'text-gray-400'} />
                                    <span className="truncate flex-1">{s.title}</span>
                                    {activeSessionId === s.id && (loading || isStreaming) && <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]" />}
                                    <button onClick={(e) => deleteSession(s.id, e)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all shadow-sm">
                                        <Trash2 size={12} className="text-gray-400 hover:text-red-500" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-[#f9fafb] dark:bg-gray-900 space-y-2">
                    <button onClick={() => setIsDarkMode(!isDarkMode)} className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm text-gray-600 dark:text-gray-400">
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <button onClick={() => navigate('/admin')} className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm text-gray-600 dark:text-gray-400">
                        <BarChart size={18} /> Admin Dashboard
                    </button>
                    <button onClick={() => navigate('/')} className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm text-gray-600 dark:text-gray-400">
                        <Home size={18} /> Home
                    </button>
                    <button onClick={() => { localStorage.removeItem('access_token'); navigate('/login'); }} className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-all text-sm text-red-600">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col relative bg-white dark:bg-gray-950 z-10">
                <div className="flex-1 overflow-y-auto pt-8 pb-40 scrollbar-thin dark:scrollbar-thumb-gray-800 scroll-smooth">
                    {messages.length === 0 && !isStreaming ? (
                        <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto px-6 text-center">
                            <div className="w-20 h-20 bg-indigo-600 dark:bg-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl mb-10 animate-in slide-in-from-bottom-10 fade-in duration-700">
                                <span className="text-4xl">✨</span>
                            </div>
                            <h1 className="text-4xl font-extrabold mb-10 tracking-tight text-gray-900 dark:text-white">What's on your mind?</h1>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-4">
                                {suggestions.map((s, i) => (
                                    <button key={i} onClick={() => handleSendMessage(null, `${s.title} ${s.desc}`)} className="text-left p-5 border border-gray-200 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-indigo-200 dark:hover:border-indigo-900 transition-all group shadow-[0_4px_12px_rgba(0,0,0,0.02)] bg-white dark:bg-gray-900/50 flex flex-col items-start gap-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg">{s.icon}</span>
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-wide text-[11px]">{s.title}</span>
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{s.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col w-full">
                            {messages.map((msg, idx) => (
                                <MessageItem
                                    key={msg.id}
                                    msg={msg}
                                    idx={idx}
                                    isLast={idx === messages.length - 1}
                                    isDarkMode={isDarkMode}
                                    copiedId={copiedId}
                                    onCopy={copyToClipboard}
                                    onRegenerate={regenerateResponse}
                                    canRegenerate={!loading && !isStreaming}
                                />
                            ))}
                            {(loading || isStreaming) && (
                                <StreamingMessage
                                    streamingText={streamingText}
                                    loading={loading}
                                    isDarkMode={isDarkMode}
                                    onCopy={copyToClipboard}
                                />
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 pt-12 bg-gradient-to-t from-white dark:from-gray-950 via-white dark:via-gray-950 to-transparent pointer-events-none z-20">
                    <div className="max-w-4xl mx-auto pointer-events-auto">
                        {attachedFile && (
                            <div className="mb-4 flex items-center gap-3 p-3 px-4 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl w-fit animate-in slide-in-from-bottom-2">
                                <FileText size={20} className="text-indigo-600 dark:text-indigo-400" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 truncate max-w-[200px]">{attachedFile.name}</span>
                                    <span className="text-[10px] text-indigo-400 font-medium">Ready for analysis</span>
                                </div>
                                <button onClick={() => setAttachedFile(null)} className="ml-2 p-1 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors">
                                    <X size={14} className="text-indigo-400 hover:text-red-500" />
                                </button>
                            </div>
                        )}
                        <div className="relative group">
                            <form onSubmit={handleSendMessage} className="relative flex items-end gap-3 p-2 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-3xl shadow-[0_8px_32px_-4px_rgba(0,0,0,0.06)] focus-within:border-indigo-500/50 focus-within:ring-8 focus-within:ring-indigo-500/5 transition-all">
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-600 rounded-2xl transition-all disabled:opacity-50" disabled={loading || isStreaming || isParsing}>
                                    {isParsing ? <Loader2 size={24} className="animate-spin text-indigo-600" /> : <Paperclip size={24} />}
                                </button>
                                <button type="button" onClick={() => setMessage('/image ')} className="p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-600 rounded-2xl transition-all disabled:opacity-50" title="Generate Image">
                                    <ImageIcon size={24} />
                                </button>
                                <textarea
                                    className="flex-1 max-h-[200px] min-h-[56px] py-4 px-4 bg-transparent border-none focus:ring-0 text-[16px] text-gray-800 dark:text-gray-100 placeholder-gray-400 resize-none font-medium scrollbar-thin overflow-y-auto"
                                    rows="1" value={message} onChange={(e) => setMessage(e.target.value)}
                                    placeholder={attachedFile ? `Ask about "${attachedFile.name}"...` : "Message ChatGPT... (type /image to generate)"}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
                                />
                                <button type="submit" className="p-3.5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed mb-1 mr-1 shadow-sm" disabled={loading || isStreaming || (!message.trim() && !attachedFile)}>
                                    <Send size={20} />
                                </button>
                            </form>
                            <div className="text-[11px] text-center mt-6 text-gray-400 font-bold uppercase tracking-widest opacity-60">
                                AI Architecture v2.0 • Build with DeepMind Tech
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
