"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Message, ScoresResponse } from "@/types";
import { streamChat, fetchScores } from "@/lib/api";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

const SCORE_KEYWORDS = [
  "score", "scores", "game", "games", "playing", "play today",
  "who won", "who's winning", "result", "results", "live",
  "today", "tonight",
];

const SPORT_KEYWORDS: Record<string, string[]> = {
  nfl: ["nfl", "football", "super bowl"],
  nba: ["nba", "basketball"],
  mlb: ["mlb", "baseball"],
  nhl: ["nhl", "hockey"],
  soccer: ["soccer", "premier league", "epl"],
  cricket: ["cricket", "test match", "odi", "t20", "wicket"],
  ipl: ["ipl", "indian premier league"],
  bbl: ["bbl", "big bash"],
  psl: ["psl", "pakistan super league"],
  cpl: ["cpl", "caribbean premier league"],
  the_hundred: ["the hundred"],
  sa20: ["sa20"],
};

function detectSports(text: string): string[] {
  const lower = text.toLowerCase();
  const isScoreQuery = SCORE_KEYWORDS.some((kw) => lower.includes(kw));
  if (!isScoreQuery) return [];

  const detected: string[] = [];
  for (const [sport, keywords] of Object.entries(SPORT_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      detected.push(sport);
    }
  }
  return detected.length > 0 ? detected : ["nba", "nfl", "mlb", "nhl"];
}

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(
    async (content: string) => {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      // Fetch live scores if the user is asking about scores
      const sports = detectSports(content);
      if (sports.length > 0) {
        const scoresResults: ScoresResponse[] = [];
        await Promise.all(
          sports.map(async (sport) => {
            try {
              const data = await fetchScores(sport);
              if (data && data.games) {
                scoresResults.push(data);
              }
            } catch {
              // silently skip failed fetches
            }
          })
        );

        if (scoresResults.length > 0) {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            updated[updated.length - 1] = { ...last, scores: scoresResults };
            return updated;
          });
        }
      }

      const allMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      await streamChat(
        allMessages,
        (chunk) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            updated[updated.length - 1] = {
              ...last,
              content: last.content + chunk,
            };
            return updated;
          });
        },
        () => setIsStreaming(false),
        (error) => {
          console.error("Chat error:", error);
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content:
                "Sorry, something went wrong. Please make sure the backend server is running and try again.",
            };
            return updated;
          });
          setIsStreaming(false);
        }
      );
    },
    [messages]
  );

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <MessageList
        messages={messages}
        messagesEndRef={messagesEndRef}
        onSuggestionClick={handleSend}
      />
      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </main>
  );
}
