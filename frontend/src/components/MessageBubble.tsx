"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check } from "lucide-react";
import { Message } from "@/types";
import { ScoreBoard } from "./ScoreBoard";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-700 transition-colors"
    >
      {copied ? (
        <>
          <Check size={14} />
          Copied
        </>
      ) : (
        <>
          <Copy size={14} />
          Copy
        </>
      )}
    </button>
  );
}

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
              {message.content && (
                <div className="mt-2">
                  <CopyButton text={message.content} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
