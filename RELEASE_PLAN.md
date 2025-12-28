# Release Plan

## @kaijudo/react-dropdown-menu v0.0.1

### Release Date
2024-12-27

### Version
0.0.1 (Initial Release)

### Release Type
🚀 Initial Release

### Summary
Initial release of the DropdownMenu component package. This package provides a complete dropdown menu implementation built on Radix UI's DropdownMenu primitive with shadcn/ui styling.

### Key Features
- Complete dropdown menu component suite
- Support for menus, submenus, checkboxes, radio groups
- Keyboard shortcuts display
- Comprehensive Storybook documentation with 10+ examples
- Full TypeScript support
- Built and tested

### Breaking Changes
None (initial release)

### Migration Guide
N/A (initial release)

### Installation
```bash
pnpm add @kaijudo/react-dropdown-menu
```

### Documentation
- Storybook: Run `pnpm storybook` in the package directory
- README: See `packages/react-dropdown-menu/README.md`
- CHANGELOG: See `packages/react-dropdown-menu/CHANGELOG.md`

### Testing
- ✅ Build successful
- ✅ TypeScript compilation passes
- ✅ Storybook stories configured and working

### Next Steps
1. Build the package: `cd packages/react-dropdown-menu && pnpm build`
2. Verify dist folder contains all necessary files
3. Publish to npm: `pnpm publish --access public`
4. Create GitHub release tag: `v0.0.1`

---

## @kaijudo/react-profile-dropdown v0.0.1

### Release Date
2024-12-27

### Version
0.0.1 (Initial Release)

### Release Type
🚀 Initial Release

### Summary
Initial release of the ProfileDropdown component package. This package provides a profile dropdown menu component that combines user avatar display with action buttons, built on top of `@kaijudo/react-dropdown-menu` and `@kaijudo/react-avatar`.

### Key Features
- Profile dropdown component with avatar
- Action buttons and menu items
- Comprehensive Storybook documentation
- Full TypeScript support
- Built and tested

### Dependencies
- `@kaijudo/react-avatar` (workspace dependency)
- `@kaijudo/react-dropdown-menu` (workspace dependency)

### Breaking Changes
None (initial release)

### Migration Guide
N/A (initial release)

### Installation
```bash
pnpm add @kaijudo/react-profile-dropdown
```

**Note:** This package depends on `@kaijudo/react-avatar` and `@kaijudo/react-dropdown-menu`, which must be installed first or will be installed automatically if using a workspace setup.

### Documentation
- Storybook: Run `pnpm storybook` in the package directory
- README: See `packages/react-profile-dropdown/README.md`
- CHANGELOG: See `packages/react-profile-dropdown/CHANGELOG.md`

### Testing
- ✅ Build successful
- ✅ TypeScript compilation passes
- ✅ Storybook stories configured and working

### Next Steps
1. Ensure dependencies are published first:
   - `@kaijudo/react-avatar` v0.1.0+
   - `@kaijudo/react-dropdown-menu` v0.0.1+
2. Build the package: `cd packages/react-profile-dropdown && pnpm build`
3. Verify dist folder contains all necessary files
4. Publish to npm: `pnpm publish --access public`
5. Create GitHub release tag: `v0.0.1`

---

## Release Order

Due to dependencies, release in this order:

1. **@kaijudo/react-avatar** (if not already published)
2. **@kaijudo/react-dropdown-menu** v0.0.1
3. **@kaijudo/react-profile-dropdown** v0.0.1

## Pre-Release Checklist

### For @kaijudo/react-dropdown-menu
- [x] Code complete and tested
- [x] Storybook stories added
- [x] CHANGELOG.md created
- [x] README.md updated
- [x] Build configuration verified
- [ ] Build package: `pnpm build`
- [ ] Verify dist folder contents
- [ ] Run tests: `pnpm test`
- [ ] Check Storybook: `pnpm storybook`
- [ ] Update version in package.json if needed
- [ ] Create git tag: `git tag @kaijudo/react-dropdown-menu@0.0.1`
- [ ] Publish to npm: `pnpm publish --access public`

### For @kaijudo/react-profile-dropdown
- [x] Code complete and tested
- [x] Storybook stories added
- [x] CHANGELOG.md created
- [x] README.md updated
- [x] Build configuration verified
- [ ] Verify dependencies are published
- [ ] Build package: `pnpm build`
- [ ] Verify dist folder contents
- [ ] Run tests: `pnpm test`
- [ ] Check Storybook: `pnpm storybook`
- [ ] Update version in package.json if needed
- [ ] Create git tag: `git tag @kaijudo/react-profile-dropdown@0.0.1`
- [ ] Publish to npm: `pnpm publish --access public`

## Post-Release

- [ ] Update documentation if needed
- [ ] Announce release (if applicable)
- [ ] Monitor for issues
- [ ] Plan next version features

