import pandas as pd
import numpy as np
import ast
from pathlib import Path

INPUT_FILE = "../data/output/phase_a_filtered_movies.csv"
OUTPUT_FILE = "../data/output/phase_b_normalized.csv"

def safe_literal_eval(val):
    try:
        if pd.isna(val): return []
        return ast.literal_eval(val)
    except (ValueError, SyntaxError):
        # If it's already a list or not a string json, return as is or handled
        if isinstance(val, list): return val
        return []

def extract_names(val):
    """Extract 'name' property from list of dicts or return list of strings if already simple."""
    # Handle stringified lists
    if isinstance(val, str):
        # Check if it looks like a list of dicts
        if val.strip().startswith('[') and 'name' in val:
            data = safe_literal_eval(val)
            if isinstance(data, list):
                return [item['name'] for item in data if isinstance(item, dict) and 'name' in item]
        # Check if it is a simple list string like "['Action', 'Comedy']"
        elif val.strip().startswith('['):
             data = safe_literal_eval(val)
             if isinstance(data, list):
                 return [str(x) for x in data]
        # Maybe it's comma separated
        elif ',' in val:
            return [x.strip() for x in val.split(',')]
            
    if isinstance(val, list):
        return val
        
    return []

def get_era(year):
    if pd.isna(year): return "Unknown"
    try:
        y = int(year)
        if y < 1920: return "Pre-1920s"
        decade = (y // 10) * 10
        return f"{decade}s"
    except:
        return "Unknown"

def get_runtime_bucket(mins):
    if pd.isna(mins): return "Standard"
    if mins < 90: return "Short"
    if mins > 150: return "Long"
    return "Standard"

def main():
    script_dir = Path(__file__).parent
    input_path = (script_dir / INPUT_FILE).resolve()
    output_path = (script_dir / OUTPUT_FILE).resolve()
    
    if not input_path.exists():
        print(f"Input file not found: {input_path}")
        print("Run 01_filter_sample.py first.")
        return

    print("Loading Phase A data...")
    df = pd.read_csv(input_path)
    
    print("Normalizing features...")
    
    # 1. Parse JSON-like columns
    # We assume standard TMDB format (list of dicts) or simple lists
    df['genres_list'] = df['genres'].apply(extract_names)
    df['keywords_list'] = df['keywords'].apply(extract_names)
    df['production_list'] = df['production_companies'].apply(extract_names)
    
    # 2. Dates and Eras
    df['release_year'] = pd.to_datetime(df['release_date'], errors='coerce').dt.year
    df['era'] = df['release_year'].apply(get_era)
    
    # 3. Runtime buckets
    df['runtime_mean'] = pd.to_numeric(df['runtime'], errors='coerce')
    df['runtime_bucket'] = df['runtime_mean'].apply(get_runtime_bucket)
    
    # 4. Franchise Hint (Top Production Company)
    df['top_production'] = df['production_list'].apply(lambda x: x[0] if isinstance(x, list) and len(x) > 0 else "Indie/Unknown")
    
    # 5. Prepare Embedding Text (Section 9 Schema)
    # Text: {title} Genres: {up to 3} Themes: {top 5-8} Era: {} Language: {} Production: {} Runtime: {} Summary: {one sentence}
    
    print("constructing embedding inputs...")
    
    def construct_text(row):
        genres_str = ", ".join(row['genres_list'][:3])
        # Keywords/Themes - take top 8
        themes_str = ", ".join(row['keywords_list'][:8])
        
        # Summary - we'll just take the first sentence of overview to act as "ONE concise sentence" if not pre-summarized
        # A simple split by '.' might be crude but usually effective enough for this scale vs full NLP summarization
        overview = str(row['overview']) if pd.notna(row['overview']) else ""
        summary = overview.split('.')[0] + "." if overview else ""
        if len(summary) > 200: # specific truncation if first sentence is huge
             summary = summary[:197] + "..."
             
        text = (
            f"Title: {row['title']}\n"
            f"Genres: {genres_str}\n"
            f"Themes: {themes_str}\n"
            f"Era: {row['era']}\n"
            f"Language: {row['original_language']}\n"
            f"Production: {row['top_production']}\n"
            f"Runtime: {row['runtime_bucket']}\n"
            f"Summary: {summary}"
        )
        return text

    df['embedding_input'] = df.apply(construct_text, axis=1)
    
    # Save
    # We serialize lists back to strings or keep as is? CSV will stringify them. 
    # Pandas read_csv will need literal_eval to get them back.
    
    df.to_csv(output_path, index=False)
    print(f"Saved normalized data to {output_path}")

if __name__ == "__main__":
    main()
