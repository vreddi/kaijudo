import { useEffect, useRef, useState } from 'react'
import { Howl } from 'howler'
import { useOptionalSettings } from './contexts/SettingsContext'

interface Song {
  id: string
  file: string
  title: string
  artist: string
  cover: string
}

const TOAST_DELAY_MS = 2000
const TOAST_DURATION_MS = 4000

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function MusicPlayer(): JSX.Element | null {
  const settingsCtx = useOptionalSettings()
  const musicVolume = settingsCtx?.settings.musicVolume ?? 0.5
  const musicEnabled = settingsCtx?.settings.musicEnabled ?? true

  const howlRef = useRef<Howl | null>(null)
  const queueRef = useRef<Song[]>([])
  const playlistRef = useRef<Song[]>([])
  const [current, setCurrent] = useState<Song | null>(null)
  const [toast, setToast] = useState<Song | null>(null)
  const [toastVisible, setToastVisible] = useState(false)

  const playSong = (song: Song) => {
    if (howlRef.current) {
      howlRef.current.unload()
    }

    const howl = new Howl({
      src: [song.file],
      html5: true,
      volume: musicVolume,
      onend: () => {
        let next = queueRef.current.slice(1)
        if (next.length === 0) {
          next = shuffle(playlistRef.current)
        }
        queueRef.current = next
        setCurrent(next[0])
      },
    })

    howlRef.current = howl
    howl.play()
  }

  // Load playlist on mount
  useEffect(() => {
    fetch('/music/playlist.json')
      .then((r) => r.json())
      .then((songs: Song[]) => {
        playlistRef.current = songs
        const shuffled = shuffle(songs)
        queueRef.current = shuffled
        setCurrent(shuffled[0])
      })
      .catch(() => {})

    return () => {
      if (howlRef.current) {
        howlRef.current.unload()
      }
    }
  }, [])

  // Play when current song changes
  useEffect(() => {
    if (!current) return
    playSong(current)
  }, [current])

  // Show toast when current song changes
  useEffect(() => {
    if (!current) return

    const delayTimer = setTimeout(() => {
      setToast(current)
      setToastVisible(true)
    }, TOAST_DELAY_MS)

    const hideTimer = setTimeout(() => {
      setToastVisible(false)
    }, TOAST_DELAY_MS + TOAST_DURATION_MS)

    return () => {
      clearTimeout(delayTimer)
      clearTimeout(hideTimer)
    }
  }, [current])

  // Sync volume from settings
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(musicVolume)
    }
  }, [musicVolume])

  // Pause/resume based on musicEnabled
  useEffect(() => {
    if (!howlRef.current) return
    if (musicEnabled) {
      if (!howlRef.current.playing()) {
        howlRef.current.play()
      }
    } else {
      howlRef.current.pause()
    }
  }, [musicEnabled])

  if (!toast) return null

  return (
    <div
      style={{
        ...styles.toast,
        opacity: toastVisible ? 1 : 0,
        transform: toastVisible ? 'translateY(0)' : 'translateY(12px)',
      }}
    >
      <img src={toast.cover} alt="" style={styles.cover} />
      <div style={styles.info}>
        <div style={styles.nowPlaying}>NOW PLAYING</div>
        <div style={styles.title}>{toast.title}</div>
        <div style={styles.artist}>{toast.artist}</div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  toast: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '12px 18px 12px 12px',
    background: 'rgba(30, 30, 30, 0.55)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    zIndex: 9999,
    pointerEvents: 'none',
    transition: 'opacity 0.5s ease, transform 0.5s ease',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  cover: {
    width: 48,
    height: 48,
    borderRadius: 8,
    objectFit: 'cover',
    flexShrink: 0,
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minWidth: 0,
  },
  nowPlaying: {
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: '1.2px',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase' as const,
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: '#ffffff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  artist: {
    fontSize: 12,
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.55)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}

export default MusicPlayer
