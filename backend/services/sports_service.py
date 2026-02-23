import httpx
from typing import Any


SPORT_ENDPOINTS = {
    "nfl": "football/nfl",
    "nba": "basketball/nba",
    "mlb": "baseball/mlb",
    "nhl": "hockey/nhl",
    "soccer": "soccer/eng.1",
    "ncaaf": "football/college-football",
    "ncaab": "basketball/mens-college-basketball",
    "cricket": "cricket/8676",
    "ipl": "cricket/8048",
    "bbl": "cricket/8044",
    "psl": "cricket/10886",
    "cpl": "cricket/10889",
    "the_hundred": "cricket/10890",
    "sa20": "cricket/12344",
    "county": "cricket/8052",
}

BASE_URL = "https://site.api.espn.com/apis/site/v2/sports"


async def get_live_scores(sport: str) -> dict[str, Any]:
    """Fetch live scores from ESPN's public API."""
    endpoint = SPORT_ENDPOINTS.get(sport.lower())
    if not endpoint:
        return {
            "error": f"Unsupported sport: {sport}",
            "supported": list(SPORT_ENDPOINTS.keys()),
        }

    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/{endpoint}/scoreboard")
        response.raise_for_status()
        data = response.json()

    games = []
    for event in data.get("events", []):
        competition = event["competitions"][0]
        competitors = competition["competitors"]
        # ESPN lists home first, away second
        home = competitors[0]
        away = competitors[1]
        games.append({
            "name": event.get("name", ""),
            "status": event.get("status", {}).get("type", {}).get("description", ""),
            "home_team": home["team"]["displayName"],
            "home_abbreviation": home["team"].get("abbreviation", ""),
            "home_score": home.get("score", "0"),
            "home_logo": home["team"].get("logo", ""),
            "home_color": home["team"].get("color", ""),
            "away_team": away["team"]["displayName"],
            "away_abbreviation": away["team"].get("abbreviation", ""),
            "away_score": away.get("score", "0"),
            "away_logo": away["team"].get("logo", ""),
            "away_color": away["team"].get("color", ""),
            "start_time": event.get("date", ""),
        })

    return {"sport": sport, "games": games}
