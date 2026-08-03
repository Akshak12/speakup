import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, RotateCcw, Send, Clock, Volume2, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { transcribeAudio, analyzeSpeech } from '../services/api';

export default function RecordingScreen({ topic, onBack, onCompleteAnalysis }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(60);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [statusText, setStatusText] = useState('Ready to speak');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const startVisualizer = (stream) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 64;

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      const draw = () => {
        animFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#4f46e5');
          gradient.addColorStop(1, '#c084fc');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
          x += barWidth;
        }
      };

      draw();
    } catch (e) {
      console.warn('Audio visualizer failed:', e);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(60);
      setStatusText('Recording live...');
      startVisualizer(stream);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      setStatusText('Microphone access denied or unsupported.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setStatusText('Recording completed');
    }
  };

  const resetRecording = () => {
    stopRecording();
    setRecordedAudio(null);
    setAudioUrl(null);
    setRecordingTime(60);
    setStatusText('Ready to speak');
  };

  const handleSubmit = async () => {
    if (!recordedAudio) return;

    setIsAnalyzing(true);
    try {
      setAnalysisStep('Transcribing audio with Whisper...');
      const transcriptText = await transcribeAudio(recordedAudio);

      setAnalysisStep('Evaluating speech scores with Groq AI...');
      const durationSpoken = 60 - recordingTime;
      const evaluation = await analyzeSpeech(topic.title, transcriptText, durationSpoken || 60);

      onCompleteAnalysis({
        topic,
        transcript: transcriptText,
        ...evaluation,
        audioUrl,
      });
    } catch (err) {
      console.error(err);
      alert('Analysis failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <button
        onClick={onBack}
        disabled={isAnalyzing}
        className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Topics</span>
      </button>

      <div className="glass-panel p-6 rounded-3xl space-y-3 border border-indigo-500/30">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 rounded-full">
            Selected Talk Topic
          </span>
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold">
            <Clock className="w-3.5 h-3.5" /> 1-Min Prompt
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white">{topic.title}</h2>
        <p className="text-xs text-gray-300 bg-gray-900/60 p-3.5 rounded-xl leading-relaxed border border-gray-800">
          {topic.context}
        </p>
      </div>

      <div className="glass-panel p-8 rounded-3xl text-center space-y-8 relative overflow-hidden">
        <div className="space-y-2">
          <div className="text-5xl font-black font-mono tracking-tight text-white">
            00:{recordingTime < 10 ? `0${recordingTime}` : recordingTime}
          </div>
          <p className="text-xs font-medium text-indigo-300 uppercase tracking-widest">
            {statusText}
          </p>
        </div>

        <div className="w-full h-24 bg-gray-900/80 rounded-2xl flex items-center justify-center p-2 border border-gray-800 relative">
          <canvas ref={canvasRef} width={500} height={80} className="w-full h-full" />
          {!isRecording && !recordedAudio && (
            <span className="absolute text-xs text-gray-500 font-medium">
              Audio waveform will display while speaking
            </span>
          )}
        </div>

        {audioUrl && !isRecording && (
          <div className="bg-gray-900/90 p-4 rounded-2xl border border-gray-800 flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-indigo-400" />
            <audio src={audioUrl} controls className="w-full h-8" />
          </div>
        )}

        <div className="flex items-center justify-center gap-4">
          {!isRecording && !recordedAudio && (
            <button
              onClick={startRecording}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm flex items-center gap-3 shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all"
            >
              <Mic className="w-5 h-5" />
              <span>Start Recording (1 Min)</span>
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm flex items-center gap-3 shadow-xl shadow-rose-600/30 animate-pulse"
            >
              <Square className="w-5 h-5" />
              <span>Stop Recording</span>
            </button>
          )}

          {recordedAudio && !isRecording && (
            <div className="flex items-center gap-3">
              <button
                onClick={resetRecording}
                disabled={isAnalyzing}
                className="px-5 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs flex items-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Re-record</span>
              </button>

              <button
                onClick={handleSubmit}
                disabled={isAnalyzing}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit for AI Analysis</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {isAnalyzing && (
          <div className="absolute inset-0 glass-panel bg-gray-950/90 flex flex-col items-center justify-center space-y-4 z-20 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">AI Evaluation Engine</h3>
              <p className="text-xs text-indigo-300 font-medium">{analysisStep}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
