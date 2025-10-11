import fitz
import os
import re
import numpy as np
from typing import List, Dict
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

from google import genai
from google.genai import types
from sklearn.metrics.pairwise import cosine_similarity



def extract_pdf_text(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)
    text = "\n\n".join([doc[i].get_text() for i in range(len(doc))])
    doc.close()
    return text


def preprocess_text(text: str) -> str:
    text = re.sub(r'(\w+)-\s*\n\s*(\w+)', r'\1\2', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def split_into_chunks(text: str, size: int = 500, overlap: int = 100) -> List[str]:
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    
    chunks = []
    current = ""
    current_size = 0
    
    for para in paragraphs:
        para_size = len(para.split())
        
        if current_size + para_size > size and current:
            chunks.append(current.strip())
            current = para
            current_size = para_size
        else:
            current += "\n\n" + para if current else para
            current_size += para_size
    
    if current:
        chunks.append(current.strip())
    
    result = []
    for i, chunk in enumerate(chunks):
        if i > 0 and overlap > 0:
            prev_words = chunks[i-1].split()
            if len(prev_words) > overlap:
                overlap_text = ' '.join(prev_words[-overlap:]) + "\n\n"
                chunk = overlap_text + chunk
        result.append(chunk)
    
    return result


class RAG:
    def __init__(self, api_key: str, workers: int = 8, batch_size: int = 50):
        self.client = genai.Client(api_key=api_key)
        self.model = "gemini-embedding-001"
        self.workers = 8
        self.batch_size = batch_size
        self.chunks = []
        self.embeddings = None
    
    def _embed(self, texts: List[str], task: str) -> np.ndarray:
        result = self.client.models.embed_content(
            model=self.model,
            contents=texts,
            config=types.EmbedContentConfig(task_type=task)
        )
        return np.array([np.array(e.values) for e in result.embeddings])
    
    def _embed_parallel(self, texts: List[str], task: str) -> np.ndarray:
        batches = [texts[i:i + self.batch_size] for i in range(0, len(texts), self.batch_size)]
        results = [None] * len(batches)
        
        with ThreadPoolExecutor(max_workers=self.workers) as executor:
            futures = {executor.submit(self._embed, batch, task): i for i, batch in enumerate(batches)}
            for future in as_completed(futures):
                results[futures[future]] = future.result()
        
        return np.vstack(results)
    
    def _process_file(self, path: str) -> tuple:
        text = extract_pdf_text(path)
        text = preprocess_text(text)
        chunks = split_into_chunks(text)
        embeddings = self._embed_parallel(chunks, "RETRIEVAL_DOCUMENT")
        return chunks, embeddings, os.path.basename(path)
    
    def index(self, file_paths: List[str]):
        valid_paths = [p for p in file_paths if os.path.exists(p) and p.endswith('.pdf')]
        print("VALID", valid_paths)
        with ThreadPoolExecutor(max_workers=self.workers) as executor:
            futures = [executor.submit(self._process_file, path) for path in valid_paths]
            
            for future in as_completed(futures):
                chunks, embeddings, filename = future.result()
                
                start_idx = len(self.chunks)
                for i, chunk in enumerate(chunks):
                    self.chunks.append({
                        'id': start_idx + i,
                        'text': chunk,
                        'filename': filename
                    })
                
                if self.embeddings is None:
                    self.embeddings = embeddings
                else:
                    self.embeddings = np.vstack([self.embeddings, embeddings])
    
    def search(self, query: str, top_k: int = 5) -> List[Dict]:
        if not self.chunks or self.embeddings is None:
            return []
        
        query_embed = self._embed([query], "RETRIEVAL_QUERY")
        similarities = cosine_similarity(query_embed, self.embeddings)[0]
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        return [{
            'text': self.chunks[idx]['text'],
            'filename': self.chunks[idx]['filename'],
            'score': float(similarities[idx])
        } for idx in top_indices]


def index_and_search(file_paths: List[str], query: str, top_k: int = 5, api_key: str = None):
    rag = RAG(api_key=api_key or os.getenv("GEMINI_API_KEY"))
    rag.index(file_paths)
    results = rag.search(query, top_k)
    
    return {
        'query': query,
        'results': results,
        'total': len(results),
        'files': len(file_paths),
        'chunks': len(rag.chunks)
    }