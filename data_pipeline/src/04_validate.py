import pandas as pd
import numpy as np
from pathlib import Path
import chromadb

DATA_FILE = "../data/output/phase_c_embedded.csv"
CHROMA_DB_PATH = "../data/output/chroma_db"
COLLECTION_NAME = "plotpoint_movies"

def get_neighbors(query_text, collection, n_results=5):
    # Chroma handles the query embedding using the stored vectors if we query by vector, 
    # OR we can query by text if we attach an embedding function to the collection.
    # Since we stored explicit vectors, we can query by nearest neighbor navigation 
    # BUT for validation, we want to look up an Item ID and find its neighbors.
    
    # First, separate 'get by item' logic
    pass 

def main():
    script_dir = Path(__file__).parent
    data_path = (script_dir / DATA_FILE).resolve()
    chroma_path = (script_dir / CHROMA_DB_PATH).resolve()
    
    if not data_path.exists() or not chroma_path.exists():
        print("Data or ChromaDB missing. Run previous steps.")
        return
        
    df = pd.read_csv(data_path)
    
    print(f"Connecting to ChromaDB at {chroma_path}...")
    client = chromadb.PersistentClient(path=str(chroma_path))
    collection = client.get_collection(name=COLLECTION_NAME)
    
    print(f"Loaded {collection.count()} items in Chroma.")
    
    # Test cases from plan
    test_titles = [
        "Inception", 
        "The Avengers", 
        "Pulp Fiction",
        "Interstellar"
    ]
    
    print("\n--- Validation Check ---")
    
    for title_query in test_titles:
        # Find exact or close match in our CSV to get the ID
        matches = df[df['title'].str.contains(title_query, case=False, na=False)]
        
        if matches.empty:
            print(f"\nMovie '{title_query}' not found in sampled dataset.")
            continue
            
        # Take the first match
        # In 03_generate_embeddings, we used the dataframe index as the ID
        idx = matches.index[0] 
        real_title = df.loc[idx, 'title']
        item_id = str(idx)
        
        # Retrieve the embedding for this item from Chroma to use as query
        # (Though chroma has a 'get' and 'query', query usually takes a vector or text. 
        # To find 'more like this' by ID, we fetch the vector first.)
        
        item_data = collection.get(ids=[item_id], include=['embeddings'])
        if len(item_data['embeddings']) == 0:
            print(f"Error: No embedding found for ID {item_id}")
            continue
            
        query_vec = item_data['embeddings'][0]
        
        print(f"\nNeighbors for '{real_title}':")
        
        # Query
        results = collection.query(
            query_embeddings=[query_vec],
            n_results=6 # 1 for self + 5 neighbors
        )
        
        # Results are lists of lists
        found_ids = results['ids'][0]
        distances = results['distances'][0] # Chroma default might be L2 or Cosine distance depending on init
        
        for found_id, dist in zip(found_ids, distances):
            if found_id == item_id: continue # Skip self
            
            # Look up metadata from our DF because it's faster/easier than parsing chroma metadata result
            neighbor_idx = int(found_id)
            n_title = df.loc[neighbor_idx, 'title']
            n_genres = df.loc[neighbor_idx, 'genres_list']
            
            # Note: Chroma distance. If cosine space, lower is closer? 
            # We set {"hnsw:space": "cosine"} -> distance = 1 - cosine_similarity
            # So dist 0.1 means sim 0.9.
            print(f"  [dist {dist:.4f}] {n_title} ({n_genres})")
            
    print("\nIf the results look semantically relevant, proceed to reduction.")

if __name__ == "__main__":
    main()
