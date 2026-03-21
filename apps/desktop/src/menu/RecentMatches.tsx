import { theme } from './theme'
import { recentMatches } from './mockData'

function RecentMatches(): JSX.Element {
  return (
    <div style={{ ...theme.glass, padding: 20 } as React.CSSProperties}>
      <h3 style={styles.title}>Recent Matches</h3>
      <div style={styles.list}>
        {recentMatches.map((match) => (
          <div key={match.id} style={styles.matchRow}>
            <div
              style={{
                ...styles.resultBadge,
                background: match.result === 'win' ? theme.accentGreen : theme.accentRed,
              }}
            >
              {match.result === 'win' ? 'W' : 'L'}
            </div>
            <div style={styles.matchInfo}>
              <div style={styles.opponent}>vs {match.opponent}</div>
              <div style={styles.matchMeta}>
                {match.deckUsed} &middot; {match.turnsPlayed} turns
              </div>
            </div>
            <div style={styles.timeAgo}>{match.timeAgo}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  title: {
    fontSize: 14,
    fontWeight: 600,
    color: theme.text,
    margin: '0 0 14px',
    fontFamily: theme.font,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  matchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 10px',
    borderRadius: 10,
    background: 'rgba(255, 255, 255, 0.02)',
    border: `1px solid ${theme.border}`,
  },
  resultBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
    fontFamily: theme.font,
  },
  matchInfo: {
    flex: 1,
    minWidth: 0,
    fontFamily: theme.font,
  },
  opponent: {
    fontSize: 13,
    fontWeight: 500,
    color: theme.text,
  },
  matchMeta: {
    fontSize: 11,
    color: theme.textMuted,
    marginTop: 2,
  },
  timeAgo: {
    fontSize: 11,
    color: theme.textDim,
    fontFamily: theme.font,
    flexShrink: 0,
  },
}

export default RecentMatches
