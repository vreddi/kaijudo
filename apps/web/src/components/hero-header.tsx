import { Link } from "@tanstack/react-router";
import {
  SignedIn,
  SignInButton,
  SignUpButton,
  SignedOut,
  UserButton,
} from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";

export function HeroHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-purple-400 via-blue-400 to-teal-400">
            <svg
              className="size-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill="currentColor"
                fillOpacity="0.8"
              />
              <path
                d="M2 17L12 22L22 17M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-lg font-semibold text-foreground">Kaijudo</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <a
            href="#features"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#solution"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Solution
          </a>
          <a
            href="#pricing"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </a>
          <a
            href="#about"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            About
          </a>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button
                variant="outline"
                className="h-9 rounded-md border border-border/50 bg-transparent px-4 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Login
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button
                variant="default"
                className="h-9 rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90"
              >
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
