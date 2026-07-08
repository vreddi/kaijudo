import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexReactClient } from 'convex/react'
import App from './App'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL as string

if (!PUBLISHABLE_KEY) {
  throw new Error('Add VITE_CLERK_PUBLISHABLE_KEY to your .env.local file')
}

if (!CONVEX_URL) {
  throw new Error('Add VITE_CONVEX_URL to your .env.local file')
}

const convex = new ConvexReactClient(CONVEX_URL)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      // Tauri's webview serves the app from a custom `tauri://` origin. Clerk's
      // default "standard browser" mode derives its `redirect_url` from that
      // origin, which the Frontend API rejects with "Invalid URL scheme"
      // (only http/https are allowed). Running in non-standard-browser mode
      // stops Clerk from using the custom-scheme origin as a redirect target,
      // and `persistClient` keeps the session without relying on cookies.
      standardBrowser={false}
      experimental={{ persistClient: true }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <App />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </StrictMode>
)
