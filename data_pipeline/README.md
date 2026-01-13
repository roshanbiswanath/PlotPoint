# PlotPoint Data Pipeline

This pipeline processes movie data to generate the 3D visualization dataset.

## Setup

1.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
    (Note: You typically need a Python virtual environment).

2.  **Get the Data:**
    - Download a movie metadata dataset (e.g., from Kaggle: "The Movies Dataset" or similar TMDB exports).
    - It must contain columns: `title, genres, keywords, overview, release_date, runtime, popularity, vote_count`.
    - Rename the file to `movies.csv` and place it in `data/input/`.

## Running the Pipeline

Run the scripts in order:

1.  **Filter & Sample:**
    ```bash
    python src/01_filter_sample.py
    ```
    Creates `data/output/phase_a_filtered_movies.csv`.

2.  **Normalize:**
    ```bash
    python src/02_normalize.py
    ```
    Creates `data/output/phase_b_normalized.csv`.

3.  **Generate Embeddings:**
    ```bash
    python src/03_generate_embeddings.py
    ```
    *Note: This uses `all-mpnet-base-v2` locally. On a CPU, this might take 10-20 minutes for 3000 movies.*
    Creates `data/output/embeddings.npy` and `data/output/phase_c_embedded.csv`.

4.  **Validate:**
    ```bash
    python src/04_validate.py
    ```
    Check the terminal output to see if "Inception" neighbors make sense.

5.  **Reduce & Cluster:**
    ```bash
    python src/05_reduce_and_cluster.py
    ```
    Creates `data/output/plotpoint_data_3d.json`.

## Output

The final file `data/output/plotpoint_data_3d.json` is ready to be loaded by the Web App.
