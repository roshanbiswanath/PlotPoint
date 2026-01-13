import { useState, useMemo } from 'react'

export default function SearchBar({ movies, onSearch }) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const results = useMemo(() => {
    if (!query || query.length < 2) return []
    const q = query.toLowerCase()
    return movies
      .filter(m => m.title.toLowerCase().includes(q))
      .slice(0, 8)
  }, [query, movies])

  const handleSelect = (movie) => {
    onSearch(movie)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div style={{
      position: 'absolute',
      top: 20,
      right: 20,
      width: 300,
      zIndex: 100
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: 25,
        border: '1px solid rgba(255,255,255,0.15)',
        overflow: 'hidden'
      }}>
        <span style={{ padding: '12px 0 12px 16px', opacity: 0.6 }}>🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true) }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search movies..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'white',
            padding: '12px',
            fontSize: '0.95rem'
          }}
        />
      </div>
      
      {isOpen && results.length > 0 && (
        <div style={{
          marginTop: 8,
          background: 'rgba(20,20,30,0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden',
          maxHeight: 400,
          overflowY: 'auto'
        }}>
          {results.map((movie) => (
            <div
              key={movie.id}
              onClick={() => handleSelect(movie)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <div style={{ fontWeight: 500 }}>{movie.title}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: 4 }}>
                {movie.year} • {movie.genres?.slice(0, 2).join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
