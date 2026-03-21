import { useAuth } from '@clerk/clerk-react'
import AuthScreen from './AuthScreen'

function AuthGate(): JSX.Element {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <div style={styles.container}>
        <p style={styles.text}>Loading...</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return <AuthScreen />
  }

  return (
    <div>
      <h1>Kaijudo Desktop</h1>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#0a0a0a',
  },
  text: {
    color: '#707070',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: 14,
  },
}

export default AuthGate
