from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from app.services.db_service import save_session, get_user_sessions

router = APIRouter()


class SessionCreate(BaseModel):
    user_id: str = "guest"
    topic: str
    transcript: str
    relevance: int = Field(ge=1, le=10)
    depth: int = Field(ge=1, le=10)
    clarity: int = Field(ge=1, le=10)
    fluency: int = Field(ge=1, le=10)
    filler_count: int = Field(ge=0)
    wpm: int = Field(ge=0)
    audio_url: Optional[str] = ""


class SessionResponse(BaseModel):
    id: str
    user_id: str
    topic: str
    transcript: str
    relevance: int
    depth: int
    clarity: int
    fluency: int
    filler_count: int
    wpm: int
    audio_url: Optional[str] = ""
    timestamp: str


@router.post("/sessions", response_model=SessionResponse, summary="Save a practice session")
async def create_session(payload: SessionCreate):
    session = await save_session(
        user_id=payload.user_id,
        topic=payload.topic,
        transcript=payload.transcript,
        relevance=payload.relevance,
        depth=payload.depth,
        clarity=payload.clarity,
        fluency=payload.fluency,
        filler_count=payload.filler_count,
        wpm=payload.wpm,
        audio_url=payload.audio_url or ""
    )
    return SessionResponse(**session)


@router.get("/sessions", response_model=List[SessionResponse], summary="Get session history")
async def list_sessions(user_id: str = Query("guest", description="User ID or 'guest'")):
    sessions = await get_user_sessions(user_id=user_id)
    return [SessionResponse(**s) for s in sessions]
