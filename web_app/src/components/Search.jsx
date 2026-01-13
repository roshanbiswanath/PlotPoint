import { useState, useMemo } from 'react'

export default function Search({ movies, onSearch }) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const results = useMemo(() => {
    if (!query || query.length < 2) return []
    const q = query.toLowerCase()
    return movies
      .filter(m => m.title.toLowerCase().includes(q))
      .slice(0, 6)
  }, [query, movies])

  const handleSelect = (movie) => {
    onSearch(movie)
    setQuery('')
    setIsFocused(false)
  }

  const showResults = isFocused && results.length > 0

  return (
    <div style={{
      position: 'absolute',
      top: 24,
      right: 24,
      width: 240,
      zIndex: 100
    }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        placeholder="search"
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid rgba(180, 175, 165, 0.2)',
          outline: 'none',
          color: '#b8b8b0',
          padding: '8px 0',
          fontSize: '0.85rem',
          letterSpacing: '0.05em'
        }}
      />
      
      {showResults && (
        <div style={{
          marginTop: 8,
          background: 'rgba(15, 15, 14, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          overflow: 'hidden'
        }}>
          {results.map((movie) => (
            <div
              key={movie.id}
              onClick={() => handleSelect(movie)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(180, 175, 165, 0.08)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(180, 175, 165, 0.08)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <div style={{ 
                fontSize: '0.85rem',
                color: '#c8c8c0'
              }}>{movie.title}</div>
              <div style={{ 
                fontSize: '0.7rem', 
                opacity: 0.5, 
                marginTop: 2,
                color: '#a0a098'
              }}>
                {movie.year}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
