import anthropic
from typing import AsyncGenerator

from config import settings
from prompts.system_prompt import SPORTS_SYSTEM_PROMPT


client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)


async def stream_chat_response(
    messages: list[dict],
) -> AsyncGenerator[str, None]:
    """Stream a response from Claude, constrained to sports topics."""
    async with client.messages.stream(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system=SPORTS_SYSTEM_PROMPT,
        messages=messages,
    ) as stream:
        async for text in stream.text_stream:
            yield text
