"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Mail,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Building,
  GraduationCap,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-slate-950 text-slate-300 mt-24 border-t border-iugreen-800/40 overflow-hidden">
      {/* Subtle modern ambient background gradient */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-iugreen-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Assistance Banner */}
      <div className="relative border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="font-semibold text-slate-200">
                IU Campus Lost &amp; Found Portal is Active &amp; Monitored
              </span>
              <span className="hidden md:inline text-slate-500">·</span>
              <span className="hidden md:inline text-slate-400">
                Official CSE Department Desk Service
              </span>
            </div>

            <a
              href="https://www.iu.ac.bd/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-iugreen-900/70 hover:bg-iugreen-800 text-emerald-200 hover:text-white border border-iugreen-700/50 transition-all font-medium text-xs shadow-xs"
            >
              <span>Islamic University Main Portal (iu.ac.bd)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-white p-1.5 border border-emerald-500/30 shadow-md flex items-center justify-center shrink-0">
                <img
                  src="/iu-logo.png"
                  alt="Islamic University Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h3 className="font-black text-lg text-white tracking-tight leading-tight">
                  Islamic University, Kushtia, Bangladesh
                </h3>
                <p className="text-xs text-emerald-400 font-semibold tracking-wide">
                  Department of Computer Science &amp; Engineering
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              The official centralized platform for reporting, searching, and safely reclaiming
              misplaced belongings across academic departments, residential halls, and university grounds.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[11px] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Desk Authentication</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-800 text-[11px] font-medium">
                <span>Version 1.0</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Campus Directory</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link
                  href="/items"
                  className="hover:text-emerald-400 transition-colors inline-block"
                >
                  Browse Found Items
                </Link>
              </li>
              <li>
                <Link
                  href="/items?type=lost"
                  className="hover:text-emerald-400 transition-colors inline-block"
                >
                  Missing Items Board
                </Link>
              </li>
              <li>
                <Link
                  href="/items/new"
                  className="hover:text-emerald-400 transition-colors inline-block"
                >
                  Post a New Report
                </Link>
              </li>
              <li>
                <Link
                  href="/student"
                  className="hover:text-emerald-400 transition-colors inline-block"
                >
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-emerald-400 transition-colors inline-block"
                >
                  Account Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Physical Desk Location */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Physical Desk</span>
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Room 104, Ground Floor<br />
                  CSE Building, Islamic University,<br />
                  Kushtia, Bangladesh
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Sunday – Thursday<br />
                  <span className="text-slate-300 font-medium">9:00 AM – 4:00 PM</span>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <a
                  href="mailto:lostfound@cse.iu.ac.bd"
                  className="hover:text-white transition-colors"
                >
                  lostfound@cse.iu.ac.bd
                </a>
              </li>
            </ul>
          </div>

          {/* University Portal Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>University Portals</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <a
                  href="https://www.iu.ac.bd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-white font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span>IU Official Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.iu.ac.bd/faculty/cse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Dept. of CSE</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.iu.ac.bd/central-library"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Central Library</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <span className="text-slate-500">Central Desk: CSE Room 104</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Clean, Modern Bottom Copyright & Guidelines Bar */}
        <div className="mt-14 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} Department of Computer Science &amp; Engineering, Islamic University, Kushtia, Bangladesh. All rights reserved.
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <Link href="/items" className="hover:text-emerald-400 transition-colors">
              Browse
            </Link>
            <span className="text-slate-700">·</span>
            <Link href="/items/new" className="hover:text-emerald-400 transition-colors">
              Report
            </Link>
            <span className="text-slate-700">·</span>
            <span className="text-slate-500">Safe Campus Verification Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
