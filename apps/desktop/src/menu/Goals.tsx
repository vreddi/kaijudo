import { theme } from './theme'
import { goals } from './mockData'

function Goals(): JSX.Element {
  return (
    <div style={{ ...theme.glass, padding: 20 } as React.CSSProperties}>
      <h3 style={styles.title}>Current Goals</h3>
      <div style={styles.list}>
        {goals.map((goal) => {
          const pct = Math.round((goal.current / goal.target) * 100)
          return (
            <div key={goal.id} style={styles.goalRow}>
              <div style={styles.goalLeft}>
                <span style={styles.icon}>{goal.icon}</span>
                <span style={styles.goalTitle}>{goal.title}</span>
              </div>
              <div style={styles.goalRight}>
                <span style={styles.progress}>
                  {goal.current}<span style={styles.progressTotal}>/{goal.target}</span>
                </span>
              </div>
              <div style={styles.barTrack}>
                <div
                  style={{
                    ...styles.barFill,
                    width: `${pct}%`,
                    background: pct >= 100
                      ? theme.accentGreen
                      : `linear-gradient(90deg, ${theme.accent}, #b8860b)`,
                  }}
                />
              </div>
            </div>
          )
        })}
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
    gap: 12,
  },
  goalRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  goalLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  icon: {
    fontSize: 14,
    flexShrink: 0,
  },
  goalTitle: {
    fontSize: 12,
    color: theme.text,
    fontFamily: theme.font,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  goalRight: {
    flexShrink: 0,
    fontFamily: theme.font,
  },
  progress: {
    fontSize: 13,
    fontWeight: 600,
    color: theme.text,
  },
  progressTotal: {
    color: theme.textMuted,
    fontWeight: 400,
  },
  barTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    background: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
}

export default Goals
