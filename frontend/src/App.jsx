import React, { useState } from 'react';
import Navbar from './components/Navbar';
import TopicSelector from './components/TopicSelector';
import RecordingScreen from './components/RecordingScreen';
import ResultsScreen from './components/ResultsScreen';
import HistoryScreen from './components/HistoryScreen';
import AuthModal from './components/AuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { saveSession } from './services/api';

function MainApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('practice'); // 'practice' | 'history'
  const [flowStep, setFlowStep] = useState('selectTopic'); // 'selectTopic' | 'record' | 'results'
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleSelectTopic = (topic) => {
    setSelectedTopic(topic);
    setFlowStep('record');
  };

  const handleCompleteAnalysis = async (data) => {
    setAnalysisResult(data);
    setFlowStep('results');

    // Automatically save session
    try {
      await saveSession({
        user_id: user?.id || 'guest',
        topic: data.topic.title,
        transcript: data.transcript,
        relevance: data.relevance,
        depth: data.depth,
        clarity: data.clarity,
        fluency: data.fluency,
        filler_count: data.filler_count,
        wpm: data.wpm,
        audio_url: data.audioUrl || '',
      });
    } catch (err) {
      console.warn('Auto-save session failed:', err);
    }
  };

  const handleTryAgain = () => {
    setSelectedTopic(null);
    setAnalysisResult(null);
    setFlowStep('selectTopic');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'practice' && flowStep === 'results') {
            setFlowStep('selectTopic');
          }
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        {activeTab === 'practice' && (
          <>
            {flowStep === 'selectTopic' && (
              <TopicSelector onSelectTopic={handleSelectTopic} />
            )}

            {flowStep === 'record' && selectedTopic && (
              <RecordingScreen
                topic={selectedTopic}
                onBack={() => setFlowStep('selectTopic')}
                onCompleteAnalysis={handleCompleteAnalysis}
              />
            )}

            {flowStep === 'results' && analysisResult && (
              <ResultsScreen
                result={analysisResult}
                onTryAgain={handleTryAgain}
              />
            )}
          </>
        )}

        {activeTab === 'history' && (
          <HistoryScreen onSelectTopic={handleSelectTopic} />
        )}
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
