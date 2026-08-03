from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.groq_service import analyze_speech

router = APIRouter()


class AnalyzeRequest(BaseModel):
    topic: str
    transcript: str
    duration_seconds: int = Field(default=60, ge=1, le=600)


class AnalysisResult(BaseModel):
    relevance: int
    depth: int
    clarity: int
    fluency: int
    filler_count: int
    wpm: int
    tips: list[str]


@router.post("/analyze", response_model=AnalysisResult, summary="Analyze speech transcript with AI")
async def analyze_transcript(payload: AnalyzeRequest):
    """
    Evaluates speech transcript against topic for Relevance, Depth, Clarity, Fluency (1-10 scores),
    filler count, WPM, and 3 actionable improvement tips.
    """
    if not payload.transcript or not payload.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript cannot be empty.")

    if not payload.topic or not payload.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty.")

    result = await analyze_speech(
        topic=payload.topic,
        transcript=payload.transcript,
        duration_seconds=payload.duration_seconds
    )

    return AnalysisResult(**result)
