import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexReactClient } from 'convex/react'
import App from './App'

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
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <App />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </StrictMode>
)
