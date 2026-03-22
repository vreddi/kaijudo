import { useState } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { theme } from './theme'
import { useSettingsContext } from '../contexts/SettingsContext'
import type { UserSettings } from '../hooks/useSettings'

function SettingsPage(): JSX.Element {
  const { settings, updateSetting, isLoading } = useSettingsContext()
  const { user } = useUser()
  const clerk = useClerk()
  const [saved, setSaved] = useState(false)

  const showSaved = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleUpdate = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    updateSetting(key, value)
    showSaved()
  }

  if (isLoading) {
    return (
      <div style={styles.container}>
        <p style={{ color: theme.textMuted, fontSize: 14 }}>Loading settings...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.pageTitle}>Settings</h2>
        <span
          style={{
            ...styles.savedBadge,
            opacity: saved ? 1 : 0,
            transform: saved ? 'translateY(0)' : 'translateY(-4px)',
          }}
        >
          Saved
        </span>
      </div>

      <Section title="Audio">
        <SliderRow
          label="Music Volume"
          value={settings.musicVolume}
          onChange={(v) => handleUpdate('musicVolume', v)}
        />
        <SliderRow
          label="Sound Effects"
          value={settings.sfxVolume}
          onChange={(v) => handleUpdate('sfxVolume', v)}
        />
        <ToggleRow
          label="Music Enabled"
          value={settings.musicEnabled}
          onChange={(v) => handleUpdate('musicEnabled', v)}
        />
      </Section>

      <Section title="Display">
        <SelectRow
          label="Animation Speed"
          value={settings.animationSpeed}
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'fast', label: 'Fast' },
            { value: 'off', label: 'Off' },
          ]}
          onChange={(v) => handleUpdate('animationSpeed', v as UserSettings['animationSpeed'])}
        />
        <SelectRow
          label="Card Art Quality"
          value={settings.cardArtQuality}
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
          onChange={(v) => handleUpdate('cardArtQuality', v as UserSettings['cardArtQuality'])}
        />
        <ToggleRow
          label="Reduced Motion"
          value={settings.reducedMotion}
          onChange={(v) => handleUpdate('reducedMotion', v)}
        />
      </Section>

      <Section title="Gameplay">
        <ToggleRow
          label="Auto-pass Priority"
          value={settings.autoPassPriority}
          onChange={(v) => handleUpdate('autoPassPriority', v)}
        />
        <ToggleRow
          label="Confirm Before Attacking"
          value={settings.confirmBeforeAttacking}
          onChange={(v) => handleUpdate('confirmBeforeAttacking', v)}
        />
        <ToggleRow
          label="Show Card Tooltips"
          value={settings.showCardTooltips}
          onChange={(v) => handleUpdate('showCardTooltips', v)}
        />
      </Section>

      <Section title="Account">
        {user && (
          <div style={styles.accountRow}>
            <img
              src={user.imageUrl}
              alt=""
              style={styles.avatar}
            />
            <div>
              <div style={styles.userName}>
                {user.fullName ?? user.primaryEmailAddress?.emailAddress ?? 'User'}
              </div>
              <div style={styles.userEmail}>
                {user.primaryEmailAddress?.emailAddress}
              </div>
            </div>
          </div>
        )}
        <button
          style={styles.signOutBtn}
          onClick={() => clerk.signOut()}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(230, 57, 70, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(230, 57, 70, 0.15)'
          }}
        >
          Sign Out
        </button>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }): JSX.Element {
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      <div style={styles.sectionContent}>{children}</div>
    </div>
  )
}

function SliderRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}): JSX.Element {
  return (
    <div style={styles.row}>
      <span style={styles.label}>{label}</span>
      <div style={styles.sliderGroup}>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={styles.slider}
        />
        <span style={styles.sliderValue}>{Math.round(value * 100)}%</span>
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}): JSX.Element {
  return (
    <div style={styles.row}>
      <span style={styles.label}>{label}</span>
      <div
        onClick={() => onChange(!value)}
        style={{
          ...styles.toggle,
          background: value ? theme.accent : 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <div
          style={{
            ...styles.toggleKnob,
            transform: value ? 'translateX(18px)' : 'translateX(0)',
          }}
        />
      </div>
    </div>
  )
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}): JSX.Element {
  return (
    <div style={styles.row}>
      <span style={styles.label}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.select}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    maxWidth: 640,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: theme.text,
    margin: 0,
  },
  savedBadge: {
    fontSize: 11,
    fontWeight: 600,
    color: theme.accentGreen,
    transition: 'opacity 0.3s ease, transform 0.3s ease',
  },
  section: {
    ...theme.glass,
    padding: 20,
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: theme.accent,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    margin: '0 0 16px 0',
  },
  sectionContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: theme.text,
  },
  sliderGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  slider: {
    width: 140,
    accentColor: theme.accent,
    cursor: 'pointer',
  },
  sliderValue: {
    fontSize: 12,
    fontWeight: 600,
    color: theme.textMuted,
    width: 36,
    textAlign: 'right' as const,
  },
  toggle: {
    width: 40,
    height: 22,
    borderRadius: 11,
    cursor: 'pointer',
    position: 'relative' as const,
    transition: 'background 0.2s ease',
    flexShrink: 0,
  },
  toggleKnob: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: '#fff',
    position: 'absolute' as const,
    top: 2,
    left: 2,
    transition: 'transform 0.2s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
  },
  select: {
    fontSize: 13,
    padding: '6px 10px',
    borderRadius: 8,
    border: `1px solid ${theme.borderLight}`,
    background: theme.bgCardSolid,
    color: theme.text,
    cursor: 'pointer',
    outline: 'none',
  },
  accountRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    objectFit: 'cover' as const,
  },
  userName: {
    fontSize: 14,
    fontWeight: 600,
    color: theme.text,
  },
  userEmail: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 2,
  },
  signOutBtn: {
    fontSize: 13,
    fontWeight: 600,
    color: theme.accentRed,
    background: 'rgba(230, 57, 70, 0.15)',
    border: `1px solid rgba(230, 57, 70, 0.3)`,
    borderRadius: 8,
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    alignSelf: 'flex-start',
  },
}

export default SettingsPage
