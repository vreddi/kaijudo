import { SignIn } from '@clerk/clerk-react'

function AuthScreen(): JSX.Element {
  return (
    <div style={styles.container}>
      <SignIn
        routing="virtual"
        appearance={{
          variables: {
            colorPrimary: '#e0e0e0',
            colorBackground: '#141414',
            colorText: '#e0e0e0',
            colorTextSecondary: '#b0b0b0',
            colorInputBackground: '#1a1a1a',
            colorInputText: '#e0e0e0',
            borderRadius: '8px',
          },
        }}
      />
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
}

export default AuthScreen
