import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { History, TrendingUp, Calendar, MessageSquare, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchSessions } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HistoryScreen() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const userId = user?.id || 'guest';
        const data = await fetchSessions(userId);
        setSessions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const chartData = sessions.slice().reverse().map((s, idx) => {
    const avgScore = Math.round(((s.relevance + s.depth + s.clarity + s.fluency) / 4) * 10);
    return {
      session: `#${idx + 1}`,
      score: avgScore,
      wpm: s.wpm,
      relevance: s.relevance * 10,
      clarity: s.clarity * 10,
      topic: s.topic.length > 25 ? s.topic.substring(0, 25) + '...' : s.topic,
    };
  });

  const avgOverall = sessions.length
    ? Math.round(
        sessions.reduce((acc, s) => acc + ((s.relevance + s.depth + s.clarity + s.fluency) / 4) * 10, 0) / sessions.length
      )
    : 0;

  const avgWpm = sessions.length
    ? Math.round(sessions.reduce((acc, s) => acc + s.wpm, 0) / sessions.length)
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <History className="w-8 h-8 text-indigo-400" />
            <span>Practice Session History</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Track your speech progress, fluency score trends, and past recordings.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-panel px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-gray-400 font-semibold uppercase">Total Sessions</span>
            <div className="text-xl font-black text-white font-mono">{sessions.length}</div>
          </div>
          <div className="glass-panel px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-gray-400 font-semibold uppercase">Avg Score</span>
            <div className="text-xl font-black text-indigo-400 font-mono">{avgOverall}/100</div>
          </div>
          <div className="glass-panel px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-gray-400 font-semibold uppercase">Avg WPM</span>
            <div className="text-xl font-black text-purple-400 font-mono">{avgWpm}</div>
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Speech Performance Progression</span>
            </h3>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232d42" />
                <XAxis dataKey="session" stroke="#8e9bb0" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#8e9bb0" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#151c2c', borderColor: '#232d42', borderRadius: '12px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={3} dot={{ r: 5, fill: '#818cf8' }} name="Overall Score" />
                <Line type="monotone" dataKey="clarity" stroke="#c084fc" strokeWidth={2} strokeDasharray="4 4" name="Clarity" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-300">Past Attempts</h3>
        {loading ? (
          <div className="text-center py-12 text-gray-500 text-xs font-mono animate-pulse">
            Loading session history...
          </div>
        ) : sessions.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
            <Award className="w-12 h-12 text-indigo-400/50 mx-auto" />
            <h4 className="text-base font-bold text-white">No sessions recorded yet</h4>
            <p className="text-xs text-gray-400">Complete your first 1-minute speech practice to view history & score metrics!</p>
          </div>
        ) : (
          sessions.map((s) => {
            const avg = Math.round(((s.relevance + s.depth + s.clarity + s.fluency) / 4) * 10);
            const isExpanded = expandedId === s.id;
            const formattedDate = new Date(s.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div key={s.id} className="glass-card p-5 rounded-2xl space-y-3 border border-gray-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{formattedDate}</span>
                    </div>
                    <h4 className="text-base font-bold text-white">{s.topic}</h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl text-center">
                      <span className="text-[9px] text-indigo-300 font-bold uppercase block">Score</span>
                      <span className="text-sm font-black text-indigo-400 font-mono">{avg}/100</span>
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl text-center">
                      <span className="text-[9px] text-purple-300 font-bold uppercase block">WPM</span>
                      <span className="text-sm font-black text-purple-400 font-mono">{s.wpm}</span>
                    </div>

                    <div className="bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl text-center">
                      <span className="text-[9px] text-rose-300 font-bold uppercase block">Fillers</span>
                      <span className="text-sm font-black text-rose-400 font-mono">{s.filler_count}</span>
                    </div>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : s.id)}
                      className="p-2 rounded-xl bg-gray-900 text-gray-400 hover:text-white transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="pt-3 border-t border-gray-800 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-indigo-300 font-bold">
                      <MessageSquare className="w-3.5 h-3.5" /> Transcript:
                    </div>
                    <p className="bg-gray-950 p-3 rounded-xl text-gray-300 font-mono leading-relaxed">
                      "{s.transcript}"
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
