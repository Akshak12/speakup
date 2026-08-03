import React from 'react';
import { Award, Zap, CheckCircle2, RotateCcw, MessageSquare, Volume2, Sparkles, AlertTriangle, TrendingUp } from 'lucide-react';

export default function ResultsScreen({ result, onTryAgain }) {
  const { topic, transcript, relevance, depth, clarity, fluency, filler_count, wpm, tips, audioUrl } = result;

  const avgScore = Math.round(((relevance + depth + clarity + fluency) / 4) * 10);

  const getScoreColor = (score) => {
    if (score >= 8) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    if (score >= 6) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    return { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
  };

  const renderHighlightedTranscript = () => {
    if (!transcript) return 'No speech recorded.';

    const fillerRegex = /\b(um|ah|uh|er|like|you know|basically|so|actually|right|sort of|kind of|i mean)\b/gi;
    const parts = transcript.split(fillerRegex);

    return parts.map((part, i) => {
      if (part.match(fillerRegex)) {
        return (
          <span key={i} className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const scoresList = [
    { label: 'Relevance', value: relevance, desc: 'Topic alignment' },
    { label: 'Depth', value: depth, desc: 'Argument substance' },
    { label: 'Clarity', value: clarity, desc: 'Structure & logic' },
    { label: 'Fluency', value: fluency, desc: 'Vocabulary & delivery' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden border border-indigo-500/30">
        <div className="grid md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Speech Evaluation Completed
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">{topic.title}</h1>
            <p className="text-xs text-gray-400">1-Minute Talk Show Commentary Evaluation</p>

            {audioUrl && (
              <div className="pt-2 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-400" />
                <audio src={audioUrl} controls className="h-7 w-64 rounded" />
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-950/80 to-purple-950/80 rounded-2xl border border-indigo-500/30 text-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Overall Score</span>
            <div className="text-5xl font-black text-white my-1 font-mono">{avgScore}<span className="text-lg text-indigo-400">/100</span></div>
            <span className="text-[11px] font-semibold text-indigo-300">
              {avgScore >= 85 ? 'Outstanding Executive Speech!' : avgScore >= 70 ? 'Solid Speech Delivery!' : 'Needs Practice & Refinement'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {scoresList.map((item) => {
          const style = getScoreColor(item.value);
          return (
            <div key={item.label} className={`glass-card p-5 rounded-2xl border ${style.border} space-y-2`}>
              <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                <span>{item.label}</span>
                <span className={`text-lg font-black ${style.text}`}>{item.value}/10</span>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden border border-gray-800">
                <div
                  className={`h-full transition-all duration-1000 ${item.value >= 8 ? 'bg-emerald-500' : item.value >= 6 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  style={{ width: `${item.value * 10}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400">{item.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-white">{wpm}</span>
              <span className="text-xs font-semibold text-gray-400">Words Per Minute (WPM)</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {wpm >= 120 && wpm <= 160
                ? 'Optimal conversational pace! Easy for listeners to digest.'
                : wpm < 120
                ? 'Slightly slow pace. Try picking up momentum.'
                : 'Rapid delivery. Consider pausing to emphasize key points.'}
            </p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-white">{filler_count}</span>
              <span className="text-xs font-semibold text-gray-400">Filler Words Detected</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {filler_count === 0
                ? 'Perfect! Zero filler words detected.'
                : filler_count <= 3
                ? 'Low filler word usage. Great control.'
                : 'High filler word frequency (um, ah, like). Try pausing silently instead.'}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <span>Speech Transcript & Filler Word Analysis</span>
        </div>
        <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 text-xs md:text-sm leading-relaxed text-gray-200 font-mono">
          {renderHighlightedTranscript()}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-400" />
          <span>3 AI Communication Tips for Next Session</span>
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {tips.map((tip, idx) => (
            <div key={idx} className="glass-card p-5 rounded-2xl space-y-2 border border-indigo-500/20">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center justify-center">
                #{idx + 1}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={onTryAgain}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Practice Another Topic</span>
        </button>
      </div>
    </div>
  );
}
