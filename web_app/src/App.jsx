import { Suspense, useState, useCallback, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Scene from './components/Scene'
import MovieFocus from './components/MovieFocus'
import HoverPanel from './components/HoverPanel'
import Search from './components/Search'

function App() {
  const [movies, setMovies] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [hoveredMovie, setHoveredMovie] = useState(null)
  const [cameraTarget, setCameraTarget] = useState(null)
  const controlsRef = useRef()

  const handleSearch = useCallback((movie) => {
    setSelectedMovie(movie)
    setCameraTarget({ x: movie.x, y: movie.y, z: movie.z })
    // Clear target after camera arrives so user can navigate freely
    setTimeout(() => setCameraTarget(null), 3500)
  }, [])

  const handleSelect = useCallback((movie) => {
    setSelectedMovie(movie)
    if (movie) {
      setCameraTarget({ x: movie.x, y: movie.y, z: movie.z })
      setTimeout(() => setCameraTarget(null), 3500)
    }
  }, [])

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative', 
      background: '#0a0a0a'
    }}>
      <Canvas 
        camera={{ position: [0, 0, 180], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#0a0a0a']} />
        <fog attach="fog" args={['#0a0a0a', 80, 350]} />
        <ambientLight intensity={0.15} />
        
        <Suspense fallback={null}>
          <Scene 
            onMoviesLoaded={setMovies}
            onHover={setHoveredMovie}
            onSelect={handleSelect}
            cameraTarget={cameraTarget}
            selectedMovie={selectedMovie}
            controlsRef={controlsRef}
          />
        </Suspense>
        
        <OrbitControls 
          ref={controlsRef}
          makeDefault 
          minDistance={20} 
          maxDistance={350}
          enableDamping
          dampingFactor={0.03}
          rotateSpeed={0.4}
          zoomSpeed={0.6}
        />
      </Canvas>
      
      {/* Minimal branding */}
      <div style={{
        position: 'absolute',
        top: 28,
        left: 28,
        opacity: 0.6
      }}>
        <div style={{ 
          fontSize: '1.4rem', 
          fontWeight: 600, 
          letterSpacing: '0.08em',
          color: '#c8c8c0'
        }}>
          PlotPoint
        </div>
      </div>
      
      {/* Search - minimal, top right */}
      <Search movies={movies} onSearch={handleSearch} />
      
      {/* Hover panel - left side, always shows when hovering */}
      {hoveredMovie && (
        <HoverPanel movie={hoveredMovie} />
      )}
      
      {/* Selected panel - right side */}
      {selectedMovie && (
        <MovieFocus 
          movie={selectedMovie} 
          onClose={() => setSelectedMovie(null)} 
        />
      )}
    </div>
  )
}

export default App
