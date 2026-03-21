import { theme } from './theme'
import { friends } from './mockData'

function FriendsList(): JSX.Element {
  const sortedFriends = [...friends].sort((a, b) => {
    if (a.online !== b.online) return a.online ? -1 : 1
    return 0
  })

  return (
    <div style={{ ...theme.glass, padding: 20 } as React.CSSProperties}>
      <div style={styles.header}>
        <h3 style={styles.title}>Friends in Game</h3>
        <span style={styles.onlineCount}>
          {friends.filter((f) => f.online).length} online
        </span>
      </div>
      <div style={styles.list}>
        {sortedFriends.map((friend) => (
          <div key={friend.id} style={styles.friendRow}>
            <div style={styles.friendLeft}>
              <div style={styles.avatarWrap}>
                <div style={styles.avatarPlaceholder}>
                  {friend.username[0]}
                </div>
                <div
                  style={{
                    ...styles.statusDot,
                    background: friend.online ? theme.accentGreen : '#555',
                  }}
                />
              </div>
              <div style={styles.friendInfo}>
                <div style={styles.friendName}>{friend.username}</div>
                <div style={styles.friendMeta}>
                  Lv.{friend.level} {friend.inGame ? '· In Game' : ''}
                </div>
              </div>
            </div>
            {friend.online && (
              <button
                style={{
                  ...styles.inviteBtn,
                  ...(friend.inGame ? styles.inviteBtnDisabled : {}),
                }}
              >
                {friend.inGame ? 'In Game' : 'Invite'}
              </button>
            )}
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
  onlineCount: {
    fontSize: 11,
    color: theme.accentGreen,
    fontFamily: theme.font,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  friendRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 10px',
    borderRadius: 10,
    background: 'rgba(255, 255, 255, 0.02)',
    border: `1px solid ${theme.border}`,
  },
  friendLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  avatarWrap: {
    position: 'relative',
    width: 32,
    height: 32,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: theme.textMuted,
    fontFamily: theme.font,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: '50%',
    border: '2px solid #10122a',
  },
  friendInfo: {
    fontFamily: theme.font,
  },
  friendName: {
    fontSize: 13,
    fontWeight: 500,
    color: theme.text,
  },
  friendMeta: {
    fontSize: 10,
    color: theme.textMuted,
    marginTop: 1,
  },
  inviteBtn: {
    padding: '5px 14px',
    fontSize: 11,
    fontWeight: 600,
    color: '#0a0a0a',
    background: theme.accent,
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontFamily: theme.font,
    letterSpacing: '0.3px',
  },
  inviteBtnDisabled: {
    background: 'rgba(255, 255, 255, 0.08)',
    color: theme.textMuted,
    cursor: 'default',
  },
}

export default FriendsList
