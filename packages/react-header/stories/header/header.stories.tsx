import React from "react";
import { StoryObj } from "@storybook/react";
import { Header } from "../../src/Header";
import { ProfileDropdown } from "@kaijudo/react-profile-dropdown";

type HeaderStory = StoryObj<typeof Header>;

const sampleProfile = {
  name: "John Doe",
  email: "john@example.com",
  avatar: "https://github.com/shadcn.png",
  subscription: "PRO",
};

const sampleLogo = (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
      <span className="text-primary-foreground font-bold text-sm">KJ</span>
    </div>
    <span className="text-xl font-semibold">Kaijudo</span>
  </div>
);

export const Basic: HeaderStory = {
  render: () => (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <Header logo={sampleLogo} profile={sampleProfile} />
    </div>
  ),
};

export const WithNavigation: HeaderStory = {
  render: () => (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <Header
        logo={sampleLogo}
        navigation={
          <nav className="flex items-center gap-6">
            <a href="#" className="text-sm font-medium hover:text-primary">
              Home
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary">
              About
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary">
              Contact
            </a>
          </nav>
        }
        profile={sampleProfile}
      />
    </div>
  ),
};

export const Transparent: HeaderStory = {
  render: () => (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-8">
        <Header logo={sampleLogo} profile={sampleProfile} transparent={true} />
        <div className="mt-8 p-8 bg-white/30 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Content Area</h2>
          <p className="text-gray-600">
            This header has a transparent background, perfect for overlaying on
            content.
          </p>
        </div>
      </div>
    </div>
  ),
};

export const WithBackground: HeaderStory = {
  render: () => (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <Header
        logo={sampleLogo}
        profile={sampleProfile}
        transparent={false}
      />
      <div className="mt-8 p-8 bg-white rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Content Area</h2>
        <p className="text-gray-600">
          This header has a solid background with border.
        </p>
      </div>
    </div>
  ),
};

export const WithoutProfile: HeaderStory = {
  render: () => (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <Header logo={sampleLogo} showProfile={false} />
    </div>
  ),
};

export const WithCustomContent: HeaderStory = {
  render: () => (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <Header
        logo={sampleLogo}
        showProfile={false}
        children={
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
              Sign In
            </button>
            <button className="px-4 py-2 border border-border rounded-md text-sm font-medium">
              Sign Up
            </button>
          </div>
        }
      />
    </div>
  ),
};

export const Minimal: HeaderStory = {
  render: () => (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <Header
        logo={<span className="text-xl font-bold">Logo</span>}
        profile={{
          name: "Jane Smith",
          email: "jane@example.com",
          avatar: "https://github.com/vercel.png",
        }}
      />
    </div>
  ),
};

export const WithSignOutHandler: HeaderStory = {
  render: () => (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <Header
        logo={sampleLogo}
        profile={sampleProfile}
        onSignOut={() => {
          alert("Sign out clicked!");
        }}
      />
    </div>
  ),
};

