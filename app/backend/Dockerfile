FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY ecfast.py ./ecfast.py
COPY ml.py ./ml.py
COPY data ./data
RUN mkdir -p models

ENV PORT=8080

CMD ["sh", "-c", "uvicorn ecfast:app --host 0.0.0.0 --port ${PORT}"]
