import { useState } from 'react'
import Disclaimer from './Disclaimer'
import IntroVideo from './IntroVideo'

type Screen = 'disclaimer' | 'intro' | 'menu'

function App(): JSX.Element {
  const [screen, setScreen] = useState<Screen>('disclaimer')

  if (screen === 'disclaimer') {
    return <Disclaimer onAccept={() => setScreen('intro')} />
  }

  if (screen === 'intro') {
    return <IntroVideo onComplete={() => setScreen('menu')} />
  }

  return (
    <div>
      <h1>Kaijudo Desktop</h1>
    </div>
  )
}

export default App
