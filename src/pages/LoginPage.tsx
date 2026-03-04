import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Logo } from "../components/investment/Logo";
import { Mail, Lock, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

import { useSignIn } from "../hooks/useApi";

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const signInMutation = useSignIn();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") === "true") {
      setIsVerified(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsVerified(false);

    signInMutation.mutate(
      { email: email.toLowerCase().trim(), password },
      {
        onSuccess: async (result) => {
          if (result.success) {
            // Re-initialize auth in context
            await signIn(email.toLowerCase().trim(), password);
            if (result.user?.is_admin) {
              onNavigate("admin");
            } else {
              onNavigate("dashboard");
            }
          } else {
            setError(result.error || "Login failed");
          }
        },
        onError: (err: any) => {
          setError(err.message || "Login failed");
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div
          className="flex justify-center mb-6 cursor-pointer"
          onClick={() => onNavigate("landing")}
        >
          <Logo size="xl" />
        </div>
        <h2 className="text-center text-3xl font-bold text-slate-900">
          {t("login.title")}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {t("login.noAccount")}{" "}
          <button
            onClick={() => onNavigate("register")}
            className="font-medium text-emerald-600 hover:text-emerald-500"
          >
            {t("register.title")}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label={t("login.emailLabel")}
              type="email"
              required
              leftIcon={<Mail className="h-5 w-5" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label={t("login.passwordLabel")}
              type="password"
              required
              leftIcon={<Lock className="h-5 w-5" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {isVerified && (
              <div className="mb-4 flex items-center gap-3 rounded-lg bg-emerald-50 p-4 border border-emerald-200">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <p className="text-sm text-emerald-700">
                  Account verified successfully! You can now log in.
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 flex items-start gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={signInMutation.isPending}
            >
              {t("login.signInButton")}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => onNavigate("landing")}
              className="text-sm text-slate-500 hover:text-slate-900 flex items-center justify-center mx-auto transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t("login.backToHome")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
