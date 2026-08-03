from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.topics import router as topics_router
from app.routes.transcribe import router as transcribe_router
from app.routes.analyze import router as analyze_router
from app.routes.sessions import router as sessions_router

app = FastAPI(
    title="SpeakUp",
    description="AI Communication Skills Trainer backend API",
    version="1.0.0",
)

# CORS Middleware setup for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(topics_router, prefix="/api")
app.include_router(transcribe_router, prefix="/api")
app.include_router(analyze_router, prefix="/api")
app.include_router(sessions_router, prefix="/api")


@app.get("/")
async def root():
    return {"status": "ok", "message": "SpeakUp is running."}
