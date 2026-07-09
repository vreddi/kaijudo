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

// In production, Tauri serves the app from a custom `tauri://` origin. Clerk's
// default "standard browser" mode derives its `redirect_url` from that origin,
// which the Frontend API rejects with "Invalid URL scheme" (only http/https are
// allowed). Non-standard-browser mode avoids that, and `persistClient` keeps the
// session without cookies.
//
// In development, `tauri dev` loads the Vite dev server over `http://localhost`,
// a normal http origin. There the standard-browser flow is required: a `pk_test`
// (development) instance authenticates the browser via the dev-browser handshake
// (`__clerk_db_jwt`), which non-standard-browser mode skips — causing Clerk to
// hang on load with "Unable to authenticate this browser for your development
// instance". So use standard-browser mode in dev, native mode in prod.
const isDev = import.meta.env.DEV

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      standardBrowser={isDev}
      experimental={isDev ? undefined : { persistClient: true }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <App />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </StrictMode>
)
