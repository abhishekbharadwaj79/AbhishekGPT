from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from services.claude_service import stream_chat_response


router = APIRouter()


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]


@router.post("/chat")
async def chat(request: ChatRequest):
    messages = [{"role": m.role, "content": m.content} for m in request.messages]

    async def event_generator():
        async for chunk in stream_chat_response(messages):
            yield chunk

    return StreamingResponse(event_generator(), media_type="text/plain")
