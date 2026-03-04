export function adminLogin(email: string, password: string): boolean {
  // Simple session-based admin check for now
  // In a real app, this should call the backend
  if (email === "admin@example.com" && password === "admin123") {
    localStorage.setItem("admin_token", "session_admin_verified");
    return true;
  }
  return false;
}

export function isAdminAuthenticated(): boolean {
  return localStorage.getItem("admin_token") === "session_admin_verified";
}

export function logoutAdmin() {
  localStorage.removeItem("admin_token");
}
