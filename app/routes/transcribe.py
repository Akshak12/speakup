from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.services.whisper_service import transcribe_audio_bytes

router = APIRouter()


class TranscribeResponse(BaseModel):
    transcript: str


@router.post("/transcribe", response_model=TranscribeResponse, summary="Transcribe audio file via Whisper")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Accepts an audio file upload (.webm, .mp3, .wav, etc.) and returns speech-to-text transcript using Groq Whisper.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No audio file uploaded.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded audio file is empty.")

    transcript = await transcribe_audio_bytes(content, filename=file.filename or "recording.webm")
    return TranscribeResponse(transcript=transcript)
