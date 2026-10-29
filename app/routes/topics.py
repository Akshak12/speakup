import os
import httpx
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from app.services.groq_service import generate_topics

router = APIRouter()

NEWS_API_URL = "https://newsapi.org/v2/top-headlines"


class Topic(BaseModel):
    id: int
    title: str
    context: str


class TopicsResponse(BaseModel):
    topics: list[Topic]


async def fetch_headlines() -> list[str]:
    news_api_key = os.getenv("NEWS_API_KEY")
    if not news_api_key:
        raise HTTPException(status_code=500, detail="NEWS_API_KEY is not set.")

    params = {
        "language": "en",
        "pageSize": 10,
        "apiKey": news_api_key,
    }
    async with httpx.AsyncClient() as http:
        response = await http.get(NEWS_API_URL, params=params, timeout=10.0)

    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"NewsAPI error: {response.status_code} - {response.text}",
        )

    data = response.json()
    articles = data.get("articles", [])

    if not articles:
        raise HTTPException(status_code=502, detail="NewsAPI returned no articles.")

    return [a["title"] for a in articles if a.get("title")]


@router.get("/topics", response_model=TopicsResponse, summary="Get 3 speakable topics based on difficulty")
async def get_topics(difficulty: str = Query("medium", description="Difficulty level: easy, medium, hard")):
    """
    Fetches the 10 latest news headlines, sends them to Groq AI (GPT-OSS 20B),
    and returns 3 curated speakable topics with context filtered by difficulty.
    """
    headlines = await fetch_headlines()
    raw_topics = await generate_topics(headlines, difficulty=difficulty)
    
    topics = [
        Topic(
            id=t.get("id", i + 1),
            title=t.get("title", f"Topic {i+1}"),
            context=t.get("context", "")
        )
        for i, t in enumerate(raw_topics[:3])
    ]
    return TopicsResponse(topics=topics)
