from datetime import date
from typing import AsyncGenerator

from google import genai

from config import settings
from prompts.system_prompt import SPORTS_SYSTEM_PROMPT


_client = None


def _get_client():
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


async def stream_chat_response(
    messages: list[dict],
    scores_context: str = "",
) -> AsyncGenerator[str, None]:
    """Stream a response from Gemini, constrained to sports topics."""
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

    # Convert messages to Gemini format
    gemini_contents = []
    for msg in messages:
        role = "user" if msg["role"] == "user" else "model"
        gemini_contents.append({"role": role, "parts": [{"text": msg["content"]}]})

    response = _get_client().models.generate_content_stream(
        model="gemini-2.0-flash",
        contents=gemini_contents,
        config={
            "system_instruction": system_prompt,
            "max_output_tokens": 1024,
        },
    )

    for chunk in response:
        if chunk.text:
            yield chunk.text
