import Home from './pages/Home';

/**
 * App.jsx
 * 
 * Top-level React component.
 * 
 * When you're ready to add Clerk auth, wrap this with <ClerkProvider>:
 * 
 *   import { ClerkProvider } from '@clerk/clerk-react';
 *   const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
 * 
 *   function App() {
 *     return (
 *       <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
 *         <Home />
 *       </ClerkProvider>
 *     );
 *   }
 * 
 * See: https://clerk.com/docs/quickstarts/react
 */
function App() {
  return <Home />;
}

export default App;
