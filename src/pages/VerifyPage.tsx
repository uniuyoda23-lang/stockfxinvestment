import { useState } from "react";
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { authService } from "../services/authService";

interface VerifyPageProps {
  onNavigate: (page: string) => void;
}

export function VerifyPage({ onNavigate }: VerifyPageProps) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !token) return;

    setLoading(true);
    setError("");

    try {
      await authService.verifyEmail(email, token);
      setSuccess(true);
      setTimeout(() => onNavigate("login"), 2000);
    } catch (err: any) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#1e293b]/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Verify your account
          </h1>
          <p className="text-slate-400">
            Enter the 6-digit code sent to your email.
          </p>
        </div>

        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center mb-6">
            <p className="text-emerald-500 font-medium">
              Email verified successfully!
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Redirecting to login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="yours@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-center tracking-[1em] text-xl font-mono"
                placeholder="000000"
              />
            </div>

            {error && (
              <div className="text-rose-500 text-sm bg-rose-500/10 border border-rose-500/10 p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || token.length !== 6}
              className="w-full py-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg flex items-center justify-center gap-2 group transition-all"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Verify Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            <button
              type="button"
              onClick={() => onNavigate("login")}
              className="w-full text-slate-400 hover:text-white text-sm transition-colors"
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
