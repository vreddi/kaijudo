import { useQuery, useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import { useState, useCallback, useRef } from 'react'

export interface UserSettings {
  musicVolume: number
  sfxVolume: number
  musicEnabled: boolean
  animationSpeed: 'normal' | 'fast' | 'off'
  cardArtQuality: 'low' | 'medium' | 'high'
  reducedMotion: boolean
  autoPassPriority: boolean
  confirmBeforeAttacking: boolean
  showCardTooltips: boolean
}

const DEFAULT_SETTINGS: UserSettings = {
  musicVolume: 0.5,
  sfxVolume: 0.5,
  musicEnabled: true,
  animationSpeed: 'normal',
  cardArtQuality: 'high',
  reducedMotion: false,
  autoPassPriority: false,
  confirmBeforeAttacking: true,
  showCardTooltips: true,
}

type SettingsKey = keyof UserSettings

export function useSettings() {
  const remoteSettings = useQuery(api.userSettings.get)
  const updateMutation = useMutation(api.userSettings.update)
  const [localOverrides, setLocalOverrides] = useState<Partial<UserSettings>>({})
  const pendingRef = useRef<Partial<UserSettings>>({})
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const settings: UserSettings = {
    ...DEFAULT_SETTINGS,
    ...(remoteSettings ?? {}),
    ...localOverrides,
  }

  const updateSetting = useCallback(
    <K extends SettingsKey>(key: K, value: UserSettings[K]) => {
      setLocalOverrides((prev) => ({ ...prev, [key]: value }))
      pendingRef.current = { ...pendingRef.current, [key]: value }

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        const changes = pendingRef.current
        pendingRef.current = {}
        updateMutation(changes).then(() => {
          setLocalOverrides({})
        })
      }, 500)
    },
    [updateMutation]
  )

  return {
    settings,
    updateSetting,
    isLoading: remoteSettings === undefined,
  }
}
