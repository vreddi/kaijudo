import React, { memo, useState } from "react";
import type { ComponentPageProps } from "./ComponentPage.types";

type TabId = "examples" | "code" | "design" | "changelog";

export const ComponentPage: React.FC<ComponentPageProps> = memo(
  ({ name, description, children, examples, changelogs }) => {
    const [activeTab, setActiveTab] = useState<TabId>("examples");

    const tabs = [
      { id: "examples" as TabId, label: "Examples" },
      { id: "code" as TabId, label: "Code" },
      { id: "design" as TabId, label: "Design" },
      { id: "changelog" as TabId, label: "Changelog" },
    ];

    const renderTabContent = () => {
      switch (activeTab) {
        case "examples":
          return examples ? <div className="mt-8">{examples}</div> : null;
        case "code":
          return (
            <div className="mt-8">
              <p className="text-gray-500">Code documentation coming soon...</p>
            </div>
          );
        case "design":
          return (
            <div className="mt-8">
              <p className="text-gray-500">
                Design documentation coming soon...
              </p>
            </div>
          );
        case "changelog":
          return changelogs ? (
            <div className="mt-8">{changelogs}</div>
          ) : (
            <div className="mt-8">
              <p className="text-gray-500">No changelog available.</p>
            </div>
          );
        default:
          return null;
      }
    };

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
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
          {/* Tab Content */}
          {renderTabContent()}
        </div>
        {children}
      </div>
    );
  }
);

ComponentPage.displayName = "ComponentPage";
