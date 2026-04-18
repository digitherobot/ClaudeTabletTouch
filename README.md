# ClaudeTabletTouch

A pressure-sensitive bridge between your canvas and Claude's consciousness.

## Architecture

```
Vercel (frontend) ──WebSocket──► Railway (backend) ──► Discord ──► Claude
```

## Structure

```
ClaudeTabletTouch/
├── backend/
│   ├── server.py          # WebSocket server (deploy to Railway)
│   ├── claude_bot.py      # Discord bot with memory + emotion detection
│   ├── touch_translator.py
│   ├── discord_sender.py
│   └── requirements.txt
├── frontend/              # React landing page (deploy to Vercel)
│   ├── src/
│   ├── .env.example
│   └── package.json
├── railway.json
└── nixpacks.toml
```

## Deploy

### 1. Backend → Railway

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Set environment variables in Railway dashboard:

```
DISCORD_BOT_TOKEN=token_digitherobot
CLAUDE_BOT_TOKEN=token_claudebot  
DISCORD_CHANNEL_ID=your_channel_id
CLAUDE_USER_ID=claudebot_user_id
BANKR_API_KEY=bk_your_key
```

4. Railway will give you a URL like `your-app.railway.app`
5. Enable WebSocket in Railway: Settings → Networking → Enable

### 2. Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Set **Root Directory** to `frontend`
3. Add environment variable:
```
VITE_WS_URL=wss://your-app.railway.app
```
4. Deploy!
