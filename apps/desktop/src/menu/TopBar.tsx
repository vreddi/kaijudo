import { theme } from './theme'
import { playerProfile } from './mockData'

function TopBar(): JSX.Element {
  return (
    <div style={styles.topBar}>
      <div style={styles.left}>
        <span style={styles.label}>Rank</span>
        <span style={styles.value}>{playerProfile.rank}</span>
        <span style={styles.divider}>|</span>
        <span style={styles.label}>Hours</span>
        <span style={styles.value}>{playerProfile.totalHours}H</span>
        <span style={styles.divider}>|</span>
        <span style={styles.label}>XP</span>
        <span style={styles.value}>{playerProfile.xp.toLocaleString()}</span>
      </div>
      <div style={styles.right}>
        <div style={styles.avatar}>
          <img src={playerProfile.avatar} alt="" style={styles.avatarImg} />
        </div>
        <span style={styles.username}>{playerProfile.username}</span>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  topBar: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    borderBottom: `1px solid ${theme.border}`,
    flexShrink: 0,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: theme.font,
  },
  label: {
    fontSize: 11,
    color: theme.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  value: {
    fontSize: 13,
    fontWeight: 600,
    color: theme.accent,
  },
  divider: {
    color: theme.textDim,
    margin: '0 4px',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  username: {
    fontSize: 13,
    fontWeight: 500,
    color: theme.text,
    fontFamily: theme.font,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    overflow: 'hidden',
    border: `2px solid ${theme.accent}`,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
}

export default TopBar
