from fastapi import APIRouter

from services.news_service import get_trending_news


router = APIRouter()


@router.get("/news")
async def trending_news():
    """Get trending sports news headlines."""
    articles = await get_trending_news(count=4)
    return {"articles": articles}
