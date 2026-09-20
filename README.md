# imspresentation

An interactive real-time presentation platform with live polls, quizzes, Q&A, and live subtitles.

**imspresentation** allows presenters to host engaging interactive slide presentations where audiences can respond, ask questions, vote, and react in real time from their phones.

---

## ✨ Features

- **Presenter Studio**:
  - Slide deck thumbnail navigator with active slide highlight
  - Live 16:9 presentation preview canvas
  - Interactive slide interaction toggles (Polls, Quizzes, Q&A)
  - Audience Responses feed with live Messages, Questions (with upvoting & pinning), and Pinned tabs
  - Presentation and interaction option toggles
- **Presentation Stage Display (`/present` or `?view=present`)**:
  - Fullscreen stage view for projectors and screenshares
  - Live animated gradient bar charts for active polls
  - Timed quizzes with podium celebration
  - Pinned question spotlight overlay
  - Real-time speech subtitles stream banner
  - Floating animated reaction bubbles (`👏`, `❤️`, `🔥`, `👍`)
- **Audience Mobile Web (`/join` or `?view=audience`)**:
  - Responsive smartphone UI
  - Real-time poll voting cards with instant distribution feedback
  - Quiz questions with countdown timer and scoring
  - Anonymous or named Q&A question submission and upvoting
  - Floating emoji reaction buttons
- **Real-Time Audio Transcription**:
  - Live speech-to-text using Web Speech API, streaming live subtitles onto presentation screens.

---

## 🚀 Quick Start

### Local Development

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Build frontend assets**:
   ```bash
   npm run build
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. Open your browser:
   - **Presenter Studio**: `http://localhost:4000/?view=studio`
   - **Stage Display**: `http://localhost:4000/?view=present`
   - **Audience Mobile**: `http://localhost:4000/?view=audience`

---

## ☁️ Cloud Deployment

### Render (Recommended)
This repo includes a [`render.yaml`](./render.yaml). You can connect this repository to [Render.com](https://render.com) for a 1-click free deployment with native WebSocket support.

### Docker
```bash
docker compose up -d --build
```

---

## 🗄️ Neon Serverless PostgreSQL Setup

To store all presenter accounts, slide decks, questions, and voting data in **Neon**:

1. Create a free serverless Postgres database at [neon.tech](https://neon.tech).
2. Copy your connection string (`postgresql://username:password@ep-xyz.neon.tech/neondb?sslmode=require`).
3. Set the environment variable `DATABASE_URL` in your hosting provider (e.g. Render Dashboard $\rightarrow$ Environment Variables) or in a `.env` file:
   ```bash
   DATABASE_URL="postgresql://username:password@ep-xyz.neon.tech/neondb?sslmode=require"
   ```
4. The server automatically initializes and manages all tables (`users`, `presentations`) on startup!

---

## 📄 License
MIT
