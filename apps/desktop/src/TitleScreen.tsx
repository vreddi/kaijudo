import { useEffect, useState } from 'react'

interface TitleScreenProps {
  onStart: () => void
}

function TitleScreen({ onStart }: TitleScreenProps): JSX.Element {
  const [promptVisible, setPromptVisible] = useState(true)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onStart()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onStart])

  // Pulsing prompt
  useEffect(() => {
    const interval = setInterval(() => {
      setPromptVisible((v) => !v)
    }, 800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={styles.container}>
      {/* Background overlay */}
      <div style={styles.bgOverlay} />

      {/* Creature art — right side, floating */}
      <img
        src="/images/creature.png"
        alt=""
        style={styles.creature}
      />

      {/* Left content */}
      <div style={styles.content}>
        <img
          src="/images/logo.webp"
          alt="Kaijudo"
          style={styles.logo}
        />

        <div
          style={{
            ...styles.prompt,
            opacity: promptVisible ? 1 : 0.3,
          }}
        >
          PRESS ENTER
        </div>
      </div>

      {/* Bottom-left info */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          This is an unofficial, non-commercial fan project.
        </p>
        <p style={styles.footerText}>
          Duel Masters is property of Wizards of the Coast and Shogakukan.
        </p>
        <p style={styles.footerMuted}>v0.0.0 &middot; &copy; 2026 Kaijudo Project</p>
      </div>
    </div>
  )
}

const float = `
@keyframes creatureFloat {
  0%, 100% { transform: translateY(-50%); }
  50% { transform: translateY(calc(-50% - 18px)); }
}
`

// Inject keyframes
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = float
  document.head.appendChild(style)
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    inset: 0,
    backgroundColor: '#050510',
    background: 'radial-gradient(ellipse at 30% 50%, #0c0c2a 0%, #050510 70%)',
    overflow: 'hidden',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  bgOverlay: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(135deg, rgba(20, 10, 60, 0.4) 0%, transparent 50%, rgba(10, 10, 40, 0.3) 100%)',
    pointerEvents: 'none',
  },
  creature: {
    position: 'absolute',
    right: '5%',
    top: '50%',
    // Center the image on the vertical axis. The float animation overrides
    // this while running, but keeping it here guarantees the image stays
    // centered on the first frame and when animations are disabled
    // (e.g. reduced-motion) instead of dropping down with its top edge at 50%.
    transform: 'translateY(-50%)',
    height: '75%',
    maxWidth: '50%',
    objectFit: 'contain',
    opacity: 0.95,
    filter: 'drop-shadow(0 0 40px rgba(100, 140, 255, 0.3))',
    animation: 'creatureFloat 4s ease-in-out infinite',
    pointerEvents: 'none',
  },
  content: {
    position: 'absolute',
    left: 60,
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 40,
    zIndex: 2,
  },
  logo: {
    width: 320,
    maxWidth: '40vw',
    objectFit: 'contain',
    filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.6))',
  },
  prompt: {
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: '4px',
    color: '#ffffff',
    textTransform: 'uppercase' as const,
    transition: 'opacity 0.4s ease',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 28,
    zIndex: 2,
  },
  footerText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.3)',
    margin: '0 0 2px',
    lineHeight: 1.5,
  },
  footerMuted: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.2)',
    margin: '4px 0 0',
  },
}

export default TitleScreen
