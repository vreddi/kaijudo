interface DisclaimerProps {
  onAccept: () => void
}

function Disclaimer({ onAccept }: DisclaimerProps): JSX.Element {
  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.icon}>&#9888;</div>
        <h1 style={styles.title}>Fan Project Disclaimer</h1>
        <div style={styles.body}>
          <p>
            This is an <strong>unofficial, non-commercial fan project</strong> created
            out of love for the Duel Masters trading card game.
          </p>
          <p>
            Duel Masters and all related names, characters, artwork, and trademarks are
            the property of <strong>Wizards of the Coast</strong> and{' '}
            <strong>Shogakukan</strong>. We do not own, claim ownership of, or have any
            affiliation with these intellectual properties.
          </p>
          <p>
            This project is not intended for profit. No revenue is generated, and no
            commercial use is made of any copyrighted material. All rights belong to
            their respective owners.
          </p>
          <p style={styles.muted}>
            If you are a rights holder and have concerns about this project, please
            contact us and we will promptly address them.
          </p>
        </div>
        <button style={styles.button} onClick={onAccept}>
          I Understand
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#0a0a0a',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: '#e0e0e0',
  },
  card: {
    maxWidth: 520,
    padding: '40px 36px 32px',
    backgroundColor: '#141414',
    border: '1px solid #2a2a2a',
    borderRadius: 12,
    textAlign: 'center' as const,
  },
  icon: {
    fontSize: 40,
    marginBottom: 8,
    color: '#d4a017',
  },
  title: {
    fontSize: 20,
    fontWeight: 600,
    margin: '0 0 20px',
    color: '#ffffff',
  },
  body: {
    fontSize: 13,
    lineHeight: 1.7,
    textAlign: 'left' as const,
    color: '#b0b0b0',
    marginBottom: 24,
  },
  muted: {
    fontSize: 12,
    color: '#707070',
    fontStyle: 'italic',
    marginBottom: 0,
  },
  button: {
    padding: '10px 32px',
    fontSize: 14,
    fontWeight: 500,
    color: '#0a0a0a',
    backgroundColor: '#e0e0e0',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
}

export default Disclaimer
