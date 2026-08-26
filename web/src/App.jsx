import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, SignIn, SignUp } from '@clerk/clerk-react';

import Layout from './components/Layout';
import Home from './pages/Home';
import Subscriptions from './pages/Subscriptions';
import Assignments from './pages/Assignments';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={
              <>
                <SignedIn><Home /></SignedIn>
                <SignedOut><Navigate to="/sign-in" replace /></SignedOut>
              </>
            } />
            <Route path="subscriptions" element={
              <>
                <SignedIn><Subscriptions /></SignedIn>
                <SignedOut><Navigate to="/sign-in" replace /></SignedOut>
              </>
            } />
            <Route path="assignments" element={
              <>
                <SignedIn><Assignments /></SignedIn>
                <SignedOut><Navigate to="/sign-in" replace /></SignedOut>
              </>
            } />
          </Route>
          <Route path="/sign-in/*" element={
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
              <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/" />
            </div>
          } />
          <Route path="/sign-up/*" element={
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
              <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/" />
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  );
}

export default App;
