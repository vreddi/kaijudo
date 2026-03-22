import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // Clerk JWT issuer domain, configured on the Convex Dashboard
      // See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
