"use client";

import { useState, useEffect } from "react";
import { Game, ScoresResponse } from "@/types";

function formatGameDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function formatGameTime(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function TeamLogo({ logo, abbreviation, alt }: { logo: string; abbreviation: string; alt: string }) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={alt}
        className="w-8 h-8 object-contain"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-xs font-bold">
      {abbreviation || "?"}
    </div>
  );
}

function CricketGameCard({ game }: { game: Game }) {
  const isLive = game.status === "In Progress";
  const isFinal = game.status === "Final" || game.status === "Result";

  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    if (game.start_time) {
      const date = formatGameDate(game.start_time);
      const time = formatGameTime(game.start_time);
      if (!isLive && !isFinal && time) {
        setDateStr(`${date} · ${time}`);
      } else {
        setDateStr(date);
      }
    }
  }, [game.start_time, isLive, isFinal]);

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 hover:border-gray-600 transition-colors col-span-1 sm:col-span-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
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
          {game.name && (
            <span className="text-xs text-gray-500 truncate max-w-[200px]">
              {game.name}
            </span>
          )}
        </div>
        {dateStr && (
          <span className="text-xs text-gray-400">{dateStr}</span>
        )}
      </div>

      <div className="space-y-2">
        {/* Team 1 (Away) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TeamLogo logo={game.away_logo} abbreviation={game.away_abbreviation} alt={game.away_team} />
            <span className="text-sm font-medium text-gray-200">
              {game.away_team}
            </span>
          </div>
          <span className="text-sm font-semibold text-gray-300 tabular-nums">
            {game.away_score || (game.away_innings?.length ? "" : "—")}
          </span>
        </div>

        {/* Team 2 (Home) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TeamLogo logo={game.home_logo} abbreviation={game.home_abbreviation} alt={game.home_team} />
            <span className="text-sm font-medium text-gray-200">
              {game.home_team}
            </span>
          </div>
          <span className="text-sm font-semibold text-gray-300 tabular-nums">
            {game.home_score || (game.home_innings?.length ? "" : "—")}
          </span>
        </div>
      </div>
    </div>
  );
}

function StandardGameCard({ game }: { game: Game }) {
  const isLive = game.status === "In Progress";
  const isFinal = game.status === "Final";

  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    if (game.start_time) {
      const date = formatGameDate(game.start_time);
      const time = formatGameTime(game.start_time);
      if (!isLive && !isFinal && time) {
        setDateStr(`${date} · ${time}`);
      } else {
        setDateStr(date);
      }
    }
  }, [game.start_time, isLive, isFinal]);

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
        {dateStr && (
          <span className="text-xs text-gray-400">{dateStr}</span>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TeamLogo logo={game.away_logo} abbreviation={game.away_abbreviation} alt={game.away_team} />
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

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TeamLogo logo={game.home_logo} abbreviation={game.home_abbreviation} alt={game.home_team} />
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

const SPORT_LABELS: Record<string, string> = {
  cricket: "Cricket (International)",
  ipl: "IPL",
  bbl: "Big Bash League",
  psl: "Pakistan Super League",
  cpl: "Caribbean Premier League",
  the_hundred: "The Hundred",
  sa20: "SA20",
  county: "County Championship",
  nfl: "NFL",
  nba: "NBA",
  mlb: "MLB",
  nhl: "NHL",
  soccer: "Premier League",
  ncaaf: "College Football",
  ncaab: "College Basketball",
};

export function ScoreBoard({ data }: { data: ScoresResponse[] }) {
  if (!data || data.length === 0) return null;

  // Filter out sports with no games
  const withGames = data.filter((d) => d.games.length > 0);
  if (withGames.length === 0) return null;

  return (
    <div className="space-y-4 my-4">
      {withGames.map((sportData) => (
        <div key={sportData.sport}>
          <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">
            {SPORT_LABELS[sportData.sport] || sportData.sport} Scores
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sportData.games.map((game, idx) =>
              game.is_cricket ? (
                <CricketGameCard key={`${sportData.sport}-${idx}`} game={game} />
              ) : (
                <StandardGameCard key={`${sportData.sport}-${idx}`} game={game} />
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
