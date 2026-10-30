"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { LogIn, AlertCircle, Sparkles, ExternalLink } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loggedUser = await login(email.trim(), password);
      if (loggedUser.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/student");
      }
      router.refresh();
    } catch (err) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role) => {
    if (role === "admin") {
      setEmail("admin@iu.ac.bd");
      setPassword(""); // Do not show or auto-fill admin password for security
    } else {
      setEmail("student@iu.ac.bd");
      setPassword("Student@123");
    }
    setError("");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14 space-y-6">
      {/* Brand logo & Islamic University Kushtia Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-white p-1 border-2 border-iugreen-600 shadow-md flex items-center justify-center mx-auto">
          <img
            src="/iu-logo.png"
            alt="Islamic University Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
          Islamic University, Kushtia, Bangladesh
        </h1>
        <p className="text-xs text-iugreen-800 font-bold uppercase tracking-wider">
          Lost &amp; Found Portal · CSE Department Desk
        </p>
        <a
          href="https://www.iu.ac.bd/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-iugreen-700 hover:text-iugreen-900 underline font-medium"
        >
          <span>Official University Website (iu.ac.bd)</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Demo Credentials Helper Box */}
      <div className="p-4 bg-iugreen-50 border border-iugreen-200 rounded-2xl space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-iugreen-900">
          <Sparkles className="w-4 h-4 text-iugreen-700" />
          <span>Quick Demo Test Logins</span>
        </div>
        <p className="text-[11px] text-iugreen-800 leading-relaxed">
          Click below to auto-fill credentials pre-seeded for testing:
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => fillDemoCredentials("student")}
            className="px-3 py-1.5 text-xs font-bold bg-white text-iugreen-900 border border-iugreen-300 rounded-lg hover:bg-iugreen-100 transition-colors shadow-xs"
          >
            Login as Student
          </button>
          <button
            type="button"
            onClick={() => fillDemoCredentials("admin")}
            className="px-3 py-1.5 text-xs font-bold bg-white text-iugreen-900 border border-iugreen-300 rounded-lg hover:bg-iugreen-100 transition-colors shadow-xs"
          >
            Login as Admin
          </button>
        </div>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              University Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@iu.ac.bd or admin@iu.ac.bd"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-iugreen-500/20 focus:border-iugreen-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-iugreen-500/20 focus:border-iugreen-600"
              required
            />
            {email.toLowerCase().includes("admin") && (
              <p className="text-[11px] text-slate-500 mt-1">
                Admin password must be entered manually for security.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-iugreen-800 hover:bg-iugreen-900 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? "Signing In..." : "Sign In to IU Portal"}</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          New student at Islamic University?{" "}
          <Link href="/register" className="font-bold text-iugreen-800 hover:underline">
            Register Student Account
          </Link>
        </div>
      </div>
    </div>
  );
}
