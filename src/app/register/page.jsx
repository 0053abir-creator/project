"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { UserPlus, AlertCircle, ExternalLink } from "lucide-react";
import config from "@/lib/config";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    department: config.academicDepartments[0] || "Computer Science & Engineering (CSE)",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          studentId: formData.studentId.trim(),
          department: formData.department,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.details && Array.isArray(data.details)) {
          throw new Error(data.details.join(", "));
        }
        throw new Error(data.error || "Registration failed.");
      }

      await refreshUser();
      router.push("/student");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          Student Registration · Lost &amp; Found Portal
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
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Tanvir Hasan"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-iugreen-500/20 focus:border-iugreen-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              University Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. student@iu.ac.bd or name@cse.iu.ac.bd"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-iugreen-500/20 focus:border-iugreen-600"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Student ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="2021-CSE-045"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-iugreen-500/20 focus:border-iugreen-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full text-xs px-2.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-iugreen-500/20 focus:border-iugreen-600"
                required
              >
                {config.academicDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-iugreen-500/20 focus:border-iugreen-600"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-iugreen-500/20 focus:border-iugreen-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-iugreen-800 hover:bg-iugreen-900 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? "Registering..." : "Create Student Account"}</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="font-bold text-iugreen-800 hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
