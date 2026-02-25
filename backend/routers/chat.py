import logging
from typing import Optional

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from services.claude_service import stream_chat_response
from services.sports_service import get_live_scores
from services.db_service import save_message, update_conversation_title


logger = logging.getLogger("sportsgpt.chat")
router = APIRouter()


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]
    conversation_id: Optional[str] = None


# Map keywords to sport identifiers
SPORT_KEYWORDS: dict[str, list[str]] = {
    "nfl": ["nfl", "football", "touchdown", "quarterback", "super bowl"],
    "nba": ["nba", "basketball", "lakers", "celtics", "warriors", "dunk"],
    "mlb": ["mlb", "baseball", "home run", "pitcher", "world series"],
    "nhl": ["nhl", "hockey", "puck", "stanley cup"],
    "soccer": ["soccer", "football", "premier league", "epl", "goal", "messi", "ronaldo", "fifa"],
    "ncaaf": ["college football", "ncaaf", "cfb"],
    "ncaab": ["college basketball", "ncaab", "march madness"],
    "cricket": ["cricket", "test match", "odi", "t20", "wicket", "batsman", "bowler", "innings"],
    "ipl": ["ipl", "indian premier league"],
    "bbl": ["bbl", "big bash"],
    "psl": ["psl", "pakistan super league"],
    "cpl": ["cpl", "caribbean premier league"],
    "the_hundred": ["the hundred", "hundred cricket"],
    "sa20": ["sa20"],
    "county": ["county cricket", "county championship"],
}


def detect_sports(text: str) -> list[str]:
    text_lower = text.lower()
    detected = []

    score_keywords = ["score", "scores", "game", "games", "playing", "play today",
                      "who won", "who's winning", "result", "results", "live",
                      "today", "tonight", "yesterday", "this week", "standings"]
    is_score_query = any(kw in text_lower for kw in score_keywords)

    if not is_score_query:
        return []

    for sport, keywords in SPORT_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            detected.append(sport)

    return detected


def format_scores_context(scores_data: list[dict]) -> str:
    parts = []
    for data in scores_data:
        sport = data.get("sport", "").upper()
        games = data.get("games", [])
        if not games:
            parts.append(f"\n{sport}: No games currently scheduled.")
            continue

        parts.append(f"\n{sport} Scores:")
        for game in games:
            status = game["status"]
            home = game["home_team"]
            away = game["away_team"]
            home_score = game["home_score"]
            away_score = game["away_score"]
            parts.append(f"  {away} {away_score} @ {home} {home_score} ({status})")

    return "\n".join(parts)


@router.post("/chat")
async def chat(request: ChatRequest):
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    conversation_id = request.conversation_id

    scores_context = ""
    latest_user_msg = ""
    if messages:
        for msg in reversed(messages):
            if msg["role"] == "user":
                latest_user_msg = msg["content"]
                break

    logger.info("Chat request: conv=%s, msg_count=%d, user_msg='%s'",
                conversation_id or "none", len(messages), latest_user_msg[:100])

    sports = detect_sports(latest_user_msg)
    if sports:
        logger.info("Detected sports: %s", sports)
        scores_results = []
        for sport in sports:
            try:
                result = await get_live_scores(sport)
                if "error" not in result:
                    scores_results.append(result)
                    logger.info("Fetched %d games for %s", len(result.get("games", [])), sport)
            except Exception as e:
                logger.warning("Failed to fetch scores for %s: %s", sport, e)

        if scores_results:
            scores_context = format_scores_context(scores_results)

    full_response = []

    async def event_generator():
        try:
            async for chunk in stream_chat_response(messages, scores_context):
                full_response.append(chunk)
                yield chunk
            logger.info("Gemini response complete, %d chars", len("".join(full_response)))
        except Exception as e:
            logger.error("Gemini streaming error: %s", e, exc_info=True)
            yield f"Error generating response: {e}"

        if conversation_id:
            try:
                await save_message(conversation_id, "user", latest_user_msg)
                assistant_content = "".join(full_response)
                await save_message(conversation_id, "assistant", assistant_content)
                user_messages = [m for m in messages if m["role"] == "user"]
                if len(user_messages) == 1:
                    title = latest_user_msg[:80]
                    await update_conversation_title(conversation_id, title)
                logger.info("Saved messages to conv=%s", conversation_id)
            except Exception as e:
                logger.error("Failed to save messages to DB: %s", e, exc_info=True)

    return StreamingResponse(event_generator(), media_type="text/plain")
