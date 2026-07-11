from fastembed import TextEmbedding

_embedding_model = TextEmbedding(
    model_name="BAAI/bge-small-en-v1.5",
    specific_model_path="./models/bge-small-en-v1.5"
)

def embed_texts(texts: list[str]) -> list[list[float]]:
    embeddings = list(_embedding_model.embed(texts))
    return [e.tolist() for e in embeddings]