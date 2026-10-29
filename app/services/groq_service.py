import os
import json
import re
from fastapi import HTTPException
from groq import AsyncGroq

COMMON_FILLERS = [
    r"\bum\b", r"\bah\b", r"\buh\b", r"\ber\b", r"\blike\b",
    r"\byou know\b", r"\bbasically\b", r"\bso\b", r"\bactually\b",
    r"\bright\b", r"\bsort of\b", r"\bkind of\b", r"\bi mean\b"
]


def get_client() -> AsyncGroq:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not set.")
    return AsyncGroq(api_key=api_key)


async def generate_topics(headlines: list[str], difficulty: str = "medium") -> list[dict]:
    headlines_text = "\n".join(f"{i+1}. {h}" for i, h in enumerate(headlines))

    difficulty_instructions = {
        "easy": "Select 3 simple, engaging topics that are easy for anyone to discuss spontaneously.",
        "medium": "Select 3 balanced news topics requiring thoughtful commentary and structured points.",
        "hard": "Select 3 complex, challenging geopolitical, economic, or policy topics requiring deep nuance and critical thinking."
    }.get(difficulty.lower(), "Select 3 balanced news topics for talk show conversation.")

    prompt = f"""You are an executive talk show producer. Below are today's top headlines:
{headlines_text}

Difficulty Level: {difficulty.upper()}
{difficulty_instructions}

Return ONLY a valid JSON object with a "topics" array containing exactly 3 objects:
{{
  "topics": [
    {{
      "id": 1,
      "title": "Short punchy topic title",
      "context": "Two-sentence background context for the talk show host to initiate conversation."
    }},
    {{
      "id": 2,
      "title": "Second topic title",
      "context": "Two-sentence background context."
    }},
    {{
      "id": 3,
      "title": "Third topic title",
      "context": "Two-sentence background context."
    }}
  ]
}}"""

    client = get_client()
    models_to_try = ["openai/gpt-oss-20b"]
    completion = None
    last_err = None

    for model_name in models_to_try:
        try:
            completion = await client.chat.completions.create(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                response_format={"type": "json_object"},
            )
            break
        except Exception as e:
            last_err = e
            continue

    if completion is None:
        raise HTTPException(status_code=500, detail=f"Groq API call failed: {last_err}")

    raw = completion.choices[0].message.content

    try:
        parsed = json.loads(raw)
        items = parsed.get("topics") if isinstance(parsed, dict) else parsed
        if not items and isinstance(parsed, dict):
            items = next(v for v in parsed.values() if isinstance(v, list))
        return items[:3]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse Groq response: {e}")


def count_filler_words(transcript: str) -> int:
    text_lower = transcript.lower()
    total_count = 0
    for pattern in COMMON_FILLERS:
        matches = re.findall(pattern, text_lower)
        total_count += len(matches)
    return total_count


async def analyze_speech(topic: str, transcript: str, duration_seconds: int = 60) -> dict:
    # Calculate word count & WPM
    words = [w for w in transcript.split() if w.strip()]
    word_count = len(words)
    effective_duration_minutes = max(duration_seconds, 15) / 60.0
    calculated_wpm = int(round(word_count / effective_duration_minutes))

    # Calculate filler count
    local_filler_count = count_filler_words(transcript)

    prompt = f"""You are an expert executive communication coach evaluating a user's 1-minute talk show speech.

Topic: "{topic}"
User Transcript: "{transcript}"

Evaluate the speech across 4 dimensions on a integer scale from 1 to 10:
1. Relevance (1-10): How directly and accurately did the speaker address the topic?
2. Depth (1-10): Did the speaker offer meaningful insights, examples, or reasoned arguments?
3. Clarity (1-10): Is the speech clear, coherent, and easy to follow?
4. Fluency (1-10): Smoothness of speech delivery and vocabulary usage.

Also provide 3 specific, actionable improvement tips to help the speaker communicate better.

Return ONLY a valid JSON object with the following exact keys:
{{
  "relevance": 8,
  "depth": 7,
  "clarity": 9,
  "fluency": 8,
  "tips": [
    "Tip 1: First constructive actionable recommendation...",
    "Tip 2: Second constructive actionable recommendation...",
    "Tip 3: Third constructive actionable recommendation..."
  ]
}}"""

    client = get_client()
    models_to_try = ["openai/gpt-oss-20b"]
    completion = None
    last_err = None

    for model_name in models_to_try:
        try:
            completion = await client.chat.completions.create(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                response_format={"type": "json_object"},
            )
            break
        except Exception as e:
            last_err = e
            continue

    if completion is None:
        raise HTTPException(status_code=500, detail=f"Groq speech analysis failed: {last_err}")

    raw = completion.choices[0].message.content

    try:
        data = json.loads(raw)
        return {
            "relevance": int(data.get("relevance", 7)),
            "depth": int(data.get("depth", 7)),
            "clarity": int(data.get("clarity", 7)),
            "fluency": int(data.get("fluency", 7)),
            "filler_count": local_filler_count,
            "wpm": calculated_wpm,
            "tips": data.get("tips", [
                "Structure your main argument with a clear beginning, middle, and conclusion.",
                "Pace your delivery to eliminate pause fillers.",
                "Use strong specific examples to add depth to your talk."
            ])[:3]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse speech analysis response: {e}")
