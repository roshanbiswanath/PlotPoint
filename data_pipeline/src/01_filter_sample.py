import pandas as pd
import numpy as np
import os
from pathlib import Path

# Configuration
INPUT_FILE = "../data/input/movies.csv"  # The user needs to place their dataset here
OUTPUT_FILE = "../data/output/phase_a_filtered_movies.csv"
TARGET_SIZE = 3000  # Approx target size mentioned in plan (2500-3500)
RANDOM_SEED = 42

def load_data(filepath):
    print(f"Loading dataset from {filepath}...")
    try:
        # Assuming a standard CSV format, potentially with various separators if needed
        # We can try reading with low_memory=False to avoid mixed type warnings
        df = pd.read_csv(filepath, low_memory=False)
        print(f"Initial shape: {df.shape}")
        return df
    except FileNotFoundError:
        print(f"Error: {filepath} not found.")
        print("Please place the source dataset (movies.csv) in data_pipeline/data/input/")
        return None

def filter_data(df):
    print("Applying filters...")
    initial_count = len(df)
    
    # Ensure numeric columns are numeric
    df['vote_count'] = pd.to_numeric(df['vote_count'], errors='coerce')
    df['popularity'] = pd.to_numeric(df['popularity'], errors='coerce')
    df['runtime'] = pd.to_numeric(df['runtime'], errors='coerce')
    
    # 1. Hard quality filters
    mask = (
        (df['vote_count'] >= 500) &
        (df['popularity'] >= 5) &
        (df['overview'].notna()) & (df['overview'] != '') &
        (df['genres'].notna()) & (df['genres'] != '[]') &
        (df['keywords'].notna()) & (df['keywords'] != '[]') &
        (df['runtime'] >= 60) & (df['runtime'] <= 240)
    )
    
    filtered_df = df[mask].copy()
    print(f"Rows after filtering: {len(filtered_df)} (Removed {initial_count - len(filtered_df)})")
    
    # 2. Add media_type (future-proofing)
    filtered_df['media_type'] = 'movie'
    
    return filtered_df

def sample_data(df, target_size):
    print(f"Sampling down to approx {target_size} rows...")
    
    if len(df) <= target_size:
        print("Dataset smaller than target size. Keeping all.")
        return df
        
    # Sort by popularity descending
    df_sorted = df.sort_values(by='popularity', ascending=False).reset_index(drop=True)
    
    # Strategy: 
    # 70% from top-popularity movies
    # 30% randomly sampled from mid-popularity range
    
    top_n_count = int(target_size * 0.70)
    random_n_count = target_size - top_n_count
    
    # Take top 70% chunk
    top_tier = df_sorted.iloc[:top_n_count]
    
    # Take random 30% from the rest (mid-popularity)
    # We'll define "rest" as everything else. 
    # Or to be safe, maybe next 2*target_size to ensure quality? 
    # The plan says "mid-popularity range", implying we shouldn't take the absolute tail.
    # Let's take from the next portion of the list.
    
    remaining = df_sorted.iloc[top_n_count:]
    
    if len(remaining) > random_n_count:
        random_tier = remaining.sample(n=random_n_count, random_state=RANDOM_SEED)
    else:
        random_tier = remaining
        
    # Combine and shuffle
    final_df = pd.concat([top_tier, random_tier]).sample(frac=1, random_state=RANDOM_SEED).reset_index(drop=True)
    
    print(f"Final sampled shape: {final_df.shape}")
    return final_df

def main():
    # Resolve paths relative to script
    script_dir = Path(__file__).parent
    input_path = (script_dir / INPUT_FILE).resolve()
    output_path = (script_dir / OUTPUT_FILE).resolve()
    
    df = load_data(input_path)
    if df is not None:
        filtered_df = filter_data(df)
        if not filtered_df.empty:
            final_df = sample_data(filtered_df, TARGET_SIZE)
            
            # Ensure output directory exists
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            final_df.to_csv(output_path, index=False)
            print(f"Saved processed dataset to {output_path}")
        else:
            print("No data left after filtering.")

if __name__ == "__main__":
    main()
