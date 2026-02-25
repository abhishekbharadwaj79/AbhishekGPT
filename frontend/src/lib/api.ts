import { createClient } from "./supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }
  return { "Content-Type": "application/json" };
}

export function streamChat(
  messages: { role: string; content: string }[],
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (error: Error) => void,
  conversationId?: string
): AbortController {
  const controller = new AbortController();

  (async () => {
    try {
      const headers = await getAuthHeaders();
      const body: Record<string, unknown> = { messages };
      if (conversationId) {
        body.conversation_id = conversationId;
      }

      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        onChunk(text);
      }
      onDone();
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        onDone();
        return;
      }
      onError(error as Error);
    }
  })();

  return controller;
}

export async function fetchScores(sport: string) {
  const response = await fetch(`${API_URL}/api/scores?sport=${sport}`);
  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }
  return response.json();
}

export async function fetchConversations() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/conversations`, { headers });
  if (!response.ok) throw new Error(`Server error: ${response.status}`);
  const data = await response.json();
  return data.conversations;
}

export async function createConversation() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/conversations`, {
    method: "POST",
    headers,
  });
  if (!response.ok) throw new Error(`Server error: ${response.status}`);
  return response.json();
}

export async function deleteConversation(id: string) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/conversations/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) throw new Error(`Server error: ${response.status}`);
  return response.json();
}

export async function fetchMessages(conversationId: string) {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_URL}/api/conversations/${conversationId}/messages`,
    { headers }
  );
  if (!response.ok) throw new Error(`Server error: ${response.status}`);
  const data = await response.json();
  return data.messages;
}

export async function fetchTrendingNews() {
  const response = await fetch(`${API_URL}/api/news`);
  if (!response.ok) throw new Error(`Server error: ${response.status}`);
  const data = await response.json();
  return data.articles;
}
