import { theme } from './theme'
import { myDecks } from './mockData'

function MyDecks(): JSX.Element {
  return (
    <div style={{ ...theme.glass, padding: 20 } as React.CSSProperties}>
      <div style={styles.header}>
        <h3 style={styles.title}>My Decks</h3>
        <span style={styles.count}>{myDecks.length}</span>
      </div>
      <div style={styles.list}>
        {myDecks.map((deck) => (
          <div key={deck.id} style={styles.deckCard}>
            <div style={{ ...styles.civBar, background: deck.color }} />
            <div style={styles.deckInfo}>
              <div style={styles.deckName}>{deck.name}</div>
              <div style={styles.deckMeta}>
                {deck.civilization} &middot; {deck.cardCount} cards
              </div>
            </div>
            <div style={styles.winRate}>
              <span style={{ ...styles.winRateNum, color: deck.winRate >= 60 ? theme.accentGreen : theme.text }}>
                {deck.winRate}%
              </span>
              <span style={styles.winRateLabel}>win rate</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 14,
    fontWeight: 600,
    color: theme.text,
    margin: 0,
    fontFamily: theme.font,
  },
  count: {
    fontSize: 11,
    color: theme.textMuted,
    background: theme.border,
    padding: '2px 8px',
    borderRadius: 8,
    fontFamily: theme.font,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  deckCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    border: `1px solid ${theme.border}`,
  },
  civBar: {
    width: 4,
    height: 32,
    borderRadius: 2,
    flexShrink: 0,
  },
  deckInfo: {
    flex: 1,
    minWidth: 0,
    fontFamily: theme.font,
  },
  deckName: {
    fontSize: 13,
    fontWeight: 600,
    color: theme.text,
  },
  deckMeta: {
    fontSize: 11,
    color: theme.textMuted,
    marginTop: 2,
  },
  winRate: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    fontFamily: theme.font,
  },
  winRateNum: {
    fontSize: 15,
    fontWeight: 700,
  },
  winRateLabel: {
    fontSize: 9,
    color: theme.textDim,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
}

export default MyDecks
