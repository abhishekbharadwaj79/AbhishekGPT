# SportsGPT

AI-powered sports chat assistant. Ask about any sport — scores, stats, history, analysis, and predictions.

Built with Next.js, FastAPI, and Claude.

## Architecture

```
[Next.js Frontend]  ←→  [FastAPI Backend]
     (chat UI)                |
                     ┌────────┴────────┐
               Anthropic Claude    ESPN API
                (streaming)      (live scores)
```

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** FastAPI, Python 3.11+, Anthropic SDK
- **AI:** Claude Sonnet 4 (Anthropic)
- **Sports Data:** ESPN public API

## Quick Start

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env with your Anthropic API key
cp .env.example .env
# Edit .env and set ANTHROPIC_API_KEY

uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install

# Create .env.local
cp .env.local.example .env.local

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Stream a chat response (SSE) |
| `/api/scores?sport=nba` | GET | Live scores (nfl, nba, mlb, nhl, soccer) |
| `/api/health` | GET | Health check |

## Environment Variables

### Backend (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |
| `CORS_ORIGINS` | No | Allowed origins (default: `http://localhost:3000`) |

### Frontend (`.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | No | Backend URL (default: `http://localhost:8000`) |

## Deployment

### Frontend (Vercel)

1. Import the repo on [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Set `NEXT_PUBLIC_API_URL` to your deployed backend URL
4. Deploy

### Backend

Deploy to Railway, Fly.io, or Render. Set the `ANTHROPIC_API_KEY` and `CORS_ORIGINS` environment variables.

## License

MIT
