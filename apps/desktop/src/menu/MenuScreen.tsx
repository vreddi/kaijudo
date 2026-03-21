import { useState } from 'react'
import { theme } from './theme'
import Sidebar, { type SidebarTab } from './Sidebar'
import TopBar from './TopBar'
import StatsOverview from './StatsOverview'
import MyDecks from './MyDecks'
import FriendsList from './FriendsList'
import RecentMatches from './RecentMatches'
import Goals from './Goals'
import CollectionPage from './CollectionPage'

function MenuScreen(): JSX.Element {
  const [activeTab, setActiveTab] = useState<SidebarTab>('home')

  return (
    <div style={styles.layout}>
      <Sidebar active={activeTab} onNavigate={setActiveTab} />
      <div style={styles.main}>
        <TopBar />
        <div style={styles.content}>
          {activeTab === 'home' && <HomeContent />}
          {activeTab === 'decks' && <PlaceholderPage title="Decks" />}
          {activeTab === 'collection' && <CollectionPage />}
          {activeTab === 'play' && <PlaceholderPage title="Play" />}
          {activeTab === 'friends' && <PlaceholderPage title="Friends" />}
          {activeTab === 'settings' && <PlaceholderPage title="Settings" />}
        </div>
      </div>
    </div>
  )
}

function HomeContent(): JSX.Element {
  return (
    <>
      <StatsOverview />
      <div style={styles.grid}>
        <MyDecks />
        <FriendsList />
      </div>
      <div style={styles.grid}>
        <RecentMatches />
        <Goals />
      </div>
    </>
  )
}

function PlaceholderPage({ title }: { title: string }): JSX.Element {
  return (
    <div style={styles.placeholder}>
      <h2 style={styles.placeholderTitle}>{title}</h2>
      <p style={styles.placeholderText}>Coming soon</p>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  layout: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    background: theme.bg,
    fontFamily: theme.font,
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
  },
  placeholder: {
    ...theme.glass,
    padding: 40,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  } as React.CSSProperties,
  placeholderTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: theme.text,
    margin: 0,
  },
  placeholderText: {
    fontSize: 13,
    color: theme.textMuted,
    marginTop: 8,
  },
}

export default MenuScreen
