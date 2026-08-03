import os
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

try:
    from supabase import create_client, Client
except ImportError:
    create_client = None
    Client = None

# In-memory store fallback for local development when Supabase is not yet configured
_in_memory_sessions: List[Dict[str, Any]] = []


def get_supabase_client() -> Optional[Any]:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
    if url and key and create_client:
        try:
            return create_client(url, key)
        except Exception as e:
            print(f"[DB] Failed to initialize Supabase client: {e}")
    return None


async def save_session(
    user_id: str,
    topic: str,
    transcript: str,
    relevance: int,
    depth: int,
    clarity: int,
    fluency: int,
    filler_count: int,
    wpm: int,
    audio_url: str = ""
) -> Dict[str, Any]:
    client = get_supabase_client()
    timestamp_str = datetime.now(timezone.utc).isoformat()
    session_id = str(uuid.uuid4())

    session_data = {
        "id": session_id,
        "user_id": user_id,
        "topic": topic,
        "transcript": transcript,
        "relevance": relevance,
        "depth": depth,
        "clarity": clarity,
        "fluency": fluency,
        "filler_count": filler_count,
        "wpm": wpm,
        "audio_url": audio_url,
        "timestamp": timestamp_str
    }

    if client:
        try:
            res = client.table("sessions").insert(session_data).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            print(f"[DB] Error inserting session to Supabase: {e}")

    # Fallback to local memory
    _in_memory_sessions.insert(0, session_data)
    return session_data


async def get_user_sessions(user_id: str = "guest") -> List[Dict[str, Any]]:
    client = get_supabase_client()
    if client:
        try:
            query = client.table("sessions").select("*")
            if user_id != "all" and user_id != "guest":
                query = query.eq("user_id", user_id)
            res = query.order("timestamp", desc=True).execute()
            if res.data:
                return res.data
        except Exception as e:
            print(f"[DB] Error fetching sessions from Supabase: {e}")

    # Fallback return in-memory items
    if user_id != "all" and user_id != "guest":
        return [s for s in _in_memory_sessions if s.get("user_id") == user_id]
    return _in_memory_sessions
