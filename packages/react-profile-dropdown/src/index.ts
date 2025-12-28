export { default as ProfileDropdown } from "./profile-dropdown/ProfileDropdown";

export interface Profile {
  name: string;
  email: string;
  avatar: string;
  subscription?: string;
  model?: string;
}

export interface ProfileDropdownProps
  extends React.HTMLAttributes<HTMLDivElement> {
  data?: Profile;
  showTopbar?: boolean;
  /**
   * Callback function when sign out is clicked
   */
  onSignOut?: () => void;
}
