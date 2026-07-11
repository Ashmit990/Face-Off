from fastembed import TextEmbedding

# Loads once at startup, cached offline after first download
_embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")

def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed a list of text chunks, returns list of vectors."""
    embeddings = list(_embedding_model.embed(texts))
    return [e.tolist() for e in embeddings]