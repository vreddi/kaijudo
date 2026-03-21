import { useState } from 'react'
import Disclaimer from './Disclaimer'
import IntroVideo from './IntroVideo'
import TitleScreen from './TitleScreen'
import AuthGate from './AuthGate'
import MusicPlayer from './MusicPlayer'

type Screen = 'disclaimer' | 'intro' | 'title' | 'game'

function App(): JSX.Element {
  const [screen, setScreen] = useState<Screen>('disclaimer')
  const showMusic = screen === 'title' || screen === 'game'

  const goTo = (next: Screen) => {
    setScreen(next)
  }

  return (
    <>
      {screen === 'disclaimer' && (
        <Disclaimer onAccept={() => goTo('intro')} />
      )}
      {screen === 'intro' && (
        <IntroVideo onComplete={() => goTo('title')} />
      )}
      {screen === 'title' && (
        <TitleScreen onStart={() => goTo('game')} />
      )}
      {screen === 'game' && <AuthGate />}
      {showMusic && <MusicPlayer />}
    </>
  )
}

export default App
