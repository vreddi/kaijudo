import { theme } from './theme'
import { playerStats, playerProfile } from './mockData'

function StatsOverview(): JSX.Element {
  const total = playerStats.wins + playerStats.losses
  const winPct = Math.round((playerStats.wins / total) * 100)
  const lossPct = 100 - winPct
  const levelProgress = (playerProfile.xp / playerProfile.xpToNext) * 100

  // SVG donut chart values
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const winArc = (winPct / 100) * circumference

  return (
    <div style={{ ...theme.glass, padding: 24, display: 'flex', gap: 32, alignItems: 'center' } as React.CSSProperties}>
      {/* Win/Loss Donut */}
      <div style={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
        <svg width="130" height="130" viewBox="0 0 130 130">
          {/* Background circle */}
          <circle cx="65" cy="65" r={radius} fill="none" stroke={theme.accentRed} strokeWidth="8" opacity="0.3" />
          {/* Win arc */}
          <circle
            cx="65" cy="65" r={radius}
            fill="none"
            stroke={theme.accent}
            strokeWidth="8"
            strokeDasharray={`${winArc} ${circumference - winArc}`}
            strokeDashoffset={circumference * 0.25}
            strokeLinecap="round"
          />
        </svg>
        <div style={styles.donutCenter}>
          <div style={styles.donutLabel}>W/L</div>
        </div>
      </div>

      {/* Stats text */}
      <div style={styles.statsText}>
        <div style={styles.statRow}>
          <span style={{ ...styles.dot, background: theme.accent }} />
          <span style={styles.statLabel}>Wins:</span>
          <span style={styles.statValue}>{winPct}%</span>
          <span style={styles.statCount}>({playerStats.wins})</span>
        </div>
        <div style={styles.statRow}>
          <span style={{ ...styles.dot, background: theme.accentRed }} />
          <span style={styles.statLabel}>Losses:</span>
          <span style={styles.statValue}>{lossPct}%</span>
          <span style={styles.statCount}>({playerStats.losses})</span>
        </div>
        <div style={{ ...styles.separator }} />
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Level:</span>
          <span style={styles.infoValue}>{playerProfile.level}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Win Streak:</span>
          <span style={{ ...styles.infoValue, color: theme.accent }}>{playerStats.winStreak} 🔥</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>This Week:</span>
          <span style={styles.infoValue}>{playerStats.matchesThisWeek} matches</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Played:</span>
          <span style={styles.infoValue}>{playerStats.playedThisWeek}</span>
        </div>
      </div>

      {/* Level Ring */}
      <div style={{ marginLeft: 'auto', position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r="46" fill="none" stroke={theme.border} strokeWidth="6" />
          <circle
            cx="55" cy="55" r="46"
            fill="none"
            stroke={theme.accent}
            strokeWidth="6"
            strokeDasharray={`${(levelProgress / 100) * 2 * Math.PI * 46} ${2 * Math.PI * 46}`}
            strokeDashoffset={2 * Math.PI * 46 * 0.25}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${theme.accent})` }}
          />
        </svg>
        <div style={styles.levelCenter}>
          <div style={styles.levelNum}>{playerProfile.level}</div>
          <div style={styles.levelLabel}>Level</div>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  donutCenter: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: theme.text,
    fontFamily: theme.font,
  },
  statsText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    fontFamily: theme.font,
  },
  statRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textMuted,
    width: 50,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 600,
    color: theme.text,
    width: 40,
  },
  statCount: {
    fontSize: 11,
    color: theme.textDim,
  },
  separator: {
    height: 1,
    background: theme.border,
    margin: '4px 0',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.textMuted,
    width: 90,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: 600,
    color: theme.text,
  },
  levelCenter: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNum: {
    fontSize: 28,
    fontWeight: 800,
    color: theme.text,
    fontFamily: theme.font,
    lineHeight: 1,
  },
  levelLabel: {
    fontSize: 10,
    color: theme.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    marginTop: 2,
    fontFamily: theme.font,
  },
}

export default StatsOverview
