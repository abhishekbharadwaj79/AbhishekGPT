"use client";

import { RotateCcw, Menu } from "lucide-react";

interface HeaderProps {
  onNewChat: () => void;
  showNewChat: boolean;
  onToggleSidebar?: () => void;
}

export function Header({ onNewChat, showNewChat, onToggleSidebar }: HeaderProps) {
  return (
    <header className="border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors lg:hidden"
            >
              <Menu size={20} />
            </button>
          )}
          <button
            onClick={onNewChat}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-xl font-bold">
              S
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-blue-400">SportsGPT</h1>
              <p className="text-xs text-gray-400">Your AI Sports Assistant</p>
            </div>
          </button>
        </div>
        {showNewChat && (
          <button
            onClick={onNewChat}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
          >
            <RotateCcw size={14} />
            New Chat
          </button>
        )}
      </div>
    </header>
  );
}
