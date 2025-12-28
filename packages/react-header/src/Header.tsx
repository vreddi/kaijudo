import * as React from "react";
import { cn } from "./utils";
import { ProfileDropdown, type Profile } from "@kaijudo/react-profile-dropdown";

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Logo or brand element to display on the left side
   */
  logo?: React.ReactNode;
  /**
   * Navigation items to display in the center (optional)
   */
  navigation?: React.ReactNode;
  /**
   * Profile data for the ProfileDropdown component
   */
  profile?: Profile;
  /**
   * Callback function when sign out is clicked
   */
  onSignOut?: () => void;
  /**
   * Whether to show the profile dropdown
   * @default true
   */
  showProfile?: boolean;
  /**
   * Custom profile dropdown component (if you want to override the default)
   */
  profileDropdown?: React.ReactNode;
  /**
   * Whether the header has a transparent background
   * @default true
   */
  transparent?: boolean;
  /**
   * Additional content to display in the header
   */
  children?: React.ReactNode;
}

/**
 * Header component with transparent background and ProfileDropdown integration
 * 
 * @example
 * ```tsx
 * <Header
 *   logo={<Logo />}
 *   profile={{
 *     name: "John Doe",
 *     email: "john@example.com",
 *     avatar: "https://example.com/avatar.jpg"
 *   }}
 *   onSignOut={() => signOut()}
 * />
 * ```
 */
export function Header({
  logo,
  navigation,
  profile,
  onSignOut,
  showProfile = true,
  profileDropdown,
  transparent = true,
  className,
  children,
  ...props
}: HeaderProps) {
  const handleSignOut = React.useCallback(() => {
    if (onSignOut) {
      onSignOut();
    }
  }, [onSignOut]);

  return (
    <header
      className={cn(
        "flex items-center justify-between w-full px-4 md:px-6 lg:px-8 py-4",
        transparent && "bg-transparent",
        !transparent && "bg-background border-b",
        className
      )}
      {...props}
    >
      {/* Left side - Logo */}
      <div className="flex items-center flex-shrink-0">
        {logo}
      </div>

      {/* Center - Navigation (optional) */}
      {navigation && (
        <nav className="flex items-center flex-1 justify-center">
          {navigation}
        </nav>
      )}

      {/* Right side - Profile Dropdown or custom content */}
      <div className="flex items-center gap-4 flex-shrink-0">
        {children}
        {showProfile && (
          profileDropdown || (
            profile ? (
              <ProfileDropdown data={profile} onSignOut={handleSignOut} />
            ) : null
          )
        )}
      </div>
    </header>
  );
}
