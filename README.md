# ContextCV

A full-stack “ContextCV” platform where users author their portfolio in Markdown, publish a public profile, and visitors can chat with an AI that answers strictly from the portfolio content.

## Features

- User registration and login (JWT)
- Markdown portfolio editor with live preview
- Public profile page rendering Markdown
- Real-time chat with owner’s AI (answers only from portfolio context)
- Swagger API docs
- Pinecone vector storage for portfolio context
- CORS configured for local dev (React 3000 → API 5000)

## Tech Stack

- Backend: Node.js, Express, Socket.io, Mongoose, JWT, Swagger, Google Generative AI, Pinecone
- Frontend: React, Axios, socket.io-client, react-markdown, lucide-react

## Backend Setup

1. Install dependencies:

```bash
cd backend-node
npm install
```

2. Environment variables: create `.env` in `backend-node`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/livingcv
JWT_SECRET=replace_with_a_strong_secret

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
# IMPORTANT: keep names consistent; set BOTH to the same index name
PINECONE_INDEX=my-livingcv-index
PINECONE_INDEX_NAME=my-livingcv-index
```

3. Start backend:

```bash
npm start
```

- Swagger docs available at: http://localhost:5000/api-docs

## API Overview

- Auth
  - POST /api/auth/register
  - POST /api/auth/login → returns `{ token }`
- Portfolio (private)
  - GET /api/portfolio → requires `Authorization: Bearer <token>`
  - PUT /api/portfolio → save markdown (syncs to Pinecone), requires `Bearer`
- Portfolio (public)
  - GET /api/portfolio/:userId → public view of portfolio markdown
- Socket.io
  - Client emits: `chat_with_bot` `{ targetUserId, question }`
  - Server emits: `bot_stream` chunks of AI answer

## RAG and AI

- The user’s portfolio markdown is embedded (Pinecone Llama v2) and stored as a single vector per user with metadata `{ text: <markdown> }`.
- Chat fetches the full text directly via `index.fetch([userId])` to ensure accurate context.
- Prompt enforces strict persona: first-person answers, use ONLY provided context; if missing, respond: “I haven’t included that in my portfolio yet.”

## Frontend Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start frontend:

```bash
npm start
```

- Auth/Dashboard: http://localhost:3000/
- Public profile: http://localhost:3000/profile/<userId>

## Usage Flow

- Register → Login → Edit your Markdown portfolio → Save → Click “View Public”
- Share the public URL `/profile/<userId>` with anyone
- Visitors ask questions in the chat; AI answers from your portfolio only

## Sample Requests

- Register

```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"dev@example.com\",\"password\":\"SuperSecret!123\"}"
```

- Login

```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"dev@example.com\",\"password\":\"SuperSecret!123\"}"
```

- Save portfolio (replace TOKEN)

```bash
curl -X PUT http://localhost:5000/api/portfolio ^
  -H "Authorization: Bearer TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"content\":\"# Jane Doe\\n\\n## Skills\\n- Node.js\\n- React\"}"
```

- Get public portfolio

```bash
curl http://localhost:5000/api/portfolio/<userId>
```

## Environment Notes

- Pinecone index should match embedding dimension: 768 (llama-text-embed-v2)
- Ensure both `PINECONE_INDEX` and `PINECONE_INDEX_NAME` reference the same index name (the code reads both in different places)
- CORS is enabled in `server.js` for development

## Troubleshooting

- “No chat response”
  - Check backend logs (console) for socket events and Gemini errors
  - Confirm `GEMINI_API_KEY` and `PINECONE_API_KEY` are valid
  - Ensure portfolio has been saved at least once (so Pinecone has content)
- “Portfolio not found”
  - The user hasn’t saved yet; save a portfolio in Dashboard first
- Swagger shows no routes
  - Verify `swagger-ui-express` and `swagger-jsdoc` are installed
  - Check `apis: ['./routes/*.js']` and JSDoc comments exist

## License

MIT
