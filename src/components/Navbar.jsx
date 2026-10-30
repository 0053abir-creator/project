"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import {
  PlusCircle,
  Search,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ExternalLink,
  GraduationCap,
} from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top IU Official Utility Bar */}
      <div className="bg-gradient-to-r from-iugreen-950 via-iugreen-900 to-iugreen-950 text-white text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-iugreen-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-medium truncate text-emerald-100">
              Islamic University, Kushtia, Bangladesh
            </span>
            <span className="hidden sm:inline text-emerald-400/60">|</span>
            <span className="hidden sm:inline text-emerald-200/80">
              Department of Computer Science &amp; Engineering
            </span>
          </div>

          <a
            href="https://www.iu.ac.bd/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-300 hover:text-white transition-colors shrink-0 font-semibold"
          >
            <span>Visit Main Website: iu.ac.bd</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & University branding */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white border border-iugreen-200 p-0.5 shadow-sm group-hover:scale-105 transition-transform overflow-hidden flex items-center justify-center shrink-0">
              <img
                src="/iu-logo.png"
                alt="Islamic University Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 leading-tight group-hover:text-iugreen-800 transition-colors flex items-center gap-1.5">
                <span>IU Lost &amp; Found</span>
              </div>
              <div className="text-[10px] tracking-wide text-iugreen-800 font-semibold truncate max-w-[220px] sm:max-w-none">
                Islamic University, Kushtia, Bangladesh
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/items"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/items")
                  ? "bg-iugreen-50 text-iugreen-800 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Search className="w-4 h-4 text-iugreen-700" />
              <span>Browse Items</span>
            </Link>

            <Link
              href="/items/new"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/items/new")
                  ? "bg-iugreen-50 text-iugreen-800 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <PlusCircle className="w-4 h-4 text-iugreen-700" />
              <span>Report Item</span>
            </Link>

            {user && user.role === "admin" && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin")
                    ? "bg-iugreen-50 text-iugreen-800 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-iugreen-800" />
                <span>Admin Desk</span>
              </Link>
            )}

            {user && user.role === "student" && (
              <Link
                href="/student"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith("/student")
                    ? "bg-iugreen-50 text-iugreen-800 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-iugreen-800" />
                <span>My Dashboard</span>
              </Link>
            )}
          </nav>

          {/* Auth CTA / User profile */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-iugreen-800 font-semibold">
                    {user.role === "admin" ? "Desk Admin" : user.studentId || "Student"}
                  </div>
                </div>

                <button
                  onClick={() => logout()}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 text-sm font-bold text-white bg-iugreen-800 hover:bg-iugreen-900 rounded-lg shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            href="/items"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <Search className="w-4 h-4 text-iugreen-700" />
            <span>Browse Items</span>
          </Link>

          <Link
            href="/items/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <PlusCircle className="w-4 h-4 text-iugreen-700" />
            <span>Report Item</span>
          </Link>

          {user && user.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <LayoutDashboard className="w-4 h-4 text-iugreen-700" />
              <span>Admin Desk</span>
            </Link>
          )}

          {user && user.role === "student" && (
            <Link
              href="/student"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <LayoutDashboard className="w-4 h-4 text-iugreen-700" />
              <span>My Dashboard</span>
            </Link>
          )}

          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2">
                <div>
                  <div className="text-sm font-bold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500">
                    {user.role === "admin" ? "Admin Desk" : user.studentId}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2 px-3 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-bold text-white bg-iugreen-800 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
