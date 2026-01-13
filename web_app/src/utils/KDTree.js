/**
 * K-D Tree implementation for efficient nearest neighbor search in 3D space
 * O(log n) average case for queries vs O(n) brute force
 */

class KDNode {
  constructor(point, data, axis) {
    this.point = point      // [x, y, z]
    this.data = data        // movie object
    this.axis = axis        // 0, 1, or 2 (x, y, z)
    this.left = null
    this.right = null
  }
}

export class KDTree {
  constructor(points) {
    // points = [{ point: [x,y,z], data: movie }, ...]
    this.root = this.buildTree(points, 0)
  }

  buildTree(points, depth) {
    if (points.length === 0) return null
    
    const axis = depth % 3
    
    // Sort by current axis
    points.sort((a, b) => a.point[axis] - b.point[axis])
    
    const mid = Math.floor(points.length / 2)
    const node = new KDNode(points[mid].point, points[mid].data, axis)
    
    node.left = this.buildTree(points.slice(0, mid), depth + 1)
    node.right = this.buildTree(points.slice(mid + 1), depth + 1)
    
    return node
  }

  /**
   * Find k nearest neighbors to target point
   * @param {number[]} target - [x, y, z] coordinates
   * @param {number} k - number of neighbors to find
   * @param {string} excludeId - ID to exclude (the selected movie itself)
   * @returns {Array} - array of { data, distance } sorted by distance
   */
  kNearest(target, k, excludeId = null) {
    const best = []
    
    const distanceSq = (a, b) => {
      const dx = a[0] - b[0]
      const dy = a[1] - b[1]
      const dz = a[2] - b[2]
      return dx * dx + dy * dy + dz * dz
    }

    const search = (node) => {
      if (!node) return

      // Skip if this is the excluded point
      if (excludeId && node.data.id === excludeId) {
        search(node.left)
        search(node.right)
        return
      }

      const dist = distanceSq(target, node.point)
      
      // Add to best if we have room or if closer than worst
      if (best.length < k) {
        best.push({ data: node.data, distance: Math.sqrt(dist), distSq: dist })
        best.sort((a, b) => a.distSq - b.distSq)
      } else if (dist < best[k - 1].distSq) {
        best[k - 1] = { data: node.data, distance: Math.sqrt(dist), distSq: dist }
        best.sort((a, b) => a.distSq - b.distSq)
      }

      // Determine which side to search first
      const axis = node.axis
      const diff = target[axis] - node.point[axis]
      const first = diff < 0 ? node.left : node.right
      const second = diff < 0 ? node.right : node.left

      // Search closer side first
      search(first)

      // Only search other side if it could contain closer points
      const worstDist = best.length < k ? Infinity : best[k - 1].distSq
      if (diff * diff < worstDist) {
        search(second)
      }
    }

    search(this.root)
    
    return best.map(b => ({ data: b.data, distance: b.distance }))
  }
}

/**
 * Build a KDTree from movie data
 * @param {Array} movies - array of movies with x, y, z properties
 * @returns {KDTree}
 */
export function buildMovieTree(movies) {
  const points = movies.map(movie => ({
    point: [movie.x, movie.y, movie.z],
    data: movie
  }))
  return new KDTree(points)
}
