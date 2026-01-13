const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w300'

export default function MoviePanel({ movie, isSelected, onClose }) {
  if (!movie) return null

  const posterUrl = movie.poster_path 
    ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
    : null

  return (
    <div style={{
      position: 'absolute',
      bottom: 20,
      left: 20,
      width: 340,
      background: 'rgba(10,10,20,0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.1)',
      overflow: 'hidden',
      transform: isSelected ? 'translateY(0)' : 'translateY(10px)',
      opacity: 1,
      transition: 'all 0.3s ease',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
    }}>
      {/* Header with poster */}
      <div style={{ display: 'flex', gap: 16, padding: 16 }}>
        {posterUrl ? (
          <img 
            src={posterUrl} 
            alt={movie.title}
            style={{
              width: 80,
              height: 120,
              objectFit: 'cover',
              borderRadius: 8,
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
            }}
          />
        ) : (
          <div style={{
            width: 80,
            height: 120,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem'
          }}>🎬</div>
        )}
        
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', lineHeight: 1.3 }}>{movie.title}</h3>
          <div style={{ marginTop: 8, fontSize: '0.85rem', opacity: 0.7 }}>
            {movie.year} • {movie.runtime} • {movie.original_language?.toUpperCase()}
          </div>
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {movie.genres?.slice(0, 3).map((genre, i) => (
              <span key={i} style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '4px 10px',
                borderRadius: 12,
                fontSize: '0.75rem'
              }}>{genre}</span>
            ))}
          </div>
        </div>
        
        {isSelected && (
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 28,
              height: 28,
              cursor: 'pointer',
              color: 'white',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >×</button>
        )}
      </div>
      
      {/* Overview */}
      <div style={{ 
        padding: '0 16px 16px',
        fontSize: '0.85rem',
        lineHeight: 1.6,
        opacity: 0.8,
        maxHeight: 100,
        overflow: 'hidden'
      }}>
        {movie.overview}
      </div>
      
      {/* Stats bar */}
      <div style={{
        display: 'flex',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(0,0,0,0.3)'
      }}>
        <div style={{ flex: 1, padding: '12px 16px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: 4 }}>ERA</div>
          <div style={{ fontSize: '0.9rem' }}>{movie.era}</div>
        </div>
        <div style={{ flex: 1, padding: '12px 16px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: 4 }}>POPULARITY</div>
          <div style={{ fontSize: '0.9rem' }}>{movie.popularity?.toFixed(1)}</div>
        </div>
        <div style={{ flex: 1, padding: '12px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: 4 }}>CLUSTER</div>
          <div style={{ fontSize: '0.9rem' }}>{movie.cluster === -1 ? 'Unique' : `#${movie.cluster}`}</div>
        </div>
      </div>
    </div>
  )
}
