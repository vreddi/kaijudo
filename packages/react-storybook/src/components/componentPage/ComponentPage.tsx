import React, { memo } from "react";
import type { ComponentPageProps } from "./ComponentPage.types";

export const ComponentPage: React.FC<ComponentPageProps> = memo(
  ({ name, description, children, examples }) => {
    return (
      <div>
        {/* Header Section - Blue background like Lightning Design System */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white m-4 rounded-lg shadow-lg">
          <div className="max-w-7xl mx-auto px-8 py-16">
            <h1 className="text-5xl font-bold mb-4">{name}</h1>
            <p className="text-xl text-blue-100 max-w-3xl">{description}</p>
          </div>
        </div>
        {/* Tabs Section */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button className="border-b-2 border-blue-600 py-4 px-1 text-sm font-medium text-blue-600">
                Examples
              </button>
              <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Code
              </button>
              <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Design
              </button>
              <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Changelog
              </button>
            </nav>
          </div>
          {/* Examples Tab Content */}
          {examples && <div className="mt-8">{examples}</div>}
        </div>
        {children}
      </div>
    );
  }
);

ComponentPage.displayName = "ComponentPage";
