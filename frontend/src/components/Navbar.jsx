import React from 'react';
import { Mic, History, User, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, onOpenAuth }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-gray-800/80 px-4 md:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          onClick={() => setActiveTab('practice')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white font-sans">Speak<span className="gradient-text">Up</span></span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> AI
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium">Communication Skills Trainer</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-gray-900/60 p-1.5 rounded-xl border border-gray-800">
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'practice'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Practice</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </button>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 bg-gray-900/80 px-3 py-1.5 rounded-xl border border-gray-800">
              <div className="w-7 h-7 rounded-full bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-300">
                {user.email?.[0].toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-medium text-gray-300 max-w-[120px] truncate hidden md:inline">
                {user.email}
              </span>
              <button
                onClick={logout}
                title="Sign out"
                className="text-gray-400 hover:text-red-400 transition-colors p-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-700/80 transition-all hover:border-gray-600"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
