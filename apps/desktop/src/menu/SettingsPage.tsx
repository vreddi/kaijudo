import { useState } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { useSettingsContext } from '../contexts/SettingsContext'
import type { UserSettings } from '../hooks/useSettings'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/warcraftcn/card'
import { Checkbox } from '@/components/ui/warcraftcn/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/warcraftcn/radio-group'
import { Label } from '@/components/ui/warcraftcn/label'
import { Button } from '@/components/ui/warcraftcn/button'
import '@/components/ui/warcraftcn/styles/warcraft.css'

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
      <div className="flex flex-col gap-5 max-w-[640px]">
        <p className="fantasy text-amber-200/60 text-sm">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 max-w-[640px]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="fantasy text-2xl font-bold text-amber-100 [text-shadow:0_0_20px_rgba(251,191,36,0.3),0_1px_2px_rgba(0,0,0,0.5)] tracking-wide m-0">
          Settings
        </h2>
        <span
          className="fantasy text-xs font-bold text-green-400 [text-shadow:0_0_8px_rgba(74,222,128,0.5)] uppercase tracking-wider transition-all duration-400"
          style={{
            opacity: saved ? 1 : 0,
            transform: saved ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.9)',
          }}
        >
          Saved
        </span>
      </div>

      {/* Audio */}
      <Card data-size="sm">
        <CardHeader>
          <CardTitle>
            <span className="text-amber-200 [text-shadow:0_0_10px_rgba(251,191,36,0.3)] uppercase tracking-[1.5px] text-xs font-bold">
              ♪ Audio
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
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
          <div className="flex items-center justify-between">
            <Label>Music Enabled</Label>
            <Checkbox
              aria-label="Music Enabled"
              checked={settings.musicEnabled}
              onCheckedChange={(checked) => handleUpdate('musicEnabled', checked === true)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Display */}
      <Card data-size="sm">
        <CardHeader>
          <CardTitle>
            <span className="text-amber-200 [text-shadow:0_0_10px_rgba(251,191,36,0.3)] uppercase tracking-[1.5px] text-xs font-bold">
              ◈ Display
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label>Animation Speed</Label>
            <RadioGroup
              value={settings.animationSpeed}
              onValueChange={(v) => handleUpdate('animationSpeed', v as UserSettings['animationSpeed'])}
              orientation="horizontal"
            >
              {[
                { value: 'normal', label: 'Normal' },
                { value: 'fast', label: 'Fast' },
                { value: 'off', label: 'Off' },
              ].map((opt) => (
                <label key={opt.value} className="fantasy inline-flex items-center gap-2 cursor-pointer text-sm text-amber-100/80">
                  <RadioGroupItem value={opt.value} />
                  {opt.label}
                </label>
              ))}
            </RadioGroup>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Card Art Quality</Label>
            <RadioGroup
              value={settings.cardArtQuality}
              onValueChange={(v) => handleUpdate('cardArtQuality', v as UserSettings['cardArtQuality'])}
              orientation="horizontal"
            >
              {[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ].map((opt) => (
                <label key={opt.value} className="fantasy inline-flex items-center gap-2 cursor-pointer text-sm text-amber-100/80">
                  <RadioGroupItem value={opt.value} />
                  {opt.label}
                </label>
              ))}
            </RadioGroup>
          </div>
          <div className="flex items-center justify-between">
            <Label>Reduced Motion</Label>
            <Checkbox
              aria-label="Reduced Motion"
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => handleUpdate('reducedMotion', checked === true)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Gameplay */}
      <Card data-size="sm">
        <CardHeader>
          <CardTitle>
            <span className="text-amber-200 [text-shadow:0_0_10px_rgba(251,191,36,0.3)] uppercase tracking-[1.5px] text-xs font-bold">
              ⚔ Gameplay
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Label>Auto-pass Priority</Label>
            <Checkbox
              aria-label="Auto-pass Priority"
              checked={settings.autoPassPriority}
              onCheckedChange={(checked) => handleUpdate('autoPassPriority', checked === true)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Confirm Before Attacking</Label>
            <Checkbox
              aria-label="Confirm Before Attacking"
              checked={settings.confirmBeforeAttacking}
              onCheckedChange={(checked) => handleUpdate('confirmBeforeAttacking', checked === true)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show Card Tooltips</Label>
            <Checkbox
              aria-label="Show Card Tooltips"
              checked={settings.showCardTooltips}
              onCheckedChange={(checked) => handleUpdate('showCardTooltips', checked === true)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card data-size="sm">
        <CardHeader>
          <CardTitle>
            <span className="text-amber-200 [text-shadow:0_0_10px_rgba(251,191,36,0.3)] uppercase tracking-[1.5px] text-xs font-bold">
              ◉ Account
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {user && (
            <div className="flex items-center gap-3.5 mb-1">
              <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-br from-amber-400 to-amber-700 shadow-[0_0_10px_rgba(212,160,23,0.25)] shrink-0">
                <img
                  src={user.imageUrl}
                  alt=""
                  className="w-full h-full rounded-full object-cover block"
                />
              </div>
              <div>
                <div className="fantasy text-sm font-bold text-amber-100 tracking-wide">
                  {user.fullName ?? user.primaryEmailAddress?.emailAddress ?? 'User'}
                </div>
                <div className="text-xs text-amber-200/40 mt-0.5">
                  {user.primaryEmailAddress?.emailAddress}
                </div>
              </div>
            </div>
          )}
          <Button
            variant="default"
            className="self-start text-red-400 hover:text-red-300"
            onClick={() => clerk.signOut()}
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
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
  const pct = Math.round(value * 100)
  return (
    <div className="flex items-center justify-between gap-4">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <div className="relative w-[150px] h-1.5 rounded-full bg-white/8 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-amber-700 to-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)] pointer-events-none"
            style={{ width: `${pct}%`, transition: 'width 0.05s ease-out' }}
          />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute -top-1.5 -left-0.5 w-[calc(100%+4px)] h-[18px] m-0 opacity-0 cursor-pointer z-[2]"
          />
        </div>
        <span className="fantasy text-xs font-bold text-amber-400 w-9 text-right tabular-nums [text-shadow:0_0_6px_rgba(251,191,36,0.3)]">
          {pct}%
        </span>
      </div>
    </div>
  )
}

export default SettingsPage
