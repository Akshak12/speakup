import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 45000,
});

export const fetchTopics = async (difficulty = 'medium') => {
  const response = await client.get('/topics', {
    params: { difficulty }
  });
  return response.data.topics;
};

export const transcribeAudio = async (audioBlob) => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  
  const response = await client.post('/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.transcript;
};

export const analyzeSpeech = async (topic, transcript, durationSeconds = 60) => {
  const response = await client.post('/analyze', {
    topic,
    transcript,
    duration_seconds: durationSeconds
  });
  return response.data;
};

export const saveSession = async (sessionData) => {
  const response = await client.post('/sessions', sessionData);
  return response.data;
};

export const fetchSessions = async (userId = 'guest') => {
  const response = await client.get('/sessions', {
    params: { user_id: userId }
  });
  return response.data;
};
