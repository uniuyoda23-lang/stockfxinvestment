import { useEffect, useState } from "react";
import { LandingPageNew } from "./pages/LandingPageNew";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AdminPage } from "./pages/AdminPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { VerifyPage } from "./pages/VerifyPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { DisclosuresPage } from "./pages/DisclosuresPage";
import { CookiePolicyPage } from "./pages/CookiePolicyPage";
import "./i18n/config";
import { AuthProvider } from "./context/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

type Page =
  | "landing"
  | "login"
  | "register"
  | "dashboard"
  | "admin"
  | "admin-login"
  | "verify"
  | "privacy"
  | "terms"
  | "disclosures"
  | "cookies";

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");

  // Simple hash-based routing handler
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const routes: Record<string, Page> = {
        login: "login",
        register: "register",
        dashboard: "dashboard",
        admin: "admin",
        "admin-login": "admin-login",
        verify: "verify",
        privacy: "privacy",
        terms: "terms",
        disclosures: "disclosures",
        cookies: "cookies",
      };
      setCurrentPage(routes[hash] || "landing");
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        window.location.hash = "admin-login";
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navigate = (page: string) => {
    window.location.hash = page === "landing" ? "" : page;
  };

  const [adminAuthed, setAdminAuthed] = useState(() => {
    return localStorage.getItem("admin_token") !== null;
  });

  const handleAdminLogout = () => {
    setAdminAuthed(false);
    localStorage.removeItem("admin_token");
    window.location.hash = "admin-login";
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        {currentPage === "landing" && <LandingPageNew onNavigate={navigate} />}
        {currentPage === "login" && <LoginPage onNavigate={navigate} />}
        {currentPage === "register" && <RegisterPage onNavigate={navigate} />}
        {currentPage === "dashboard" && <DashboardPage onNavigate={navigate} />}
        {currentPage === "verify" && <VerifyPage onNavigate={navigate} />}
        {currentPage === "admin-login" && !adminAuthed && (
          <AdminLoginPage
            onSuccess={() => {
              setAdminAuthed(true);
              window.location.hash = "admin";
            }}
          />
        )}
        {((currentPage === "admin-login" && adminAuthed) ||
          currentPage === "admin") && (
          <AdminPage onLogout={handleAdminLogout} />
        )}
        {currentPage === "privacy" && <PrivacyPage onNavigate={navigate} />}
        {currentPage === "terms" && <TermsPage onNavigate={navigate} />}
        {currentPage === "disclosures" && (
          <DisclosuresPage onNavigate={navigate} />
        )}
        {currentPage === "cookies" && (
          <CookiePolicyPage onNavigate={navigate} />
        )}
      </AuthProvider>
    </ErrorBoundary>
  );
}
