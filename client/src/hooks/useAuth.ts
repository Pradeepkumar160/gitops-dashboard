// Demo auth hook — returns a hardcoded admin user so the app works
// without a real authentication backend.
// Replace this with a real tRPC auth query when you add login.

import { useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

const DEMO_USER: User = {
  id: 1,
  name: "Admin User",
  email: "admin@gitops.local",
  role: "admin",
};

export function useAuth() {
  const [user] = useState<User>(DEMO_USER);
  const [loading] = useState(false);

  const logout = () => {
    // In a real app: call logout mutation and redirect
    console.log("Logout clicked");
  };

  return {
    user,
    loading,
    isAuthenticated: true,
    logout,
  };
}
