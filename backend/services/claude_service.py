import anthropic
from datetime import date
from typing import AsyncGenerator

from config import settings
from prompts.system_prompt import SPORTS_SYSTEM_PROMPT


client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)


async def stream_chat_response(
    messages: list[dict],
    scores_context: str = "",
) -> AsyncGenerator[str, None]:
    """Stream a response from Claude, constrained to sports topics."""
    today = date.today().strftime("%B %d, %Y")
    system_prompt = f"Today's date is {today}.\n\n{SPORTS_SYSTEM_PROMPT}"

    if scores_context:
        system_prompt += (
            "\n\n--- LIVE SCORES DATA ---\n"
            "The following are real-time scores fetched just now. "
            "Use this data to answer the user's question about current games and scores. "
            "Present the data in a clear, well-formatted way.\n"
            f"{scores_context}\n"
            "--- END LIVE SCORES DATA ---"
        )

    async with client.messages.stream(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system=system_prompt,
        messages=messages,
    ) as stream:
        async for text in stream.text_stream:
            yield text
