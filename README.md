# Personal Portfolio

A full-stack portfolio site works to present working projects: an **LLM-powered earnings call summarizer** and a **machine learning price prediction model** for SPY.

**Live site:** https://ml-project-web.fly.dev

> The backend scales to zero when idle, so the first request after a quiet period can take a few seconds while it starts.

---

## Projects

### Earnings Call Summarizer

Paste or upload an earnings call transcript and get a bullet-point summary checked against market data.

1. An OpenAI model identifies the company's ticker and returns it as structured JSON.
2. The backend pulls growth estimates, insider purchases, and analyst price targets for that ticker from Yahoo Finance (via `yfinance`).
3. The model summarizes the call and calls out where management's commentary agrees or conflicts with that data.

### Price Prediction Model

Predicts SPY's direction and price over the next 10 trading days. Visitors can use the built-in SPY history or upload their own CSV of daily prices.

- **Direction model:** logistic regression that classifies up vs. down, with its decision threshold tuned on a held-out slice of the training data.
- **Return model:** random forest regressor that predicts the 10-day return, which is converted to a target price.
- **Features:** 5-day return, 20- and 60-day momentum, and distance from the 50-day moving average, all computed from data up to the prior close.
- **Labels:** days where the 10-day move is within ±0.5% are excluded from training as a no-trade band.
- **Evaluation:** chronological 80/20 train/test split, compared against naive baselines (always predict "up" for direction; predict no change for return and price).
- On the site, a prediction is marked **confirmed** when both models agree on direction.

### Jumpshot Tracker
A real time shot detection and arm statistics from a webcam feed. A proof of concept that you can register and measure a shot off numeric criteria.

**What it does:**
- Tracks the right shoulder, elbow, wrist, and index finger on every frame with MediaPipe Pose.
- Computes the elbow angle (shoulder -> elbow -> wrist)
and wrist angle(elbow -> wrist -> index finger) and overlays said angles on video feed
- Detects a shot when the elbow and wrist velocities pass a certain threshold then records the path and position of the arm for the estimated length of a given shot.
- Logs each shots peak velocitites, elbows and wrist paths, and per frame velocity trace, then plots elbow velocity for ever shot when the recording session ends


## Architecture

```mermaid
flowchart LR
  U[User] -->|HTTPS| FE[Next.js frontend<br/>Fly.io]
  FE -->|REST| BE[FastAPI backend<br/>Fly.io]
  BE --> LLM[OpenAI API]
  BE --> YF[Yahoo Finance<br/>via yfinance]
  BE --> ML[scikit-learn models<br/>logistic regression + random forest]
```

| Layer | Stack |
|---|---|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS, Recharts |
| Backend | Python, FastAPI, pandas, scikit-learn, OpenAI API, yfinance |
| Hosting | Fly.io (Docker), separate apps for frontend and backend |

### API

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/initanalyze/text` | Summarize a pasted transcript (`{"text": "..."}`) |
| `POST` | `/initanalyze/file` | Summarize an uploaded transcript file |
| `GET` | `/predict/default` | Recent SPY history plus the next 10 predictions |
| `POST` | `/predict/file` | Same, for an uploaded CSV with `Date` and `Close` (or `Adj Close`) columns |

---

## Repository Layout

```text
.
├── app/
│   ├── backend/
│   │   ├── ecfast.py         # FastAPI app deployed to production (both projects)
│   │   ├── ml.py             # Features, training, and prediction for the price model
│   │   ├── data/spy.csv      # SPY daily history for training and the default demo
│   │   ├── models/           # Saved model artifact
│   │   ├── app/              # Original health-check service (FastAPI + Postgres), not deployed
│   │   ├── Dockerfile
│   │   ├── fly.toml
│   │   └── requirements.txt
│   └── frontend/
│       ├── app/
│       │   ├── page.tsx                           
│       │   ├── projects/page.tsx                   
│       │   ├── projects/earnings-summarizer/page.tsx
│       │   ├── projects/price-prediction/page.tsx
│       │   └── resume/page.tsx                     
│       ├── Dockerfile
│       └── fly.toml
├── pyproject.toml            # Local Python environment (uv)
└── uv.lock
```

---

