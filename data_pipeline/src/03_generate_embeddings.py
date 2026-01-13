import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import torch
from pathlib import Path
from tqdm import tqdm
import chromadb
from chromadb.utils import embedding_functions

INPUT_FILE = "../data/output/phase_b_normalized.csv"
CHROMA_DB_PATH = "../data/output/chroma_db"
COLLECTION_NAME = "plotpoint_movies"
OUTPUT_DF_WITH_REF = "../data/output/phase_c_embedded.csv"

# Model Config
MODEL_NAME = 'all-mpnet-base-v2' # optimized for semantic search
BATCH_SIZE = 32

def main():
    script_dir = Path(__file__).parent
    input_path = (script_dir / INPUT_FILE).resolve()
    chroma_path = (script_dir / CHROMA_DB_PATH).resolve()
    df_output_path = (script_dir / OUTPUT_DF_WITH_REF).resolve()
    
    if not input_path.exists():
        print("Input file not found. Run 02_normalize.py first.")
        return
        
    df = pd.read_csv(input_path)
    
    # Check if we have the text column
    if 'embedding_input' not in df.columns:
        print("Error: 'embedding_input' column missing.")
        return

    sentences = df['embedding_input'].tolist()
    
    print(f"Loading model {MODEL_NAME}...")
    # Chroma can handle embedding generation automatically, but for control and batching
    # consistent with previous steps, we will generate them explicitly or use Chroma's built-in if we prefer.
    # To keep dependencies simple, let's stick to SentenceTransformer explicit generation or pass the ef to chroma.
    # We'll generate explicitly to ensure we have the vectors for downstream UMAP easily without querying everything back immediately,
    # though Chroma is the storage now.
    
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"Using device: {device}")
    
    model = SentenceTransformer(MODEL_NAME, device=device)
    
    print(f"Generating embeddings for {len(sentences)} items...")
    embeddings = model.encode(sentences, batch_size=BATCH_SIZE, show_progress_bar=True)
    
    print(f"Embeddings shape: {embeddings.shape}")
    
    # --- CHROMA DB SETUP ---
    print(f"Initializing ChromaDB at {chroma_path}...")
    client = chromadb.PersistentClient(path=str(chroma_path))
    
    # Reset/Get collection
    try:
        client.delete_collection(name=COLLECTION_NAME)
    except:
        pass # collection didn't exist
        
    collection = client.create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"} # PlotPoint logic uses cosine similarity
    )
    
    print("Storing embeddings in ChromaDB...")
    
    # Prepare data for Chroma
    ids = [str(i) for i in range(len(df))]
    metadatas = []
    
    # We only store essential metadata for retrieval/filtering if needed. 
    # The full data is in the CSV or can be stored here.
    # Let's store title and genre for basic inspection.
    for _, row in df.iterrows():
        metadatas.append({
            "title": row['title'],
            "era": str(row['era']),
            "genres": str(row['genres_list'])
        })
        
    # Add to collection in batches (Chroma handles batching but explicit is safe)
    batch_size = 500
    for i in range(0, len(ids), batch_size):
        end = min(i + batch_size, len(ids))
        collection.add(
            embeddings=embeddings[i:end].tolist(),
            documents=sentences[i:end],
            metadatas=metadatas[i:end],
            ids=ids[i:end]
        )
        
    print(f"Successfully stored {len(ids)} items in collection '{COLLECTION_NAME}'.")

    # Save a reference DF that confirms these embeddings align with this data version?
    # We still need the main DF for the UMAP step unless we pull everything from Chroma.
    # For the pipeline flow, we'll keep the CSV as the master metadata record.
    df.to_csv(df_output_path, index=False)
    print(f"Saved reference dataframe to {df_output_path}")

if __name__ == "__main__":
    main()
