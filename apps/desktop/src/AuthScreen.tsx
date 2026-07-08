import { SignIn } from '@clerk/clerk-react'

function AuthScreen(): JSX.Element {
  return (
    <div style={styles.container}>
      <SignIn
        routing="virtual"
        appearance={{
          variables: {
            // Bright blue accent (matches the title screen glow) so primary
            // buttons and links stand out against the dark card.
            colorPrimary: '#6c8cff',
            // Card background lifted above the near-black page so the panel
            // reads as a distinct surface instead of blending in.
            colorBackground: '#16172a',
            colorText: '#f2f3f8',
            colorTextSecondary: '#a3a8c8',
            colorTextOnPrimaryBackground: '#ffffff',
            colorInputBackground: '#0f1020',
            colorInputText: '#f2f3f8',
            colorNeutral: '#ffffff',
            borderRadius: '10px',
          },
          elements: {
            // Give the card a visible edge + shadow so it separates from the
            // black backdrop.
            card: {
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 24px 70px rgba(0, 0, 0, 0.55)',
            },
            headerTitle: { color: '#ffffff' },
            headerSubtitle: { color: '#a3a8c8' },
            // Social / alternate-method buttons default to near-invisible on
            // dark; give them a legible border and text.
            socialButtonsBlockButton: {
              border: '1px solid rgba(255, 255, 255, 0.16)',
              color: '#f2f3f8',
            },
            socialButtonsBlockButtonText: { color: '#f2f3f8' },
            dividerLine: { backgroundColor: 'rgba(255, 255, 255, 0.14)' },
            dividerText: { color: '#a3a8c8' },
            formFieldLabel: { color: '#d3d7ec' },
            formFieldInput: { border: '1px solid rgba(255, 255, 255, 0.16)' },
            formButtonPrimary: { color: '#ffffff' },
            footerActionText: { color: '#a3a8c8' },
            footerActionLink: { color: '#8aa2ff' },
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
