const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function streamChat(
  messages: { role: string; content: string }[],
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (error: Error) => void
): AbortController {
  const controller = new AbortController();

  (async () => {
    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
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
