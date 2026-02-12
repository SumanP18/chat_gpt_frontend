import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, MessageSquare, Zap, Shield } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center pt-24 pb-20 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold tracking-wide mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles size={16} />
          Introducing Chat Architecture v2.0
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-center text-gray-900 dark:text-white mb-8 tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000">
          The Next Evolution of <br />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">AI Intelligence.</span>
        </h1>

        <p className="text-lg md:text-xl text-center text-gray-500 dark:text-gray-400 mb-12 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          Experience a full-featured AI powerhouse with document analysis,
          image generation, and enterprise-grade administration.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
          <Link
            to="/dashboard"
            className="group flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-200 dark:shadow-none hover:scale-105 active:scale-95"
          >
            Try for free
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/signup"
            className="px-8 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm hover:scale-105 active:scale-95"
          >
            View Demo
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          {[
            { icon: <MessageSquare className="text-indigo-600" />, title: "Smart Chat", desc: "Advanced context-aware conversations." },
            { icon: <Zap className="text-emerald-600" />, title: "Real-time AI", desc: "Instant responses with streaming simulation." },
            { icon: <Shield className="text-purple-600" />, title: "Secure Admin", desc: "Enterprise-grade user and usage management." }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-100 dark:border-gray-800/50 hover:border-indigo-500/50 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
