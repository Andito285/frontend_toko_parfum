// lib/auth.js
import Cookies from "js-cookie";

// Cookie options for security
const cookieOptions = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "Strict", // Protect against CSRF
};

// Set auth token in cookie
export const setAuthToken = (token) => {
  Cookies.set("auth_token", token, cookieOptions);
};

// Set user data in cookie
export const setAuthUser = (user) => {
  Cookies.set("user", JSON.stringify(user), cookieOptions);
};

// Get auth token from cookie
export const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return Cookies.get("auth_token") || null;
};

// Get auth user from cookie
export const getAuthUser = () => {
  if (typeof window === "undefined") return null;
  const userStr = Cookies.get("user");
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

// Check if user is admin
export const isAdmin = () => {
  const user = getAuthUser();
  return user?.role === "admin";
};

// Check if user is authenticated
export const isAuthenticated = () => {
  if (typeof window === "undefined") return false;
  return !!Cookies.get("auth_token");
};

// Remove all auth data (for logout)
export const removeAuth = () => {
  Cookies.remove("auth_token");
  Cookies.remove("user");
};
