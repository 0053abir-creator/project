"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { ItemForm } from "@/components/ItemForm";
import { PlusCircle, ShieldAlert, LogIn, UserPlus } from "lucide-react";

export default function NewItemPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Checking session credentials...</p>
      </div>
    );
  }

  // Protected page: Authentication required
  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <PlusCircle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Sign In to Report an Item
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              To keep the Islamic University Lost &amp; Found registry safe, accountable, and free from spam, only registered students and staff can post items.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/login"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In to Your Account</span>
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Student Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
          <PlusCircle className="w-4 h-4" />
          <span>New Campus Report</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Report a Lost or Found Item
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Provide accurate location and details to ensure fast verification by the CSE Lost &amp; Found desk.
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <ItemForm isEdit={false} />
      </div>
    </div>
  );
}
