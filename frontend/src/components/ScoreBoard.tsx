"use client";

import { Game, ScoresResponse } from "@/types";

function GameCard({ game }: { game: Game }) {
  const isLive = game.status === "In Progress";
  const isFinal = game.status === "Final";

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isLive
              ? "bg-red-500/20 text-red-400"
              : isFinal
              ? "bg-gray-700 text-gray-400"
              : "bg-blue-500/20 text-blue-400"
          }`}
        >
          {isLive ? "LIVE" : game.status}
        </span>
      </div>

      <div className="space-y-3">
        {/* Away team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {game.away_logo ? (
              <img
                src={game.away_logo}
                alt={game.away_team}
                className="w-8 h-8 object-contain"
              />
            ) : (
              <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-xs font-bold">
                {game.away_abbreviation || "?"}
              </div>
            )}
            <span className="text-sm font-medium text-gray-200">
              {game.away_team}
            </span>
          </div>
          <span
            className={`text-lg font-bold tabular-nums ${
              isFinal && parseInt(game.away_score) > parseInt(game.home_score)
                ? "text-white"
                : "text-gray-400"
            }`}
          >
            {game.away_score}
          </span>
        </div>

        {/* Home team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {game.home_logo ? (
              <img
                src={game.home_logo}
                alt={game.home_team}
                className="w-8 h-8 object-contain"
              />
            ) : (
              <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-xs font-bold">
                {game.home_abbreviation || "?"}
              </div>
            )}
            <span className="text-sm font-medium text-gray-200">
              {game.home_team}
            </span>
          </div>
          <span
            className={`text-lg font-bold tabular-nums ${
              isFinal && parseInt(game.home_score) > parseInt(game.away_score)
                ? "text-white"
                : "text-gray-400"
            }`}
          >
            {game.home_score}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ScoreBoard({ data }: { data: ScoresResponse[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-4 my-4">
      {data.map((sportData) => (
        <div key={sportData.sport}>
          <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">
            {sportData.sport} Scores
          </h3>
          {sportData.games.length === 0 ? (
            <p className="text-sm text-gray-500">No games scheduled.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sportData.games.map((game, idx) => (
                <GameCard key={`${sportData.sport}-${idx}`} game={game} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
