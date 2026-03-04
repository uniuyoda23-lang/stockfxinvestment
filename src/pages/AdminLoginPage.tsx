import React, { useState } from "react";
import { Lock, AlertCircle, LogIn } from "lucide-react";
import { useAdminLogin } from "../hooks/useApi";
  
interface AdminLoginPageProps {
  onSuccess: () => void;
}

export function AdminLoginPage({ onSuccess }: AdminLoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const adminLoginMutation = useAdminLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    adminLoginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          onSuccess();
        },
        onError: (err: any) => {
          setError(err.message || "Invalid email or password.");
          setPassword("");
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-emerald-600 rounded-lg">
              <Lock className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-slate-400">Sign in to manage users and settings</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                placeholder="adminkingsley@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 border border-red-600 rounded-lg p-3 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-emerald-600/50 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              disabled={adminLoginMutation.isPending}
            >
              <LogIn className="h-5 w-5" />
              {adminLoginMutation.isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Demo Credentials Info */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-xs text-slate-400 text-center mb-3">
              Demo Admin Credentials:
            </p>
            <div className="bg-slate-900/50 rounded p-3 space-y-1 text-xs text-slate-300 font-mono">
              <p>
                <span className="text-slate-500">Email:</span> admin@example.com
              </p>
              <p>
                <span className="text-slate-500">Password:</span>{" "}
                &lt;ADMIN_PASSWORD&gt;
              </p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <a
            href="#/"
            className="text-slate-400 hover:text-slate-300 transition text-sm"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
