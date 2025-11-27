import React from "react";
import { ConvexProvider } from "convex/react";
import { ConvexQueryClient } from "@convex-dev/react-query";

// Conditional Convex provider - only initializes if CONVEX_URL is provided
const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL;
const hasConvexUrl =
  CONVEX_URL && typeof CONVEX_URL === "string" && CONVEX_URL.trim().length > 0;

// Initialize Convex client synchronously if URL is available
let convexQueryClient: ConvexQueryClient | null = null;

if (hasConvexUrl) {
  try {
    convexQueryClient = new ConvexQueryClient(CONVEX_URL);
  } catch (e) {
    console.warn("Failed to initialize Convex:", e);
    convexQueryClient = null;
  }
}

export default function AppConvexProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // If Convex URL is not provided or initialization failed, skip the provider
  if (!convexQueryClient) {
    return <>{children}</>;
  }

  return (
    <ConvexProvider client={convexQueryClient.convexClient}>
      {children}
    </ConvexProvider>
  );
}
