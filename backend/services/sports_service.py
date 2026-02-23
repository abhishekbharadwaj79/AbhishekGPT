import httpx
from datetime import datetime, timezone, timedelta
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

# Sports that use cricket-style scoring (runs/wickets instead of points)
CRICKET_SPORTS = {"cricket", "ipl", "bbl", "psl", "cpl", "the_hundred", "sa20", "county"}

BASE_URL = "https://site.api.espn.com/apis/site/v2/sports"

# Don't show results older than this
MAX_STALENESS = timedelta(days=7)


def _is_recent(date_str: str) -> bool:
    """Check if a game date is within the staleness window."""
    if not date_str:
        return False
    try:
        game_date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        return (now - game_date) < MAX_STALENESS
    except (ValueError, TypeError):
        return False


async def get_live_scores(sport: str) -> dict[str, Any]:
    """Fetch live scores from ESPN's public API."""
    endpoint = SPORT_ENDPOINTS.get(sport.lower())
    if not endpoint:
        return {
            "error": f"Unsupported sport: {sport}",
            "supported": list(SPORT_ENDPOINTS.keys()),
        }

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(f"{BASE_URL}/{endpoint}/scoreboard")
        response.raise_for_status()
        data = response.json()

    is_cricket = sport.lower() in CRICKET_SPORTS

    games = []
    for event in data.get("events", []):
        event_date = event.get("date", "")

        # Skip stale results
        if not _is_recent(event_date):
            continue

        competition = event["competitions"][0]
        competitors = competition["competitors"]
        home = competitors[0]
        away = competitors[1]

        game_data: dict[str, Any] = {
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
            "start_time": event_date,
            "is_cricket": is_cricket,
        }

        # For cricket, extract detailed scoring info from linescores
        if is_cricket:
            for prefix, competitor in [("home", home), ("away", away)]:
                linescores = competitor.get("linescores", [])
                innings_list = []
                for inn in linescores:
                    runs = inn.get("runs", 0)
                    wickets = inn.get("wickets", 0)
                    overs = inn.get("overs", 0)
                    desc = inn.get("description", "")
                    if runs or wickets or overs:
                        if wickets == 10 or desc == "all out":
                            innings_list.append(f"{runs}")
                        else:
                            innings_list.append(f"{runs}/{wickets}")
                game_data[f"{prefix}_innings"] = innings_list

        games.append(game_data)

    return {"sport": sport, "games": games}
