import React, { memo } from "react";
import type { UtilityPageProps } from "./UtilityPage.types";

export const UtilityPage: React.FC<UtilityPageProps> = memo(
  ({ name, description, children }) => {
    return (
      <div>
        {/* Header Section - Blue background like Lightning Design System */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-8 py-16">
            <h1 className="text-5xl font-bold mb-4">{name}</h1>
            <p className="text-xl text-blue-100 max-w-3xl">{description}</p>
          </div>
        </div>
        {children}
      </div>
    );
  }
);

UtilityPage.displayName = "UtilityPage";

