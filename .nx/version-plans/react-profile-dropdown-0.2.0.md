---
"@kaijudo/react-profile-dropdown": minor
---

Add compact mode feature to ProfileDropdown component.

## Features

- **Compact mode**: New optional `compact` prop that shows only the avatar by default
- **Hover expansion**: When `compact={true}`, hovering over the avatar smoothly expands to show name and email
- **Smooth animations**: 300ms transitions with opacity and width animations for a polished UX
- **Backward compatible**: Defaults to `false`, existing usage remains unchanged

### Technical Details

- Added `compact` prop to `ProfileDropdownProps` interface
- Implemented hover state management for expand/collapse animation
- Updated padding and gap spacing based on compact mode and hover state
- Added overflow handling for smooth width transitions
- Added new Storybook stories demonstrating compact mode

### Usage

```tsx
// Compact mode - avatar only, expands on hover
<ProfileDropdown data={profile} compact={true} />

// Default mode - always shows full container
<ProfileDropdown data={profile} />
```

