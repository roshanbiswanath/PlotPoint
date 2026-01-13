export default function UI() {
  return (
    <div style={{
      position: 'absolute',
      top: 20,
      left: 20,
      background: 'linear-gradient(135deg, rgba(20,20,40,0.9) 0%, rgba(10,10,30,0.85) 100%)',
      backdropFilter: 'blur(20px)',
      padding: '20px 24px',
      borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.1)',
      maxWidth: 260,
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: '1.5rem' }}>🎬</span>
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.5px' }}>PlotPoint</h1>
      </div>
      <p style={{ 
        margin: '0 0 16px', 
        opacity: 0.6, 
        fontSize: '0.85rem',
        fontStyle: 'italic'
      }}>
        Explore cinema by proximity
      </p>
      <div style={{ 
        fontSize: '0.75rem', 
        opacity: 0.4, 
        lineHeight: 1.8,
        paddingTop: 12,
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <p>🖱️ Drag to rotate</p>
        <p>⚡ Hover to preview</p>
        <p>👆 Click to explore</p>
        <p>🔍 Search to find</p>
      </div>
    </div>
  )
}
