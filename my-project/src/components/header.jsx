import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MessageSquare, LayoutDashboard, Settings, User } from 'lucide-react'

const Header = () => {
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Don't show header on dashboard or admin pages as they have their own sidebars
    if (location.pathname === '/dashboard' || location.pathname === '/admin') return null;

    return (
        <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 py-3 shadow-sm' : 'bg-transparent py-6'}`}>
            <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <MessageSquare className="text-white" size={24} />
                    </div>
                    <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Chat<span className="text-indigo-600">v2</span></span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {['About', 'Contact'].map((item) => (
                        <Link
                            key={item}
                            to={`/${item.toLowerCase()}`}
                            className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors uppercase tracking-widest"
                        >
                            {item}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        to="/login"
                        className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors px-4 py-2"
                    >
                        Login
                    </Link>
                    <Link
                        to="/signup"
                        className="px-6 py-2.5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-xl text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>
        </header>
    )
}

export default Header
