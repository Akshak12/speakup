import React, { useState, useEffect } from 'react';
import { RefreshCw, Flame, Zap, ShieldAlert, ChevronRight, Newspaper, AlertCircle } from 'lucide-react';
import { fetchTopics } from '../services/api';

export default function TopicSelector({ onSelectTopic }) {
  const [difficulty, setDifficulty] = useState('medium');
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTopics = async (diffLevel) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTopics(diffLevel);
      setTopics(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to fetch news topics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics(difficulty);
  }, [difficulty]);

  const difficultyLevels = [
    { id: 'easy', label: 'Easy', icon: Zap, color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400' },
    { id: 'medium', label: 'Medium', icon: Flame, color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-400' },
    { id: 'hard', label: 'Hard', icon: ShieldAlert, color: 'from-rose-500/20 to-amber-500/10 border-rose-500/30 text-rose-400' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
          Select Today's <span className="gradient-text">Speakable Topic</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
          Fresh real-time news headlines curated by AI into talk-show conversation prompts. Pick one and deliver a 1-minute speech.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-2.5 rounded-2xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 hidden sm:inline">Difficulty:</span>
          <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto">
            {difficultyLevels.map((level) => {
              const Icon = level.icon;
              const isSelected = difficulty === level.id;
              return (
                <button
                  key={level.id}
                  onClick={() => setDifficulty(level.id)}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/50 scale-[1.02]'
                      : 'bg-gray-900/60 text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{level.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => loadTopics(difficulty)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Headlines</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="glass-card p-6 rounded-2xl space-y-4 animate-pulse">
              <div className="w-20 h-5 bg-gray-800 rounded-full" />
              <div className="w-full h-12 bg-gray-800 rounded-lg" />
              <div className="w-full h-20 bg-gray-800/60 rounded-lg" />
              <div className="w-full h-10 bg-gray-800 rounded-xl mt-4" />
            </div>
          ))
        ) : (
          topics.map((topic, index) => (
            <div
              key={topic.id || index}
              className="glass-card p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group border border-gray-800 hover:border-indigo-500/50"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full flex items-center gap-1.5">
                    <Newspaper className="w-3 h-3" /> Topic #{index + 1}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                  {topic.title}
                </h3>

                <p className="text-xs text-gray-400 leading-relaxed bg-gray-900/50 p-3.5 rounded-xl border border-gray-800/60">
                  {topic.context}
                </p>
              </div>

              <button
                onClick={() => onSelectTopic(topic)}
                className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 group-hover:shadow-indigo-600/40 transition-all"
              >
                <span>Practice This Topic</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
