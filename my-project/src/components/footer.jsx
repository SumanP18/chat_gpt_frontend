import React from 'react'
import { useLocation } from 'react-router-dom'
import { Github, Twitter, Linkedin } from 'lucide-react'

const Footer = () => {
    const location = useLocation();

    // Hide footer on dashboard or admin pages
    if (location.pathname === '/dashboard' || location.pathname === '/admin') return null;

    return (
        <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 py-20">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
                        <span className="text-lg font-black tracking-tight text-gray-900 dark:text-white">Chat<span className="text-indigo-600">v2</span></span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm leading-relaxed mb-8">
                        The ultimate AI platform for advanced conversations,
                        document intelligence, and high-quality image generation.
                    </p>
                    <div className="flex gap-4">
                        {[Github, Twitter, Linkedin].map((Icon, i) => (
                            <a key={i} href="#" className="w-10 h-10 rounded-full border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-600 transition-all">
                                <Icon size={18} />
                            </a>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase text-[11px] tracking-widest">Platform</h4>
                    <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
                        <li><a href="#" className="hover:text-indigo-600 transition-colors">Features</a></li>
                        <li><a href="#" className="hover:text-indigo-600 transition-colors">Pricing</a></li>
                        <li><a href="#" className="hover:text-indigo-600 transition-colors">API Reference</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase text-[11px] tracking-widest">Company</h4>
                    <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
                        <li><a href="#" className="hover:text-indigo-600 transition-colors">About</a></li>
                        <li><a href="#" className="hover:text-indigo-600 transition-colors">Blog</a></li>
                        <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-gray-50 dark:border-gray-900 text-center">
                <p className="text-xs text-gray-400 font-medium tracking-wide">&copy; 2026 CHATGPT V2. ALL RIGHTS RESERVED.</p>
            </div>
        </footer>
    )
}

export default Footer
