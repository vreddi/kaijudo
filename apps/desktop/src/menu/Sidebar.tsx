import { theme } from './theme'

export type SidebarTab = 'home' | 'decks' | 'collection' | 'play' | 'friends' | 'settings'

interface SidebarProps {
  active: SidebarTab
  onNavigate: (tab: SidebarTab) => void
}

const tabs: { id: SidebarTab; icon: string; label: string }[] = [
  { id: 'home', icon: '⬡', label: 'Home' },
  { id: 'play', icon: '⚔', label: 'Play' },
  { id: 'decks', icon: '📋', label: 'Decks' },
  { id: 'collection', icon: '🃏', label: 'Collection' },
  { id: 'friends', icon: '👥', label: 'Friends' },
  { id: 'settings', icon: '⚙', label: 'Settings' },
]

function Sidebar({ active, onNavigate }: SidebarProps): JSX.Element {
  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>K</div>
      <div style={styles.nav}>
        {tabs.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              title={tab.label}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              }}
            >
              <span style={{ fontSize: 18 }}>{tab.icon}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 64,
    height: '100vh',
    background: theme.bgSidebar,
    backdropFilter: 'blur(20px)',
    borderRight: `1px solid ${theme.border}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 16,
    gap: 8,
    flexShrink: 0,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: `linear-gradient(135deg, ${theme.accent}, #b8860b)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 800,
    color: '#0a0a0a',
    marginBottom: 16,
    fontFamily: theme.font,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    alignItems: 'center',
  },
  navItem: {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
    color: theme.textMuted,
  },
  navItemActive: {
    background: theme.accentDim,
    color: theme.accent,
  },
}

export default Sidebar
