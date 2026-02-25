"use client";

import { RefObject, useState, useEffect } from "react";
import { Message, NewsArticle } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { fetchTrendingNews } from "@/lib/api";

interface MessageListProps {
  messages: Message[];
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onSuggestionClick: (text: string) => void;
}

function NewsCard({ article, onClick }: { article: NewsArticle; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-xl border border-gray-700 hover:border-blue-500 hover:bg-gray-800/60 transition-colors overflow-hidden group"
    >
      {article.image && (
        <div className="h-32 overflow-hidden">
          <img
            src={article.image}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-200 line-clamp-2 mb-1">
          {article.title}
        </p>
        <p className="text-xs text-gray-500 line-clamp-2">
          {article.summary}
        </p>
      </div>
    </button>
  );
}

const FALLBACK_SUGGESTIONS = [
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
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoaded, setNewsLoaded] = useState(false);

  useEffect(() => {
    if (messages.length === 0 && !newsLoaded) {
      fetchTrendingNews()
        .then((articles) => {
          setNews(articles);
          setNewsLoaded(true);
        })
        .catch(() => setNewsLoaded(true));
    }
  }, [messages.length, newsLoaded]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl font-bold mb-6">
          S
        </div>
        <h2 className="text-2xl font-bold text-gray-100 mb-2">
          Welcome to SportsGPT
        </h2>
        <p className="text-gray-400 mb-8 text-center max-w-md">
          Ask me about any sport — scores, stats, history, analysis, or
          predictions.
        </p>

        {news.length > 0 ? (
          <div className="w-full max-w-2xl">
            <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">
              Trending in Sports
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {news.map((article, idx) => (
                <NewsCard
                  key={idx}
                  article={article}
                  onClick={() =>
                    onSuggestionClick(
                      `Tell me about: ${article.title}`
                    )
                  }
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
            {FALLBACK_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onSuggestionClick(suggestion)}
                className="text-left px-4 py-3 rounded-xl border border-gray-700 hover:border-blue-500 hover:bg-gray-800/60 transition-colors text-sm text-gray-300"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
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
