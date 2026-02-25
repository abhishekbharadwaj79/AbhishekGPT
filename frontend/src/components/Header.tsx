"use client";

import { RotateCcw, Menu, LogOut } from "lucide-react";
import { useAuth } from "./AuthGuard";

interface HeaderProps {
  onNewChat: () => void;
  showNewChat: boolean;
  onToggleSidebar?: () => void;
}

export function Header({ onNewChat, showNewChat, onToggleSidebar }: HeaderProps) {
  const { user, loading, signIn, signOut } = useAuth();

  return (
    <header className="border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onToggleSidebar && user && (
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

        <div className="flex items-center gap-2">
          {showNewChat && (
            <button
              onClick={onNewChat}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}

          {loading ? null : user ? (
            <div className="flex items-center gap-2 ml-2">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt=""
                  className="w-8 h-8 rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                  {user.email?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <button
                onClick={signOut}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={signIn}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-900 text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
