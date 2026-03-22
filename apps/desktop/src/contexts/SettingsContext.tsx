import { createContext, useContext } from 'react'
import { useSettings } from '../hooks/useSettings'

export type { UserSettings } from '../hooks/useSettings'

type SettingsContextValue = ReturnType<typeof useSettings>

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const value = useSettings()
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettingsContext(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) {
    throw new Error('useSettingsContext must be used within SettingsProvider')
  }
  return ctx
}

export function useOptionalSettings(): SettingsContextValue | null {
  return useContext(SettingsContext)
}
