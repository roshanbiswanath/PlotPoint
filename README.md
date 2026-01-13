# PlotPoint

Explore cinema by proximity in a 3D point cloud.

## Project Structure

- `data_pipeline/`: Python scripts to process movie data into 3D coordinates.
- `web_app/`: React Three Fiber application to visualize the data.

## Getting Started

### 1. Data Pipeline

You need a `movies.csv` file in `data_pipeline/data/input/`.
It should look like [The Movies Dataset](https://www.kaggle.com/datasets/rounakbanik/the-movies-dataset).

```bash
cd data_pipeline

# Create venv and install dependencies (already done if you followed the agent)
# python -m venv .venv
# .\.venv\Scripts\Activate
# pip install -r requirements.txt

# Run the pipeline
python src/01_filter_sample.py
python src/02_normalize.py
python src/03_generate_embeddings.py
python src/04_validate.py
python src/05_reduce_and_cluster.py
```

This will generate `data_pipeline/data/output/plotpoint_data_3d.json`.

### 2. Web App

```bash
cd web_app
npm install

# Copy the data to the web app
# (PowerShell)
Copy-Item ..\data_pipeline\data\output\plotpoint_data_3d.json public\

npm run dev
```

Open the local URL (usually http://localhost:5173) to see the visualization.
