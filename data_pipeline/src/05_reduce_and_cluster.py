import pandas as pd
import numpy as np
import umap
import hdbscan
from sklearn.decomposition import PCA
from pathlib import Path
import json
import joblib
import chromadb

DATA_FILE = "../data/output/phase_c_embedded.csv"
CHROMA_DB_PATH = "../data/output/chroma_db"
COLLECTION_NAME = "plotpoint_movies"
OUTPUT_JSON = "../data/output/plotpoint_data_3d.json"
MODEL_DIR = "../data/output/models"

# Config
pca_components = 50
umap_neighbors = 15
umap_min_dist = 0.1
umap_metric = 'cosine'
coordinate_scale = 50

def main():
    script_dir = Path(__file__).parent
    data_path = (script_dir / DATA_FILE).resolve()
    chroma_path = (script_dir / CHROMA_DB_PATH).resolve()
    output_path = (script_dir / OUTPUT_JSON).resolve()
    model_dir = (script_dir / MODEL_DIR).resolve()
    model_dir.mkdir(parents=True, exist_ok=True)

    if not data_path.exists() or not chroma_path.exists():
        print("Data or ChromaDB missing.")
        return
        
    df = pd.read_csv(data_path)
    
    # Load embeddings from ChromaDB
    print("Loading embeddings from ChromaDB...")
    client = chromadb.PersistentClient(path=str(chroma_path))
    collection = client.get_collection(name=COLLECTION_NAME)
    
    # Get all embeddings in order
    all_ids = [str(i) for i in range(len(df))]
    result = collection.get(ids=all_ids, include=['embeddings'])
    embeddings = np.array(result['embeddings'])
    
    # 1. PCA
    print(f"Running PCA (reduce to {pca_components}D)...")
    pca = PCA(n_components=min(pca_components, embeddings.shape[1], embeddings.shape[0]))
    pca_result = pca.fit_transform(embeddings)
    
    # 2. UMAP
    print("Running UMAP (reduce to 3D)...")
    reducer = umap.UMAP(
        n_neighbors=umap_neighbors,
        min_dist=umap_min_dist,
        n_components=3,
        metric=umap_metric,
        random_state=42
    )
    umap_result = reducer.fit_transform(pca_result)
    
    # 3. Normalize coordinates for better 3D UX
    print("Normalizing coordinates...")
    coords = umap_result.copy()
    coords = (coords - coords.mean(axis=0)) / coords.std(axis=0)
    coords = coords * coordinate_scale
    
    df['x'] = coords[:, 0]
    df['y'] = coords[:, 1]
    df['z'] = coords[:, 2]
    
    # 4. Clustering (HDBSCAN on PCA space, NOT UMAP)
    print("Running HDBSCAN clustering on PCA space...")
    clusterer = hdbscan.HDBSCAN(
        min_cluster_size=20,
        min_samples=1,
        cluster_selection_epsilon=1.5,
        prediction_data=True
    )
    clusterer.fit(pca_result)
    df['cluster'] = clusterer.labels_
    df['cluster_confidence'] = clusterer.probabilities_
    
    print(f"Found {len(set(clusterer.labels_)) - (1 if -1 in clusterer.labels_ else 0)} clusters.")
    
    # 5. Persist models for future use
    print("Saving models...")
    joblib.dump(pca, model_dir / "pca_model.joblib")
    joblib.dump(reducer, model_dir / "umap_model.joblib")
    joblib.dump(clusterer, model_dir / "hdbscan_model.joblib")
    print(f"Models saved to {model_dir}")
    
    # 6. Export for Web App
    # Select columns needed for UI
    
    # Helper to parse stringified lists safely for JSON export
    import ast
    def parse_list(x):
        if pd.isna(x) or x == '':
            return []
        try:
            # Try literal_eval first (for stringified lists)
            return ast.literal_eval(x)
        except (ValueError, SyntaxError):
            # Fall back to simple split if it's already comma-separated
            if isinstance(x, str):
                return [item.strip() for item in x.split(',') if item.strip()]
            return []

    export_records = []
    print("Preparing JSON export...")
    
    for idx, row in df.iterrows():
        # Use stable ID - prefer id column from dataset, fallback to index
        stable_id = str(row.get('id', idx))
        
        record = {
            "id": stable_id,
            "title": row['title'],
            "x": float(row['x']),
            "y": float(row['y']),
            "z": float(row['z']),
            "cluster": int(row['cluster']),
            "cluster_confidence": float(row['cluster_confidence']),
            "popularity": float(row['popularity']) if pd.notna(row['popularity']) else 0,
            "year": int(row['release_year']) if pd.notna(row['release_year']) else None,
            "era": row['era'],
            "genres": parse_list(row.get('genres_list', row.get('genres', ''))),
            "runtime": row['runtime_bucket'],
            "overview": str(row['overview']) if pd.notna(row['overview']) else "",
            "poster_path": row.get('poster_path', None),
            "original_language": str(row['original_language']) if pd.notna(row['original_language']) else "en"
        }
        export_records.append(record)
        
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(export_records, f, indent=2)
        
    print(f"Saved 3D data for web app to {output_path}")

if __name__ == "__main__":
    main()
