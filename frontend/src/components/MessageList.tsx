"use client";

import { RefObject } from "react";
import { Message } from "@/types";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onSuggestionClick: (text: string) => void;
}

const SUGGESTIONS = [
  "Who won the last Super Bowl?",
  "What are today's NBA scores?",
  "Compare LeBron James and Michael Jordan",
  "Explain the offside rule in soccer",
];

export function MessageList({
  messages,
  messagesEndRef,
  onSuggestionClick,
}: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-green-600 flex items-center justify-center text-3xl font-bold mb-6">
          S
        </div>
        <h2 className="text-2xl font-bold text-gray-100 mb-2">
          Welcome to SportsGPT
        </h2>
        <p className="text-gray-400 mb-8 text-center max-w-md">
          Ask me about any sport — scores, stats, history, analysis, or
          predictions.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onSuggestionClick(suggestion)}
              className="text-left px-4 py-3 rounded-xl border border-gray-700 hover:border-green-500 hover:bg-gray-800/60 transition-colors text-sm text-gray-300"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="divide-y divide-gray-800">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
}
