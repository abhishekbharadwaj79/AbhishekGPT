import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import chat, scores, conversations, news

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("sportsgpt")

app = FastAPI(title="SportsGPT API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")
app.include_router(scores.router, prefix="/api")
app.include_router(conversations.router, prefix="/api")
app.include_router(news.router, prefix="/api")

logger.info("SportsGPT API started. CORS origins: %s", settings.cors_origins_list)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
