import React from "react";
import { StoryObj } from "@storybook/react";
import ProfileDropdown from "../../src/profile-dropdown/ProfileDropdown";

type ProfileDropdownStory = StoryObj<typeof ProfileDropdown>;

const sampleProfile = {
  name: "Eugene An",
  email: "eugene@kokonutui.com",
  avatar:
    "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/profile-mjss82WnWBRO86MHHGxvJ2TVZuyrDv.jpeg",
  subscription: "PRO",
  model: "Gemini 2.0 Flash",
};

export const Basic: ProfileDropdownStory = {
  render: () => (
    <div className="p-8">
      <ProfileDropdown data={sampleProfile} />
    </div>
  ),
};

export const WithSubscription: ProfileDropdownStory = {
  render: () => (
    <div className="p-8">
      <ProfileDropdown
        data={{
          ...sampleProfile,
          subscription: "PRO",
        }}
      />
    </div>
  ),
};

export const WithModel: ProfileDropdownStory = {
  render: () => (
    <div className="p-8">
      <ProfileDropdown
        data={{
          ...sampleProfile,
          model: "Gemini 2.0 Flash",
        }}
      />
    </div>
  ),
};

export const Minimal: ProfileDropdownStory = {
  render: () => (
    <div className="p-8">
      <ProfileDropdown
        data={{
          name: "John Doe",
          email: "john@example.com",
          avatar: "https://github.com/shadcn.png",
        }}
      />
    </div>
  ),
};

export const CustomProfile: ProfileDropdownStory = {
  render: () => (
    <div className="p-8">
      <ProfileDropdown
        data={{
          name: "Jane Smith",
          email: "jane@example.com",
          avatar: "https://github.com/vercel.png",
          subscription: "FREE",
          model: "GPT-4",
        }}
      />
    </div>
  ),
};

