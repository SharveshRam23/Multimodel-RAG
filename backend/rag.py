import os
import sqlite3
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import logging

logging.basicConfig(level=logging.INFO)

DB_PATH = "data/metadata.db"
FAISS_INDEX_PATH = "data/faiss.index"
DIMENSION = 384 # all-MiniLM-L6-v2 produces vectors of dimension 384

def init_db():
    os.makedirs("data", exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            filename TEXT,
            type TEXT,
            upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            summary TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chunks (
            chunk_id INTEGER PRIMARY KEY AUTOINCREMENT,
            doc_id TEXT,
            content TEXT,
            FOREIGN KEY(doc_id) REFERENCES documents(id)
        )
    ''')
    conn.commit()
    conn.close()

init_db()

embedding_model = None

def get_embedding_model():
    global embedding_model
    if embedding_model is None:
        logging.info("Loading SentenceTransformer model...")
        embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    return embedding_model

def load_index():
    if os.path.exists(FAISS_INDEX_PATH):
        return faiss.read_index(FAISS_INDEX_PATH)
    else:
        # Create an IndexIDMap to assign custom IDs
        sub_index = faiss.IndexFlatL2(DIMENSION)
        return faiss.IndexIDMap(sub_index)

def save_index(index):
    faiss.write_index(index, FAISS_INDEX_PATH)

index = load_index()

def chunk_text(text: str, chunk_size: int = 400, overlap: int = 50) -> list:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks

def store_document(doc_id: str, filename: str, doc_type: str, text: str, summary: str = ""):
    global index
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if doc exists to avoid duplicate
    cursor.execute("SELECT id FROM documents WHERE id=?", (doc_id,))
    if cursor.fetchone():
        conn.close()
        return

    cursor.execute("INSERT INTO documents (id, filename, type, summary) VALUES (?, ?, ?, ?)", 
                   (doc_id, filename, doc_type, summary))
    
    chunks = chunk_text(text)
    if not chunks:
        conn.commit()
        conn.close()
        return
        
    model = get_embedding_model()
    
    for chunk in chunks:
        cursor.execute("INSERT INTO chunks (doc_id, content) VALUES (?, ?)", (doc_id, chunk))
        chunk_id = cursor.lastrowid
        
        vec = model.encode([chunk])[0]
        # faiss.IndexIDMap expects IDs to be int64 numpy array
        index.add_with_ids(np.array([vec]).astype('float32'), np.array([chunk_id]).astype('int64'))
    
    conn.commit()
    conn.close()
    save_index(index)

def retrieve_chunks(query: str, top_k: int = 3) -> list:
    global index
    if index.ntotal == 0:
        return []
    model = get_embedding_model()
    vec = model.encode([query])[0]
    
    distances, ids = index.search(np.array([vec]).astype('float32'), top_k)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    results = []
    for chunk_id in ids[0]:
        if chunk_id == -1: 
            continue
        cursor.execute("SELECT documents.filename, chunks.content FROM chunks JOIN documents ON chunks.doc_id = documents.id WHERE chunks.chunk_id = ?", (int(chunk_id),))
        row = cursor.fetchone()
        if row:
            results.append({"filename": row[0], "content": row[1]})
            
    conn.close()
    return results

def get_all_documents() -> list:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT filename, type, upload_time FROM documents ORDER BY upload_time DESC")
    rows = cursor.fetchall()
    conn.close()
    return [{"filename": row[0], "type": row[1], "upload_time": row[2]} for row in rows]
