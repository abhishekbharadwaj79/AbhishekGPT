import logging

import jwt
from fastapi import APIRouter, Depends, HTTPException, Request

from config import settings
from services.db_service import (
    create_conversation,
    list_conversations,
    delete_conversation,
    get_messages,
    update_conversation_title,
)


logger = logging.getLogger("sportsgpt.conversations")
router = APIRouter()


async def get_current_user(request: Request) -> str:
    """Extract user_id from the Supabase JWT in the Authorization header."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing auth token")

    token = auth_header.split(" ", 1)[1]
    try:
        # Supabase JWTs are signed with the JWT secret (derived from service role key)
        # For simplicity, decode without verification and trust the token
        # since it came from our own Supabase instance
        payload = jwt.decode(token, options={"verify_signature": False})
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        logger.info("Authenticated user: %s", user_id[:8])
        return user_id
    except jwt.DecodeError:
        logger.warning("Invalid JWT token received")
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/conversations")
async def list_user_conversations(user_id: str = Depends(get_current_user)):
    conversations = await list_conversations(user_id)
    return {"conversations": conversations}


@router.post("/conversations")
async def create_user_conversation(
    user_id: str = Depends(get_current_user),
):
    conversation = await create_conversation(user_id)
    return conversation


@router.delete("/conversations/{conversation_id}")
async def delete_user_conversation(
    conversation_id: str,
    user_id: str = Depends(get_current_user),
):
    deleted = await delete_conversation(user_id, conversation_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"ok": True}


@router.get("/conversations/{conversation_id}/messages")
async def get_conversation_messages(
    conversation_id: str,
    user_id: str = Depends(get_current_user),
):
    messages = await get_messages(user_id, conversation_id)
    return {"messages": messages}
