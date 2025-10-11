import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from chatbot.server.rag import RAG


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = "AIzaSyDb7xG_sYAConxRmBQhLqRmrBGlisZbnNs"
rag = RAG(api_key=API_KEY, workers=8, batch_size=50)


class SearchRequest(BaseModel):
    file_paths: List[str]
    query: str
    top_k: int = 5


@app.post("/search")
async def search(req: SearchRequest):
    rag.index(req.file_paths)
    results = rag.search(req.query, req.top_k)
    
    return {
        'status': 'success',
        'query': req.query,
        'results': results,
        'total': len(results),
        'files': len(req.file_paths),
        'chunks': len(rag.chunks)
    }


@app.get("/")
async def root():
    return {'api': 'RAG', 'status': 'running'}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)