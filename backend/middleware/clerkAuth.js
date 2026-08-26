/**
 * Clerk authentication middleware placeholder.
 * 
 * When you are ready to implement auth, install @clerk/express and replace
 * this file with the real Clerk middleware. See Clerk docs:
 * https://clerk.com/docs/references/nodejs/overview
 * 
 * Required env vars:
 *   CLERK_SECRET_KEY
 *   CLERK_PUBLISHABLE_KEY
 */

// TODO: replace with real Clerk middleware
const clerkAuth = (req, res, next) => {
  // Placeholder — allows all requests through until Clerk is wired up
  next();
};

module.exports = clerkAuth;
