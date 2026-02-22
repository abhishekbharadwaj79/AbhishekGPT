# SportsGPT - Claude Code Instructions

## Project Overview
SportsGPT is a full-stack sports AI chat application. It has two parts:
- **frontend/** — Next.js 15 + TypeScript + Tailwind CSS (deployed on Vercel)
- **backend/** — FastAPI + Python (deployed on Render)

## Architecture
```
[Next.js Frontend :3000]  ←→  [FastAPI Backend :8000]
        (chat UI)                      |
                              ┌────────┴────────┐
                        Anthropic Claude    ESPN API
                         (streaming)      (live scores)
```

## Key Files
- `backend/prompts/system_prompt.py` — The AI's personality and constraints (sports-only)
- `backend/services/claude_service.py` — Anthropic SDK wrapper with async streaming
- `backend/services/sports_service.py` — ESPN public API integration
- `backend/routers/chat.py` — POST /api/chat endpoint (SSE streaming)
- `backend/routers/scores.py` — GET /api/scores endpoint
- `backend/config.py` — Environment variable loading via pydantic-settings
- `frontend/src/components/ChatContainer.tsx` — Main chat state management
- `frontend/src/lib/api.ts` — Frontend API client with SSE stream parsing

## Local Development
Both servers must run simultaneously:
- Backend: `cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000`
- Frontend: `cd frontend && npm run dev`

## Environment Variables
- Backend `.env`: requires `ANTHROPIC_API_KEY` and `CORS_ORIGINS`
- Frontend `.env.local`: requires `NEXT_PUBLIC_API_URL` (default: http://localhost:8000)

## Conventions
- Frontend uses TypeScript strict mode
- Backend uses async/await throughout
- Streaming uses Server-Sent Events (SSE), not WebSockets
- Sports data comes from ESPN's public JSON endpoints (no API key needed)
- The system prompt in `system_prompt.py` constrains the AI to sports-only topics
