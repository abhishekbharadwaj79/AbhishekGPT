"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Message, ScoresResponse } from "@/types";
import {
  streamChat,
  fetchScores,
  fetchConversations,
  createConversation,
  deleteConversation,
  fetchMessages,
} from "@/lib/api";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useAuth } from "./AuthGuard";

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
  return detected;
}

interface ConversationItem {
  id: string;
  title: string;
  updated_at: string;
}

export function ChatContainer() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load conversations when user signs in
  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setConversations([]);
      setCurrentConversationId(null);
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      const convs = await fetchConversations();
      setConversations(convs);
    } catch {
      // silently fail if backend isn't ready
    }
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const handleNewChat = useCallback(() => {
    handleStop();
    setMessages([]);
    setCurrentConversationId(null);
  }, [handleStop]);

  const handleSelectConversation = useCallback(
    async (conversationId: string) => {
      handleStop();
      setCurrentConversationId(conversationId);
      try {
        const msgs = await fetchMessages(conversationId);
        setMessages(
          msgs.map((m: { id: string; role: string; content: string; created_at: string }) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            timestamp: new Date(m.created_at),
          }))
        );
      } catch {
        setMessages([]);
      }
    },
    [handleStop]
  );

  const handleDeleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        await deleteConversation(conversationId);
        setConversations((prev) => prev.filter((c) => c.id !== conversationId));
        if (currentConversationId === conversationId) {
          setMessages([]);
          setCurrentConversationId(null);
        }
      } catch {
        // ignore
      }
    },
    [currentConversationId]
  );

  const handleSend = useCallback(
    async (content: string) => {
      // Create conversation if user is signed in and this is the first message
      let convId = currentConversationId;
      if (!convId && user) {
        try {
          const conv = await createConversation();
          convId = conv.id;
          setCurrentConversationId(convId);
        } catch {
          // continue without persistence
        }
      }

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
              // silently skip
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

      const controller = streamChat(
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
        () => {
          setIsStreaming(false);
          abortControllerRef.current = null;
          // Refresh conversation list to show new/updated conversation
          if (user) loadConversations();
        },
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
          abortControllerRef.current = null;
        },
        convId || undefined
      );

      abortControllerRef.current = controller;
    },
    [messages, currentConversationId]
  );

  return (
    <div className="flex h-screen">
      {user && (
        <Sidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onNewChat={handleNewChat}
          showNewChat={messages.length > 0}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <MessageList
            messages={messages}
            messagesEndRef={messagesEndRef}
            onSuggestionClick={handleSend}
          />
          <ChatInput
            onSend={handleSend}
            onStop={handleStop}
            disabled={isStreaming}
            isStreaming={isStreaming}
          />
        </main>
      </div>
    </div>
  );
}
