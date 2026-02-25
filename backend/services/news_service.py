import logging
from typing import Any

import httpx

try:
    import feedparser
except ImportError:
    feedparser = None  # type: ignore


logger = logging.getLogger("sportsgpt.news")

ESPN_RSS_FEEDS = {
    "top": "https://www.espn.com/espn/rss/news",
    "nfl": "https://www.espn.com/espn/rss/nfl/news",
    "nba": "https://www.espn.com/espn/rss/nba/news",
    "mlb": "https://www.espn.com/espn/rss/mlb/news",
    "soccer": "https://www.espn.com/espn/rss/soccer/news",
}


async def get_trending_news(count: int = 4) -> list[dict[str, Any]]:
    """Fetch trending sports headlines from ESPN RSS."""
    if feedparser is None:
        logger.warning("feedparser not installed, news disabled")
        return []

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(ESPN_RSS_FEEDS["top"])
            response.raise_for_status()

        feed = feedparser.parse(response.text)
        articles = []

        for entry in feed.entries[:count]:
            # Extract image from media content if available
            image = ""
            if hasattr(entry, "media_content") and entry.media_content:
                image = entry.media_content[0].get("url", "")
            elif hasattr(entry, "media_thumbnail") and entry.media_thumbnail:
                image = entry.media_thumbnail[0].get("url", "")

            articles.append({
                "title": entry.get("title", ""),
                "summary": entry.get("summary", "")[:150],
                "link": entry.get("link", ""),
                "image": image,
                "published": entry.get("published", ""),
            })

        logger.info("Fetched %d trending news articles", len(articles))
        return articles

    except Exception as e:
        logger.error("Failed to fetch trending news: %s", e)
        return []
