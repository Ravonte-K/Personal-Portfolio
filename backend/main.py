from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from openai import AzureOpenAI
import yfinance as yf
import pandas as pd
from dotenv import load_dotenv
load_dotenv()
import json
import re

app = FastAPI()




endpoint = "https://ravontek-practiceec-resource.cognitiveservices.azure.com/"
model_name = "gpt-4.1-mini"
deployment = "gpt-4.1-mini"

subscription_key = os.getenv("AZURE_OPENAI_API_KEY")
if not subscription_key:
    raise RuntimeError("AZURE_OPENAI_API_KEY is not set")
api_version = "2024-12-01-preview"

client = AzureOpenAI(
    api_version=api_version,
    azure_endpoint=endpoint,
    api_key=subscription_key,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
                   "http://127.0.0.1:3000",
                   "http://localhost:3001"
    ],
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
         model=deployment,
        temperature=0,
        max_completion_tokens=200,
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


@app.get("/")
def read_root():
    return {"status": "ok"}

@app.post("/initanalyze")
def analyze_text(data: TextInput):
    ticker = grabTicker(data.text)
    response = client.chat.completions.create(
    messages=[
        {
            "role": "system",
            "content": "You are a financial analyst. And you mostly respond in bullet points and big ideas. You usually are asked about earning calls. Label your response with the ticker of the company you are summarizing",
        },
        {
            "role": "user",
            "content": (data.text),
        },
        {
            "role":"user",
            "content": (f'compare your initial analysis of the earning call report to the following data. call out any conflics or confirmations: {getComparisons(str(ticker))}')
        }
    ],
    max_completion_tokens=13107,
    temperature=.2,
    top_p=1.0,
    frequency_penalty=0.0,
    presence_penalty=0.0,
    model=deployment
)
    aiOut = str(response.choices[0].message.content)
    
    return(aiOut)


if __name__ == "__main__":
    print(getComparisons("AAPL"))
