# SpeakUp

Most people can write a decent email. Fewer can speak confidently when put on the spot - in an interview, a group discussion, or just explaining something to a room full of people.

SpeakUp is a practice tool for that. You get a real trending news topic, speak about it for a minute, and get back a breakdown of how well you actually did - not just a vague "good job" but specific scores, filler word counts, your speaking pace, and concrete things to fix.

---

## How It Works

1. The app pulls current headlines from NewsAPI and uses Groq AI to pick 3 topics worth speaking about
2. You pick one, hit record, and speak for 60 seconds
3. Your audio gets transcribed via OpenAI Whisper
4. The transcript goes back to Groq AI which scores your response across 4 parameters and gives you 3 specific improvement tips
5. Results show up instantly : scores, filler words, WPM, full transcript

---

## Scoring

Every session gives you a score out of 10 for:

- **Relevance** - did you actually talk about the topic or drift?
- **Depth** - did you go beyond surface level, use examples, show an opinion?
- **Clarity** - was your language structured and easy to follow?
- **Fluency** - did you speak smoothly or were you stopping and searching for words?

Plus filler word count (um, uh, like, you know) and words per minute.

---

## Live Demo
https://speakup-app-1.vercel.app

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React.js, Tailwind CSS |
| Backend | Python, FastAPI |
| Database | PostgreSQL via Supabase |
| Speech to Text | OpenAI Whisper |
| AI Analysis | Groq AI (llama3) |
| News | NewsAPI |
| Audio Storage | Supabase Storage |
| Deploy | Vercel + Render |

---

## Running Locally

**Prerequisites:** Python 3.11+, Node.js 18+, a Supabase project, Groq API key, NewsAPI key

**Backend**

```bash
cd speakup
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Create a `.env` file in the root:

```
GROQ_API_KEY=your_groq_key
NEWS_API_KEY=your_newsapi_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_key
```

```bash
py -m uvicorn app.main:app --port 8000 --reload
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

---

## API Endpoints

```
GET  /api/topics?difficulty=easy|medium|hard   - fetch 3 trending topics
POST /api/transcribe                            - upload audio, get transcript
POST /api/analyze                              - score transcript against topic
GET  /api/sessions                             - fetch session history
POST /api/sessions                             - save a session
```

---

## Features

- Topic difficulty levels : Easy, Medium, Hard
- Live audio waveform visualizer while recording
- Filler word highlighting in transcript
- Session history with score trend graphs
- Guest mode or full auth via Supabase
- Sub-5 second analysis turnaround

---

## Project Structure

```
speakup/
├── app/
│   ├── routes/
│   │   ├── topics.py
│   │   ├── transcribe.py
│   │   ├── analyze.py
│   │   └── sessions.py
│   ├── services/
│   │   ├── groq_service.py
│   │   ├── whisper_service.py
│   │   └── news_service.py
│   └── main.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TopicSelector.jsx
│   │   │   ├── RecordingScreen.jsx
│   │   │   └── ResultsScreen.jsx
│   │   └── services/
│   │       ├── api.js
│   │       └── supabase.js
│   └── package.json
├── requirements.txt
└── supabase_schema.sql
```

---

## Why I Built This

Communication skills don't get better by reading about them. You need reps and most people don't practice because there's no feedback loop. This is an attempt at building one.

---
