import json
from collections import Counter

with open('data_pipeline/data/output/plotpoint_data_3d.json') as f:
    data = json.load(f)

clusters = [d['cluster'] for d in data]
counts = Counter(clusters)

print(f'Total movies: {len(data)}')
print('\nCluster distribution:')
for c, count in sorted(counts.items()):
    pct = count/len(data)*100
    if c == -1:
        print(f'  Noise (cluster -1): {count} movies ({pct:.1f}%)')
    else:
        print(f'  Cluster {c}: {count} movies ({pct:.1f}%)')

noise_count = counts.get(-1, 0)
clustered_count = len(data) - noise_count
print(f'\nClustered: {clustered_count} ({clustered_count/len(data)*100:.1f}%)')
print(f'Noise: {noise_count} ({noise_count/len(data)*100:.1f}%)')
