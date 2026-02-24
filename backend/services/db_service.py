from supabase import create_client, Client

from config import settings


def get_supabase_client() -> Client:
    """Get a Supabase client using the service role key (bypasses RLS)."""
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def get_supabase_client_for_user(access_token: str) -> Client:
    """Get a Supabase client authenticated as a specific user (respects RLS)."""
    client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    client.postgrest.auth(access_token)
    return client


async def create_conversation(user_id: str, title: str = "New Chat") -> dict:
    client = get_supabase_client()
    result = client.table("conversations").insert({
        "user_id": user_id,
        "title": title,
    }).execute()
    return result.data[0] if result.data else {}


async def list_conversations(user_id: str) -> list[dict]:
    client = get_supabase_client()
    result = (
        client.table("conversations")
        .select("id, title, created_at, updated_at")
        .eq("user_id", user_id)
        .order("updated_at", desc=True)
        .limit(50)
        .execute()
    )
    return result.data or []


async def delete_conversation(user_id: str, conversation_id: str) -> bool:
    client = get_supabase_client()
    result = (
        client.table("conversations")
        .delete()
        .eq("id", conversation_id)
        .eq("user_id", user_id)
        .execute()
    )
    return len(result.data) > 0


async def get_messages(user_id: str, conversation_id: str) -> list[dict]:
    client = get_supabase_client()
    # Verify the conversation belongs to this user
    conv = (
        client.table("conversations")
        .select("id")
        .eq("id", conversation_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not conv.data:
        return []

    result = (
        client.table("messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", conversation_id)
        .order("created_at", desc=False)
        .execute()
    )
    return result.data or []


async def save_message(conversation_id: str, role: str, content: str) -> dict:
    client = get_supabase_client()
    result = client.table("messages").insert({
        "conversation_id": conversation_id,
        "role": role,
        "content": content,
    }).execute()

    # Update conversation's updated_at
    client.table("conversations").update({
        "updated_at": "now()",
    }).eq("id", conversation_id).execute()

    return result.data[0] if result.data else {}


async def update_conversation_title(conversation_id: str, title: str) -> None:
    client = get_supabase_client()
    client.table("conversations").update({
        "title": title,
    }).eq("id", conversation_id).execute()
