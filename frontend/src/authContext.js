import { useState } from "react";

// Stub useAuth hook that returns a logged-in state for testing
export function useAuth() {
  // In real app, this would manage authentication state
  // Here, simply return mocked logged-in user info
  const [user] = useState({ id: "test-user" });
  const [isAuthenticated] = useState(true);

  return { isAuthenticated, user };
}
