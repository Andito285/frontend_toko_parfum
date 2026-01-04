"use client";

import { useState, useEffect } from "react";
import { getAuthUser, isAuthenticated, isAdmin, removeAuth } from "@/lib/auth";
import GuestNavbar from "./GuestNavbar";
import UserNavbar from "./UserNavbar";
import AdminNavbar from "./AdminNavbar";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const currentUser = getAuthUser();
      const adminStatus = isAdmin();

      setIsLoggedIn(authenticated);
      setUser(currentUser);
      setIsAdminUser(adminStatus);
    };

    checkAuth();

    // Listen for storage changes (for logout/login from other tabs)
    window.addEventListener("storage", checkAuth);

    // Listen for custom auth change event (for same-tab updates)
    window.addEventListener("authChange", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("authChange", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    // Hapus auth data dari cookies
    removeAuth();
    setIsLoggedIn(false);
    setUser(null);
    setIsAdminUser(false);
    // Dispatch custom event for consistency
    window.dispatchEvent(new Event("authChange"));
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <nav className="bg-black shadow-md sticky top-0 z-50 border-b border-yellow-600/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <span className="text-2xl font-bold text-yellow-400">
              Jamal<span className="text-white">Parfum</span>
            </span>
          </div>
        </div>
      </nav>
    );
  }

  // Render based on auth state
  if (isLoggedIn && isAdminUser) {
    return <AdminNavbar user={user} onLogout={handleLogout} />;
  }

  if (isLoggedIn && user) {
    return <UserNavbar user={user} onLogout={handleLogout} />;
  }

  return <GuestNavbar />;
}
