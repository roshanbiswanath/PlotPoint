import { useEffect, useMemo, useState, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { buildMovieTree } from '../utils/KDTree'

// Muted color based on movie properties
function getPointColor(movie) {
  const color = new THREE.Color('#8a8578')
  const eraShift = {
    'Classic': -0.08,
    'Golden': -0.04,
    'New Hollywood': 0,
    'Blockbuster': 0.02,
    'Modern': 0.04,
    'Contemporary': 0.06
  }
  const shift = eraShift[movie.era] || 0
  color.offsetHSL(0, 0, shift)
  const confidence = movie.cluster_confidence || 0.5
  color.multiplyScalar(0.5 + confidence * 0.5)
  return color
}

export default function Scene({ onMoviesLoaded, onHover, onSelect, cameraTarget, selectedMovie, controlsRef }) {
  const [data, setData] = useState([])
  const [hoveredId, setHoveredId] = useState(null)
  const { camera } = useThree()
  
  // Load data
  useEffect(() => {
    fetch('/plotpoint_data_3d.json')
      .then(res => res.json())
      .then(movies => {
        setData(movies)
        onMoviesLoaded?.(movies)
      })
      .catch(err => console.error("Failed to load data", err))
  }, [onMoviesLoaded])

  // Smooth camera movement
  useFrame(() => {
    if (cameraTarget) {
      const target = new THREE.Vector3(cameraTarget.x, cameraTarget.y, cameraTarget.z)
      const offset = new THREE.Vector3(20, 15, 20)
      const destination = target.clone().add(offset)
      camera.position.lerp(destination, 0.05)
      
      // Also update OrbitControls target so it looks at the movie
      if (controlsRef?.current) {
        controlsRef.current.target.lerp(target, 0.05)
        controlsRef.current.update()
      }
    }
  })

  const handlePointerOver = (e, movie) => {
    e.stopPropagation()
    setHoveredId(movie.id)
    onHover?.(movie)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = (e) => {
    e.stopPropagation()
    setHoveredId(null)
    onHover?.(null)
    document.body.style.cursor = 'default'
  }

  const handleClick = (e, movie) => {
    e.stopPropagation()
    onSelect?.(movie)
  }

  // Build spatial index once when data loads
  const kdTree = useMemo(() => {
    if (data.length === 0) return null
    console.log('Building KD-Tree for', data.length, 'movies')
    return buildMovieTree(data)
  }, [data])

  // Find nearest 5 neighbors using KD-Tree (O(log n) instead of O(n))
  const nearestNeighbors = useMemo(() => {
    if (!selectedMovie || !kdTree) return []
    
    const results = kdTree.kNearest(
      [selectedMovie.x, selectedMovie.y, selectedMovie.z],
      5,
      selectedMovie.id
    )
    
    return results.map(r => r.data)
  }, [selectedMovie, kdTree])

  const neighborIds = useMemo(() => new Set(nearestNeighbors.map(m => m.id)), [nearestNeighbors])

  const hoveredMovie = data.find(m => m.id === hoveredId)

  return (
    <group>
      {/* Movie spheres */}
      {data.map((movie) => {
        const isHovered = movie.id === hoveredId
        const isSelected = selectedMovie?.id === movie.id
        const isNeighbor = neighborIds.has(movie.id)
        const color = isSelected ? '#a855f7' : isNeighbor ? '#60a5fa' : isHovered ? '#facc15' : getPointColor(movie)
        const popLog = Math.log10(Math.max(movie.popularity, 1) + 1)
        const baseSize = 0.25 + popLog * 0.15
        const size = isSelected ? baseSize * 1.4 : isNeighbor ? baseSize * 1.3 : isHovered ? baseSize * 1.25 : baseSize
        
        return (
          <mesh
            key={movie.id}
            position={[movie.x, movie.y, movie.z]}
            onPointerOver={(e) => handlePointerOver(e, movie)}
            onPointerOut={(e) => handlePointerOut(e)}
            onClick={(e) => handleClick(e, movie)}
            renderOrder={isSelected ? 1000 : isNeighbor ? 999 : 0}
          >
            <sphereGeometry args={[size, 12, 12]} />
            <meshBasicMaterial color={color} transparent opacity={isHovered || isSelected || isNeighbor ? 1 : 0.8} depthTest={!(isSelected || isNeighbor)} />
          </mesh>
        )
      })}
      
      {/* Connection lines to nearest neighbors */}
      {selectedMovie && nearestNeighbors.map((neighbor, i) => (
        <Line
          key={`line-${neighbor.id}`}
          points={[
            [selectedMovie.x, selectedMovie.y, selectedMovie.z],
            [neighbor.x, neighbor.y, neighbor.z]
          ]}
          color="#60a5fa"
          lineWidth={1.5}
          opacity={0.4 - i * 0.05}
          transparent
        />
      ))}
      
      {/* Hover label */}
      {hoveredMovie && (
        <Html
          position={[hoveredMovie.x, hoveredMovie.y + 1.5, hoveredMovie.z]}
          center
          style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
        >
          <div style={{
            background: 'rgba(10, 10, 10, 0.85)',
            padding: '6px 10px',
            borderRadius: 3,
            fontSize: '0.75rem',
            color: '#d0d0c8',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(180, 175, 165, 0.1)'
          }}>
            {hoveredMovie.title}
            <span style={{ marginLeft: 8, opacity: 0.5, fontSize: '0.7rem' }}>
              {hoveredMovie.year}
            </span>
          </div>
        </Html>
      )}
      
      {/* Selected label */}
      {selectedMovie && selectedMovie.id !== hoveredId && (
        <Html
          position={[selectedMovie.x, selectedMovie.y + 1.5, selectedMovie.z]}
          center
          style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
        >
          <div style={{
            background: 'rgba(10, 10, 10, 0.9)',
            padding: '8px 14px',
            borderRadius: 3,
            fontSize: '0.85rem',
            color: '#e0e0d8',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(180, 175, 165, 0.15)'
          }}>
            {selectedMovie.title}
            <span style={{ marginLeft: 10, opacity: 0.5 }}>{selectedMovie.year}</span>
          </div>
        </Html>
      )}
    </group>
  )
}
