export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  scores?: ScoresResponse[];
}

export interface Game {
  name: string;
  status: string;
  home_team: string;
  home_abbreviation: string;
  home_score: string;
  home_logo: string;
  home_color: string;
  away_team: string;
  away_abbreviation: string;
  away_score: string;
  away_logo: string;
  away_color: string;
  start_time: string;
}

export interface ScoresResponse {
  sport: string;
  games: Game[];
}
