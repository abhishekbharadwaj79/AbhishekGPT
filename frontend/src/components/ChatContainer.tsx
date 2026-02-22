"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Message } from "@/types";
import { streamChat } from "@/lib/api";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

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
