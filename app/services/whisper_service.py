import os
import io
from fastapi import HTTPException
from groq import AsyncGroq
from openai import AsyncOpenAI


async def transcribe_audio_bytes(file_bytes: bytes, filename: str = "audio.webm") -> str:
    """
    Transcribes audio bytes using Groq Whisper (whisper-large-v3).
    Falls back to OpenAI Whisper if Groq fails and OPENAI_API_KEY is available.
    """
    groq_api_key = os.getenv("GROQ_API_KEY")
    openai_api_key = os.getenv("OPENAI_API_KEY")

    if not groq_api_key and not openai_api_key:
        raise HTTPException(
            status_code=500,
            detail="Neither GROQ_API_KEY nor OPENAI_API_KEY is set for audio transcription."
        )

    # 1. Primary: Try Groq Whisper (Free)
    if groq_api_key:
        try:
            client = AsyncGroq(api_key=groq_api_key)
            audio_file = (filename, file_bytes)
            transcription = await client.audio.transcriptions.create(
                file=audio_file,
                model="whisper-large-v3",
                response_format="text",
                language="en",
            )
            if isinstance(transcription, str):
                return transcription.strip()
            return getattr(transcription, "text", str(transcription)).strip()
        except Exception as e:
            print(f"[WhisperService] Groq Whisper failed: {e}. Trying OpenAI fallback...")

    # 2. Fallback: OpenAI Whisper if key present
    if openai_api_key:
        try:
            client = AsyncOpenAI(api_key=openai_api_key)
            audio_file = (filename, file_bytes)
            transcription = await client.audio.transcriptions.create(
                file=audio_file,
                model="whisper-1",
                response_format="text",
            )
            if isinstance(transcription, str):
                return transcription.strip()
            return getattr(transcription, "text", str(transcription)).strip()
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Audio transcription failed on OpenAI Whisper: {e}"
            )

    raise HTTPException(
        status_code=500,
        detail="Audio transcription failed using Groq Whisper."
    )
