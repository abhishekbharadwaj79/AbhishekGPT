import logging

from config import settings


logger = logging.getLogger("sportsgpt.search")

_client = None


def _get_client():
    global _client
    if _client is None and settings.tavily_api_key:
        try:
            from tavily import TavilyClient
            _client = TavilyClient(api_key=settings.tavily_api_key)
        except ImportError:
            logger.warning("tavily-python not installed, web search disabled")
    return _client


async def web_search(query: str, max_results: int = 5) -> str:
    """Search the web for recent sports information and return formatted context."""
    client = _get_client()
    if not client:
        logger.warning("Tavily API key not configured, skipping web search")
        return ""

    try:
        logger.info("Web search: '%s'", query[:100])
        response = client.search(
            query=f"sports {query}",
            search_depth="basic",
            max_results=max_results,
            include_answer=True,
        )

        parts = []

        # Include the AI-generated answer summary if available
        if response.get("answer"):
            parts.append(f"Summary: {response['answer']}")

        # Include individual search results
        for result in response.get("results", []):
            title = result.get("title", "")
            content = result.get("content", "")
            url = result.get("url", "")
            if content:
                parts.append(f"- {title}: {content[:300]}")

        context = "\n".join(parts)
        logger.info("Web search returned %d results, %d chars", len(response.get("results", [])), len(context))
        return context

    except Exception as e:
        logger.error("Web search failed: %s", e)
        return ""
