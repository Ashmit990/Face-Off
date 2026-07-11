import os
import chromadb
from app.services.embeddings import embed_texts

# Persistent ChromaDB. Reads CHROMA_PERSIST_DIR in production (set to /data/chroma
# on Render, pointing at the mounted persistent disk). Falls back to the old local
# relative path for local dev, so nothing changes on your machine.
_persist_path = os.getenv("CHROMA_PERSIST_DIR", "./chroma_data")
_client = chromadb.PersistentClient(path=_persist_path)

def get_or_create_collection(user_id: str):
    collection_name = f"cv_{user_id.replace('-', '_')}"
    collection = _client.get_or_create_collection(name=collection_name)
    return collection, collection_name

def store_cv_chunks(user_id: str, chunks: list[dict]):
    """
    chunks: list of {"section": str, "text": str}
    Stores embeddings in the user's ChromaDB collection.
    """
    collection, collection_name = get_or_create_collection(user_id)

    # Clear old data on re-upload (fresh CV replaces old one)
    existing = collection.get()
    if existing["ids"]:
        collection.delete(ids=existing["ids"])

    texts = [c["text"] for c in chunks]
    vectors = embed_texts(texts)
    ids = [f"{user_id}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"section": c["section"]} for c in chunks]

    collection.add(
        ids=ids,
        embeddings=vectors,
        documents=texts,
        metadatas=metadatas
    )
    return collection_name

def query_relevant_chunk(user_id: str, query_text: str, n_results: int = 2):
    collection, _ = get_or_create_collection(user_id)
    query_vector = embed_texts([query_text])[0]
    results = collection.query(query_embeddings=[query_vector], n_results=n_results)
    return results

def get_chunk_by_section(user_id: str, section: str):
    collection, _ = get_or_create_collection(user_id)
    result = collection.get(where={"section": section})
    if result["documents"]:
        return result["documents"][0]
    return None


def get_next_unused_section(user_id: str, used_sections: list[str]) -> tuple[str, str] | None:
    collection, _ = get_or_create_collection(user_id)
    all_chunks = collection.get()
    for doc, meta in zip(all_chunks["documents"], all_chunks["metadatas"]):
        section = meta["section"]
        if section not in used_sections and section != "general":
            return section, doc
    return None


def get_all_sections(user_id: str) -> list[str]:
    """Returns all distinct section names for this user's CV, excluding 'general'."""
    collection, _ = get_or_create_collection(user_id)
    all_chunks = collection.get()
    sections = set()
    for meta in all_chunks["metadatas"]:
        if meta["section"] != "general":
            sections.add(meta["section"])
    return list(sections)