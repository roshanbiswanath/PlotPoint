const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w300'

export default function HoverPanel({ movie }) {
  if (!movie) return null

  const posterUrl = movie.poster_path 
    ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
    : null

  return (
    <div 
      style={{
        position: 'absolute',
        bottom: 32,
        left: 32,
        width: 320,
        background: 'rgba(15, 15, 14, 0.85)',
        backdropFilter: 'blur(12px)',
        borderRadius: 6,
        padding: 20,
        pointerEvents: 'none'
      }}
    >
      <div style={{
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start'
      }}>
        {posterUrl && (
          <img 
            src={posterUrl} 
            alt=""
            style={{
              width: 100,
              height: 'auto',
              borderRadius: 4,
              opacity: 0.95
            }}
          />
        )}
        
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: '1.2rem', 
            fontWeight: 500,
            color: '#f0f0e8',
            marginBottom: 8,
            lineHeight: 1.3
          }}>
            {movie.title}
          </div>
          <div style={{ 
            fontSize: '0.9rem', 
            color: '#a0a098',
            marginBottom: 10
          }}>
            {movie.year} · {movie.genres?.slice(0, 2).join(', ')}
          </div>
          {movie.overview && (
            <div style={{ 
              fontSize: '0.8rem', 
              color: '#808078',
              lineHeight: 1.5
            }}>
              {movie.overview.slice(0, 120)}{movie.overview.length > 120 ? '...' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
