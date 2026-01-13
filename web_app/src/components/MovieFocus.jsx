import { useState } from 'react'

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w300'

export default function MovieFocus({ movie, onClose }) {
  const [expanded, setExpanded] = useState(false)
  
  if (!movie) return null

  const posterUrl = movie.poster_path 
    ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
    : null

  return (
    <div 
      style={{
        position: 'absolute',
        bottom: 32,
        right: 32,
        width: expanded ? 400 : 320,
        maxHeight: expanded ? '80vh' : 'auto',
        overflowY: expanded ? 'auto' : 'visible',
        background: 'rgba(15, 15, 14, 0.92)',
        backdropFilter: 'blur(12px)',
        borderRadius: 6,
        padding: 20,
        transition: 'width 0.3s ease'
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'transparent',
          border: 'none',
          color: '#707068',
          fontSize: '1.2rem',
          cursor: 'pointer',
          padding: 4,
          lineHeight: 1,
          transition: 'color 0.2s'
        }}
        onMouseOver={(e) => e.target.style.color = '#a0a098'}
        onMouseOut={(e) => e.target.style.color = '#707068'}
      >
        ✕
      </button>

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
              width: expanded ? 140 : 100,
              height: 'auto',
              borderRadius: 4,
              opacity: 0.95,
              transition: 'width 0.3s ease'
            }}
          />
        )}
        
        <div style={{ flex: 1, paddingRight: 20 }}>
          <div style={{ 
            fontSize: expanded ? '1.4rem' : '1.2rem', 
            fontWeight: 500,
            color: '#f0f0e8',
            marginBottom: 8,
            lineHeight: 1.3,
            transition: 'font-size 0.3s ease'
          }}>
            {movie.title}
          </div>
          <div style={{ 
            fontSize: '0.9rem', 
            color: '#a0a098',
            marginBottom: 10
          }}>
            {movie.year} · {movie.genres?.slice(0, expanded ? 5 : 2).join(', ')}
          </div>
          {!expanded && movie.overview && (
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
      
      {/* Expanded content */}
      {expanded && (
        <div style={{ marginTop: 16 }}>
          {movie.overview && (
            <div style={{ 
              fontSize: '0.85rem', 
              color: '#a0a098',
              lineHeight: 1.7,
              marginBottom: 16
            }}>
              {movie.overview}
            </div>
          )}
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px 20px',
            fontSize: '0.8rem',
            color: '#808078'
          }}>
            {movie.runtime && (
              <div>
                <span style={{ color: '#606058' }}>Runtime</span>
                <div style={{ color: '#a0a098' }}>{movie.runtime}</div>
              </div>
            )}
            {movie.original_language && (
              <div>
                <span style={{ color: '#606058' }}>Language</span>
                <div style={{ color: '#a0a098' }}>{movie.original_language.toUpperCase()}</div>
              </div>
            )}
            {movie.vote_average && (
              <div>
                <span style={{ color: '#606058' }}>Rating</span>
                <div style={{ color: '#a0a098' }}>{movie.vote_average.toFixed(1)} / 10</div>
              </div>
            )}
            {movie.popularity && (
              <div>
                <span style={{ color: '#606058' }}>Popularity</span>
                <div style={{ color: '#a0a098' }}>{Math.round(movie.popularity)}</div>
              </div>
            )}
            {movie.era && (
              <div>
                <span style={{ color: '#606058' }}>Era</span>
                <div style={{ color: '#a0a098' }}>{movie.era}</div>
              </div>
            )}
            {movie.cluster_label && (
              <div>
                <span style={{ color: '#606058' }}>Cluster</span>
                <div style={{ color: '#a0a098' }}>{movie.cluster_label}</div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Footer with runtime (collapsed) or Read less button */}
      <div style={{
        marginTop: 12,
        paddingTop: 12,
        borderTop: '1px solid rgba(100, 100, 90, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {!expanded && movie.runtime && (
          <div style={{
            fontSize: '0.75rem',
            color: '#606058'
          }}>
            {movie.runtime} · {movie.original_language?.toUpperCase()}
          </div>
        )}
        {expanded && <div />}
        
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'transparent',
            border: '1px solid rgba(160, 160, 152, 0.25)',
            color: '#a0a098',
            padding: '6px 12px',
            borderRadius: 4,
            fontSize: '0.75rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.borderColor = 'rgba(160, 160, 152, 0.5)'
            e.target.style.color = '#d0d0c8'
          }}
          onMouseOut={(e) => {
            e.target.style.borderColor = 'rgba(160, 160, 152, 0.25)'
            e.target.style.color = '#a0a098'
          }}
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      </div>
    </div>
  )
}
