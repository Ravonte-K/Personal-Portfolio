import io
import os
import tempfile
import json

import pandas as pd
from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pandas.tseries.offsets import BDay
from openai import OpenAI
import yfinance as yf
from dotenv import load_dotenv

from ml import (
    get_data,
    make_inference_features,
    train_and_save,
    load_artifacts,
    composite_predictor,
    PATH,
    MODEL_PATH,
    HORIZON_DAYS,
)

load_dotenv()

app = FastAPI()



model_name = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")

subscription_key = os.getenv("OPENAI_API_KEY")
if not subscription_key:
    raise RuntimeError("OPENAI_API_KEY is not set")

client = OpenAI(
    api_key=subscription_key,
)

cors_allowed_origins = os.getenv("CORS_ALLOWED_ORIGINS")
if cors_allowed_origins:
    allowed_origins = [origin.strip() for origin in cors_allowed_origins.split(",") if origin.strip()]
else:
    allowed_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "https://ml-project-web.fly.dev",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class text(BaseModel):
    text:str

class TextInput(BaseModel):
    text: str

def grabTicker(text:str)-> str | None:
    response = client.chat.completions.create(
         model=model_name,
        temperature=0,
        max_tokens=200,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a ticker extraction service.\n"
                    "Return ONLY valid JSON.\n"
                    "Schema:\n"
                    "{\n"
                    '  "ticker": string | null,\n'
                    '  "company": string | null\n'
                    "}\n"
                    "Rules:\n"
                    "- Ticker must be the primary company discussed\n"
                    "- Use US public stock tickers only\n"
                    "- If unknown, set ticker to null\n"
                )
            },
            {
                "role": "user",
                "content": text
            }
        ],
    )
## understand lines below::
    rTick = response.choices[0].message.content
    if rTick is None:
        return None
    
    try:
        data = json.loads(rTick)
        ticker = data.get("ticker")
        if ticker and isinstance(ticker, str):
            return ticker.upper()
        return None
    except json.JSONDecodeError:
        return None
    

    

def getComparisons(ticker:str) -> str:
    t = yf.Ticker(ticker)
    line = "-----------------------------------------"
    ge = t.get_growth_estimates()
    ip = t.get_insider_purchases()
    pt = t.get_analyst_price_targets()
    INF = (f'{ge} \n {line}\n {ip}\n{line}\n{pt}')
    return(INF)

def findResponse(data: str):
    ticker = grabTicker(data)
    response = client.chat.completions.create(
    messages=[
        {
            "role": "system",
            "content": "You are a financial analyst. And you mostly respond in bullet points and big ideas. You usually are asked about earning calls. Label your response with the ticker of the company you are summarizing",
        },
        {
            "role": "user",
            "content": (data),
        },
        {
            "role":"user",
            "content": (f'compare your initial analysis of the earning call report to the following data. call out any conflics or confirmations: {getComparisons(str(ticker))}')
        }
    ],
    max_tokens=13107,
    temperature=.1,
    top_p=1.0,
    frequency_penalty=0.0,
    presence_penalty=0.0,
    model=model_name
    )
    aiOut = str(response.choices[0].message.content)
    return(aiOut)

@app.get("/")
def read_root():
    return {"status": "ok"}



def _normalize_csv(raw: bytes) -> bytes:
    """Ensure the CSV has a 'Date' and 'Close' column before passing to ml.py."""
    df = pd.read_csv(io.StringIO(raw.decode("utf-8")))
    df.columns = [c.strip() for c in df.columns]
    col_map = {c.lower(): c for c in df.columns}

    date_col = col_map.get("date")
    close_col = col_map.get("adj close") or col_map.get("close")

    if not date_col or not close_col:
        raise HTTPException(status_code=400, detail="CSV must contain a Date and a Close (or Adj Close) column.")

    rename = {}
    if date_col != "Date":
        rename[date_col] = "Date"
    if close_col != "Close":
        rename[close_col] = "Close"
    if rename:
        df = df.rename(columns=rename)

    return df.to_csv(index=False).encode("utf-8")


def _ensure_model_trained():
    """Train on spy.csv once if no saved model exists."""
    if not os.path.exists(MODEL_PATH):
        if not os.path.exists(PATH):
            raise HTTPException(status_code=503, detail="Training data (spy.csv) not found.")
        train_and_save(PATH, MODEL_PATH)


def _build_predictions(feat_df: pd.DataFrame, artifacts: dict) -> list:
    last_rows = feat_df.tail(10)
    preds = composite_predictor(
        direction_model=artifacts["direction_model"],
        return_model=artifacts["return_model"],
        direction_scaler=artifacts["scaler"],
        X_dir=last_rows[artifacts["direction_features"]],
        X_ret=last_rows[artifacts["return_features"]],
        close=last_rows["Close"],
        direction_threshold=artifacts["direction_threshold"],
    ).reset_index(drop=True)
    source_dates = last_rows["Date"].reset_index(drop=True)
    return [
        {
            "date": (source_dates.iloc[i] + BDay(HORIZON_DAYS)).strftime("%Y-%m-%d"),
            "close": round(float(preds.iloc[i]["pred_price"]), 2),
            "direction": int(preds.iloc[i]["direction"]),
        }
        for i in range(len(preds))
    ]


@app.get("/predict/default")
def predict_default():
    _ensure_model_trained()
    artifacts = load_artifacts(MODEL_PATH)

    raw_df = get_data(PATH)
    feat_df = make_inference_features(raw_df)

    historical = [
        {"date": row["Date"].strftime("%Y-%m-%d"), "close": round(float(row["Close"]), 2)}
        for _, row in raw_df.tail(200).iterrows()
    ]
    predictions = _build_predictions(feat_df, artifacts)
    return {"historical": historical, "predictions": predictions}


@app.post("/predict/file")
async def predict_file(file: UploadFile):
    raw = await file.read()

    try:
        normalized = _normalize_csv(raw)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Could not parse CSV file.")

    # Write to a temp file so ml.py path-based functions can read it
    with tempfile.NamedTemporaryFile(suffix=".csv", delete=False) as tmp:
        tmp.write(normalized)
        tmp_path = tmp.name

    try:
        _ensure_model_trained()
        artifacts = load_artifacts(MODEL_PATH)

        raw_df = get_data(tmp_path)
        feat_df = make_inference_features(raw_df)
        if len(feat_df) < 10:
            raise HTTPException(
                status_code=400,
                detail="Not enough rows after feature engineering. Provide at least 80 rows of history.",
            )

        historical = [
            {"date": row["Date"].strftime("%Y-%m-%d"), "close": round(float(row["Close"]), 2)}
            for _, row in raw_df.iterrows()
        ]
        predictions = _build_predictions(feat_df, artifacts)
        return {"historical": historical, "predictions": predictions}

    finally:
        os.unlink(tmp_path)


@app.post("/initanalyze/file")
async def analyze_file(file: UploadFile):
    raw = await file.read()
    text = raw.decode("utf-8", errors="ignore").strip()
    text = str(text)
    return(findResponse(text))

@app.post("/initanalyze/text")
def analyze_text(data: TextInput):
    inp = data.text
    return(findResponse(inp))


if __name__ == "__main__":
    # findResponse("testing testing testing apple is the company")
    print(getComparisons("AAPL"))
