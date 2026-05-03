import { useAuth } from '@clerk/clerk-react'
import AuthScreen from './AuthScreen'
import MenuScreen from './menu/MenuScreen'
import { SettingsProvider } from './contexts/SettingsContext'

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
    <SettingsProvider>
      <MenuScreen />
    </SettingsProvider>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#08091a',
  },
  text: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: 14,
  },
}

export default AuthGate
