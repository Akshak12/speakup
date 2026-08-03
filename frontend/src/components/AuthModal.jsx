import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        alert('Account created! Please check your email to confirm registration or sign in.');
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="glass-panel max-w-md w-full p-6 rounded-3xl relative border border-gray-800 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {isSignUp ? 'Create SpeakUp Account' : 'Welcome Back to SpeakUp'}
          </h2>
          <p className="text-xs text-gray-400">Save sessions, sync scores & track communication growth</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-800">
          <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-indigo-400 font-bold hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={onClose}
            className="text-[11px] text-gray-500 hover:text-gray-300 underline"
          >
            Continue as Guest (Local sessions)
          </button>
        </div>
      </div>
    </div>
  );
}
