from fastapi import APIRouter, Query

from services.sports_service import get_live_scores


router = APIRouter()


@router.get("/scores")
async def scores(sport: str = Query(default="nfl")):
    """Get live scores for a given sport.

    Supported: nfl, nba, mlb, nhl, soccer, ncaaf, ncaab
    """
    return await get_live_scores(sport)
