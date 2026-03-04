import { useState, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Logo } from "../components/investment/Logo";
import { Mail, Lock, AlertCircle, User as UserIcon } from "lucide-react";
import { useSignUp } from "../hooks/useApi";

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export function RegisterPage({ onNavigate }: RegisterPageProps) {
  const { t } = useTranslation();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const signUpMutation = useSignUp();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    signUpMutation.mutate(
      { email, password, name },
      {
        onSuccess: (result) => {
          if (result.success) {
            setIsSuccess(true);
          } else {
            setError(result.error || "Registration failed");
          }
        },
        onError: (err: any) => setError(err.message || "Registration failed"),
      },
    );
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200 text-center">
            <Mail className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Check your email
            </h2>
            <p className="text-slate-600 mb-6">
              We've sent a 6-digit verification code to{" "}
              <span className="font-semibold">{email}</span>. Please enter the
              code on the verification page to activate your account.
            </p>
            <Button onClick={() => onNavigate("verify")} className="w-full">
              Go to Verification Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
          {t("register.title")}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {t("register.haveAccount")}{" "}
          <button
            onClick={() => onNavigate("login")}
            className="font-medium text-emerald-600 hover:text-emerald-500"
          >
            {t("login.title")}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          {error && (
            <div className="mb-4 flex items-start gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<UserIcon className="h-5 w-5" />}
            />
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-5 w-5" />}
            />
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-5 w-5" />}
            />
            <Button
              type="submit"
              className="w-full"
              isLoading={signUpMutation.isPending}
            >
              Crate Account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
