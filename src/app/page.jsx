"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  MapPin,
  Building2,
  CheckCircle,
  FileText,
  UserCheck,
} from "lucide-react";
import { ItemCard } from "@/components/ItemCard";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentFound, setRecentFound] = useState([]);
  const [recentLost, setRecentLost] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ total: 0, returned: 0, open: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [foundRes, lostRes, catRes, itemsRes] = await Promise.all([
          fetch("/api/items?type=found&limit=4"),
          fetch("/api/items?type=lost&limit=4"),
          fetch("/api/categories"),
          fetch("/api/items?limit=100"),
        ]);

        const [foundData, lostData, catData, itemsData] = await Promise.all([
          foundRes.json(),
          lostRes.json(),
          catRes.json(),
          itemsRes.json(),
        ]);

        if (foundData.items) setRecentFound(foundData.items);
        if (lostData.items) setRecentLost(lostData.items);
        if (catData.categories) setCategories(catData.categories.slice(0, 7));

        if (itemsData.items) {
          const all = itemsData.items;
          const returnedCount = all.filter((i) => i.status === "returned").length;
          const openCount = all.filter((i) => i.status === "open").length;
          setStats({
            total: itemsData.total || all.length,
            returned: returnedCount,
            open: openCount,
          });
        }
      } catch (err) {
        console.error("Failed to load home page data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/items?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/items");
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section with Official IU Green Theme */}
      <section className="relative overflow-hidden bg-gradient-to-b from-iugreen-950 via-iugreen-900 to-slate-950 text-white pt-16 pb-28 px-4 sm:px-6 lg:px-8 border-b-4 border-iugreen-600">
        {/* Modern decorative ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -bottom-20 right-10 w-72 h-72 bg-iugreen-500/10 blur-2xl pointer-events-none rounded-full" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          {/* Official IU Logo & University Pill */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-2 shadow-2xl border-2 border-emerald-400/50 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
              <img
                src="/iu-logo.png"
                alt="Islamic University Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-iugreen-800/80 border border-emerald-500/30 text-emerald-100 text-xs font-semibold backdrop-blur-md shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Department of Computer Science &amp; Engineering</span>
              <span className="text-emerald-400">·</span>
              <a
                href="https://www.iu.ac.bd/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1 underline font-bold"
              >
                <span>iu.ac.bd</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Islamic University, Kushtia, Bangladesh <br />
            <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
              Campus Lost &amp; Found Portal
            </span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            The official student-first portal to quickly search found items, report lost belongings,
            and claim ownership with secure physical desk verification at Room 104.
          </p>

          {/* Quick Metrics Live Strip */}
          <div className="flex items-center justify-center gap-6 sm:gap-12 py-2 text-xs">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-black text-white">{stats.total || "6+"}</div>
              <div className="text-emerald-200/80 text-[11px] font-medium">Campus Reports</div>
            </div>
            <div className="h-6 w-px bg-emerald-500/30" />
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-black text-emerald-300">{stats.open || "4+"}</div>
              <div className="text-emerald-200/80 text-[11px] font-medium">Active Open Items</div>
            </div>
            <div className="h-6 w-px bg-emerald-500/30" />
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-black text-white">{stats.returned || "2+"}</div>
              <div className="text-emerald-200/80 text-[11px] font-medium">Safely Reunited</div>
            </div>
          </div>

          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-2.5 p-2 bg-white rounded-2xl shadow-2xl shadow-slate-950/40 border border-slate-100"
          >
            <div className="flex-1 flex items-center gap-3 px-3 text-slate-800">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keyword (calculator, wallet, ID card, keys, notebook)..."
                className="w-full text-sm py-2.5 bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400 font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-iugreen-800 hover:bg-iugreen-900 text-white text-sm font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0 active:scale-98"
            >
              <span>Search Campus</span>
            </button>
          </form>

          {/* Category quick filters */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
              <span className="text-emerald-200/70 font-medium">Popular:</span>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/items?category=${cat.id}`}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10 hover:scale-105"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust & How It Works Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-lg hover:shadow-xl transition-all duration-300 space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-iugreen-50 text-iugreen-800 flex items-center justify-center font-black text-lg border border-iugreen-200 group-hover:bg-iugreen-800 group-hover:text-white transition-colors">
              1
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">1. Report or Search</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Post what you lost or found in under a minute with campus location and date.
              Browse active listings across IU academic buildings and residential halls.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-lg hover:shadow-xl transition-all duration-300 space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black text-lg border border-amber-200 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              2
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">2. Submit Claim with Proof</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Recognize your belonging? Submit a claim explaining unique marks, stickers, or
              internal contents that only the true owner would know.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-lg hover:shadow-xl transition-all duration-300 space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-black text-lg border border-emerald-200 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              3
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">3. Desk Verification &amp; Return</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The CSE Lost &amp; Found desk in Room 104 reviews the claim, verifies student identity, and
              safely hands the item back with an official return record.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Found Items Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-iugreen-600 animate-pulse" />
              <h2 className="text-2xl font-black text-slate-900">Recently Found Items</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Items found across Islamic University, Kushtia, Bangladesh waiting to be claimed.
            </p>
          </div>

          <Link
            href="/items?type=found"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-iugreen-800 hover:text-iugreen-900 transition-colors"
          >
            <span>View All Found Items</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-slate-200/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : recentFound.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentFound.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-800">No active found items right now</h4>
            <p className="text-xs text-slate-500">All found items have either been returned or none reported recently.</p>
          </div>
        )}
      </section>

      {/* Recent Lost Items Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <h2 className="text-2xl font-black text-slate-900">Recently Reported Lost</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Have you spotted any of these items around university premises?
            </p>
          </div>

          <Link
            href="/items?type=lost"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-800 transition-colors"
          >
            <span>View All Lost Items</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-slate-200/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : recentLost.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentLost.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-800">No missing reports currently</h4>
            <p className="text-xs text-slate-500">No items are currently reported lost.</p>
          </div>
        )}
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-iugreen-950 via-iugreen-800 to-iugreen-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border-2 border-iugreen-600">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-emerald-200">
              <Building2 className="w-3.5 h-3.5" />
              <span>Islamic University, Kushtia, Bangladesh</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black">
              Found Something on Campus Grounds?
            </h3>
            <p className="text-sm text-emerald-100 max-w-xl leading-relaxed">
              Help your fellow student by posting a report. It takes less than two minutes, and
              you can deposit the physical item at the CSE Department Desk (Room 104) for safe verification and return.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/items/new"
              className="px-6 py-3.5 bg-white text-iugreen-900 font-extrabold text-sm rounded-xl hover:bg-emerald-50 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-iugreen-800" />
              <span>Report an Item Now</span>
            </Link>
            <Link
              href="/items"
              className="px-6 py-3.5 bg-iugreen-900/80 hover:bg-iugreen-900 text-white font-bold text-sm rounded-xl transition-colors border border-emerald-500/40 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Browse All Items</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
