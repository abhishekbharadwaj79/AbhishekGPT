"use client";

import ReactMarkdown from "react-markdown";
import { Message } from "@/types";
import { ScoreBoard } from "./ScoreBoard";

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`py-6 ${isUser ? "" : "bg-gray-800/50"}`}>
      <div className="max-w-3xl mx-auto px-4 flex gap-4">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
            isUser
              ? "bg-blue-600 text-white"
              : "bg-blue-600 text-white"
          }`}
        >
          {isUser ? "U" : "S"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-400 mb-1.5">
            {isUser ? "You" : "SportsGPT"}
          </p>
          {isUser ? (
            <p className="text-gray-100 whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
          ) : (
            <>
              {message.scores && message.scores.length > 0 && (
                <ScoreBoard data={message.scores} />
              )}
              <div className="markdown-body">
                <ReactMarkdown>{message.content || "..."}</ReactMarkdown>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
