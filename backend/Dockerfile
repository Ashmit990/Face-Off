FROM python:3.11-slim

# System deps: gcc etc for any packages that need compilation (e.g. chromadb deps)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first (layer caching — only reinstalls if requirements.txt changes)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Bake the FastEmbed model into the image so it's not downloaded at container startup.
# This is the step that fixes the "network issues downloading via Hugging Face" problem
# for good, since it only needs to succeed once, at build time, not on every cold start.
RUN python -c "from fastembed import TextEmbedding; TextEmbedding('BAAI/bge-small-en-v1.5')"

# Now copy the rest of the app
COPY . .

# Chroma will persist here — this path gets mounted to Render's Persistent Disk
ENV CHROMA_PERSIST_DIR=/data/chroma
RUN mkdir -p /data/chroma

# FastEmbed's own model cache — belt and suspenders alongside the bake step above,
# in case anything ever needs to re-resolve the model
ENV FASTEMBED_CACHE_DIR=/data/fastembed_cache
RUN mkdir -p /data/fastembed_cache

EXPOSE 8000

# Simple healthcheck Render can hit — see the /health endpoint snippet
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Adjust "app.main:app" if your entrypoint module/path is different
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]