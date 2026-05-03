import { useEffect, useLayoutEffect, useRef, useState } from 'react'

interface IntroVideoProps {
  onComplete: () => void
}

const SKIP_DELAY_MS = 4000

function IntroVideo({ onComplete }: IntroVideoProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showSkip, setShowSkip] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), SKIP_DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  useLayoutEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = 0.1
    }
  }, [])

  useEffect(() => {
    const handleKey = () => onComplete()
    const handleClick = (e: MouseEvent) => {
      // Don't double-fire if they click the skip button
      if ((e.target as HTMLElement).tagName === 'BUTTON') return
      onComplete()
    }
    window.addEventListener('keydown', handleKey)
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('click', handleClick)
    }
  }, [onComplete])

  return (
    <div style={styles.container}>
      <video
        ref={videoRef}
        src="/video/intro.mp4"
        autoPlay
        onEnded={onComplete}
        style={styles.video}
      />
      {showSkip && (
        <button style={styles.skipButton} onClick={onComplete}>
          Skip Intro
        </button>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    inset: 0,
    backgroundColor: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  skipButton: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 500,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    cursor: 'pointer',
    letterSpacing: '0.5px',
  },
}

export default IntroVideo
