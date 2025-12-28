import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../src/dropdown-menu";
import * as DropdownMenuStories from "./dropdown-menu.stories";

export const Examples: React.FC = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold mb-4">Examples</h2>
      <p className="text-gray-600 mb-6">
        This section showcases all available stories for the DropdownMenu component.
      </p>

      {/* Render each story from dropdown-menu.stories.tsx */}
      {Object.entries(DropdownMenuStories).map(([storyName, story]) => {
        // Skip the default export and internal Storybook exports
        if (storyName === "default" || storyName.startsWith("__")) return null;

        // Get the story args and render function
        const storyObj = story as any;
        const args = storyObj.args || {};
        const renderFn = storyObj.render;

        return (
          <div key={storyName} className="mb-8">
            <h3 className="text-xl font-medium mb-4 capitalize">{storyName}</h3>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              {renderFn ? renderFn(args, storyObj) : <DropdownMenu {...args} />}
            </div>
          </div>
        );
      })}
    </div>
  );
};

