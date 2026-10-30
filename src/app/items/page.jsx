"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FolderOpen,
  Calendar,
  MapPin,
} from "lucide-react";
import { ItemCard } from "@/components/ItemCard";
import config from "@/lib/config";

function BrowseItemsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filters state initialized from URL query params
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [type, setType] = useState(searchParams.get("type") || "all");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [location, setLocation] = useState(searchParams.get("location") || "all");
  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load categories once
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.categories) setCategories(data.categories);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Fetch items whenever filters or page changes
  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        if (type !== "all") params.set("type", type);
        if (category !== "all") params.set("category", category);
        if (status !== "all") params.set("status", status);
        if (location !== "all") params.set("location", location);
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        params.set("page", page.toString());
        params.set("limit", config.itemsPerPage.toString());

        const res = await fetch(`/api/items?${params.toString()}`);
        const data = await res.json();

        if (data.items) {
          setItems(data.items);
          setTotalPages(data.totalPages || 1);
          setTotalItems(data.total || 0);
        }
      } catch (err) {
        console.error("Failed to load items:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [search, type, category, status, location, from, to, page]);

  const handleResetFilters = () => {
    setSearch("");
    setType("all");
    setCategory("all");
    setStatus("all");
    setLocation("all");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Search Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Browse Campus Items
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search lost items, discover reported found belongings, or filter by location and category.
          </p>
        </div>

        {/* Search Bar & Type Tabs */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by keywords (e.g., calculator, card, wallet, keys)..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Type Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start lg:self-auto border border-slate-200">
            <button
              onClick={() => {
                setType("all");
                setPage(1);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                type === "all"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => {
                setType("found");
                setPage(1);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                type === "found"
                  ? "bg-iugreen-800 text-white shadow-sm"
                  : "text-slate-600 hover:text-iugreen-800"
              }`}
            >
              Found Items
            </button>
            <button
              onClick={() => {
                setType("lost");
                setPage(1);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                type === "lost"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-rose-700"
              }`}
            >
              Lost Items
            </button>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Filters &amp; Campus Locations</span>
          </div>
          {(type !== "all" ||
            category !== "all" ||
            status !== "all" ||
            location !== "all" ||
            from ||
            to ||
            search) && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open (Active)</option>
              <option value="claim_pending">Claim Pending</option>
              <option value="returned">Returned to Owner</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Campus Location
            </label>
            <select
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Campus Locations</option>
              {config.campusLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Occurred On / From
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Results Count & Current Filters Pill */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing <strong className="text-slate-800">{items.length}</strong> of{" "}
          <strong className="text-slate-800">{totalItems}</strong> items found
        </span>
        {totalPages > 1 && (
          <span>
            Page {page} of {totalPages}
          </span>
        )}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-200/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-lg">No items match your filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms or clearing specific filters to see more campus listings.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-xl text-xs font-bold transition-colors ${
                page === p
                  ? "bg-iugreen-800 text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function BrowseItemsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading campus items...</p>
        </div>
      }
    >
      <BrowseItemsContent />
    </Suspense>
  );
}
