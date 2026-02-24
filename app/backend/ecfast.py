from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from openai import OpenAI
import yfinance as yf
import pandas as pd
from dotenv import load_dotenv
load_dotenv()
import json
import re

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
