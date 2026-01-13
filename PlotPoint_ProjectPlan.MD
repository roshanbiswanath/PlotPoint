
# 🎬 PlotPoint — Explore cinema by proximity

## 1. Product Vision

**PlotPoint** is a creative, exploratory website that visualizes movies (and later TV shows) as a **3D point cloud**, where:

- Each point represents a movie or show  
- Spatial proximity means **semantic similarity**  
- Users discover content by **exploring space**, not scrolling lists  

The experience is designed to feel **intuitive, curious, and delightful**, not analytical.

**Tagline:**  
> **Explore cinema by proximity**

---

## 2. Core UX Concept

PlotPoint is not a traditional recommendation engine UI.  
It is a **semantic universe of stories**.

Users can:
- Hover over points to reveal movies
- Search for a movie and see similar ones nearby
- Discover cross-language similarities (e.g., English and Hindi crime thrillers close together)
- Explore clusters and neighborhoods naturally

**Discovery > accuracy**  
**Feeling > metrics**

---

## 3. What “Similarity” Means in PlotPoint

Two movies (or shows) are close if they share:
- Genre and tone  
- Themes and motifs  
- Franchise / IP gravity  
- Era  
- Cultural adjacency (language, region)  

Similarity is **not** based on:
- Budget or revenue  
- Marketing text  
- Long plot summaries  

---

## 4. Dataset Overview

Initial dataset contains ~1.32M movie rows with columns such as:

```

title, genres, keywords, overview,
release_date, runtime,
production_companies, original_language,
vote_count, popularity, etc.

```

---

## 5. Dataset Strategy

### Start small, scale later
- Do **not** embed all 1.3M rows
- v1 target size: **~2,500–3,500 movies**

**Why:**
- Better embedding geometry
- Better clustering behavior
- Smooth 3D WebGL performance
- Faster iteration and UX tuning

---

## 6. Phase A — Dataset Filtering & Sampling (Implemented)

### Hard quality filters
Keep rows where:
- `vote_count >= 500`
- `popularity >= 5`
- `overview`, `genres`, `keywords` are non-null
- `runtime` between 60 and 240 minutes (or null)

### Media type (future-proofing)
Add:
```

media_type = "movie"

```

### Sampling strategy
- 70% from top-popularity movies
- 30% randomly sampled from mid-popularity range
- Shuffle final dataset

### Output
Save as:
```

phase_a_filtered_movies.csv

```

This becomes the **golden input dataset**.

---

## 7. Column Usage Plan

### Used directly for embeddings
- `title`
- `genres`
- `keywords`
- `overview` (shortened)
- `release_date`
- `original_language`
- `production_companies`

### Derived features
- Era (1990s, 2000s, 2010s, 2020s)
- Runtime bucket (Short / Standard / Long)
- Franchise hint (top production company)

### Explicitly excluded from embeddings
```

budget, revenue, tagline, homepage,
poster_path, backdrop_path,
spoken_languages, production_countries

```

---

## 8. Embedding Philosophy (Critical)

### What failed earlier
- Embedding full plot descriptions
- Directly reducing high-dimensional embeddings to 3D  
- Result: “thread / snake” shaped point clouds

### Correct approach
- Use **structured composite text**
- Emphasize identity and metadata
- Keep narrative text minimal

---

## 9. Final Embedding Text Schema (Locked)

Each item is embedded using **exactly this format**:

```

Title: {title}

Genres: {up to 3 genres}

Themes: {top 5–8 keywords}

Era: {1990s / 2000s / 2010s / 2020s}

Language: {original_language}

Production: {top production company}

Runtime: {Short | Standard | Long}

Summary: {ONE concise sentence}

```

**Why this works:**
- Title anchors identity  
- Genres + themes define regions  
- Production company creates franchise gravity  
- Era prevents timeline collapse  
- Short summary avoids narrative dominance  

---

## 10. Embeddings & Models

Recommended models:
- `text-embedding-3-large` (API)
- `all-mpnet-base-v2` (local)

Embeddings should be batched and cached.

---

## 11. Validation Before Visualization (Mandatory)

### Qualitative checks
- *Inception* → neighbors include *Interstellar*, *Tenet*, Matrix-like films  
- *The Avengers* → neighbors include MCU movies  
- Crime thrillers cluster across languages  

### Quantitative checks
- Same-genre distance < cross-genre distance  
- Franchise clusters tighter than random sets  

If this fails, **fix the schema**, not UMAP.

---

## 12. Dimensionality Reduction Strategy

Never:
```

High-D → 3D directly

```

Always:
```

Embeddings → PCA (50D) → UMAP (3D, cosine)

```

Typical UMAP parameters:
- `n_neighbors`: 15–30  
- `min_dist`: 0.05–0.15  

---

## 13. Clustering

- Use **HDBSCAN**
- Clusters are soft, not absolute
- Noise points are expected and acceptable

Clusters are used for:
- Coloring
- Visual clarity
- UX guidance (not hard categorization)

---

## 14. Visualization & UX

### Point cloud
- Color → cluster
- Size → popularity
- Opacity → confidence (noise = faint)

### Interactions
- Hover → poster, title, genres, language
- Click → lock camera to neighborhood
- Search → fly camera to movie and highlight neighbors

---

## 15. Movies + TV Shows Strategy

- Single semantic universe
- Same embedding space
- One extra field:
```

media_type: "movie" | "tv"

```

### UI Toggles
- ☑ Movies
- ☑ TV Shows

Default:
- Movies ON
- TV OFF

Turning TV on reveals shows **already embedded nearby**, enabling cross-medium discovery.

---

## 16. Implementation Roadmap

1. Phase A — Filtering & sampling ✅  
2. Phase B — Normalization (genres, keywords, era, runtime)  
3. Phase C — Embedding generation  
4. Phase D — Validation  
5. Phase E — PCA + UMAP (3D coordinates)  
6. Phase F — Clustering (HDBSCAN)  
7. Phase G — Web app (Three.js / React Three Fiber)

---

## 17. Success Criteria

PlotPoint succeeds when:
- Clusters feel intuitive
- Cross-language discoveries happen naturally
- Search leads to exploration, not dead ends
- Users say:

> *“I didn’t expect that to be nearby — but it makes sense.”*


