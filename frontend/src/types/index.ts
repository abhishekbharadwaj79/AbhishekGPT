export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Game {
  name: string;
  status: string;
  home_team: string;
  home_score: string;
  away_team: string;
  away_score: string;
  start_time: string;
}

export interface ScoresResponse {
  sport: string;
  games: Game[];
}
