FROM python:3.11-slim

# System deps: Tesseract (with Telugu pack) + OpenCV headless runtime libs
RUN apt-get update && apt-get install -y --no-install-recommends \
        tesseract-ocr \
        tesseract-ocr-tel \
        libglib2.0-0 \
        libgomp1 \
        libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first (cached layer)
COPY requirements.txt .
# Use headless OpenCV — no display needed on server
RUN sed 's/opencv-python>=/opencv-python-headless>=/g' requirements.txt > req_server.txt \
    && pip install --no-cache-dir -r req_server.txt \
    && rm req_server.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
