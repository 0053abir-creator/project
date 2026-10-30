"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { StatusBadge, TypeBadge } from "@/components/StatusBadge";
import {
  LayoutDashboard,
  Package,
  ShieldAlert,
  PlusCircle,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  ArrowRight,
  MapPin,
  Calendar,
} from "lucide-react";
import { formatDate, timeAgo } from "@/lib/formatters";

export default function StudentDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("reports"); // "reports" | "claims"
  const [myReports, setMyReports] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const fetchStudentData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const [reportsRes, claimsRes] = await Promise.all([
        fetch(`/api/items?reportedBy=${user.id}&limit=50`),
        fetch("/api/claims"),
      ]);

      const [reportsData, claimsData] = await Promise.all([
        reportsRes.json(),
        claimsRes.json(),
      ]);

      if (reportsData.items) setMyReports(reportsData.items);
      if (claimsData.claims) setMyClaims(claimsData.claims);
    } catch (err) {
      console.error("Failed to fetch student dashboard data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      fetchStudentData();
    }
  }, [user, authLoading]);

  const handleDeleteReport = async (itemId) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
      if (res.ok) {
        setMyReports((prev) => prev.filter((item) => item.id !== itemId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete.");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (authLoading || (!user && loadingData)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading student dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Student Welcome Header with Official IU Green Theme */}
      <div className="bg-gradient-to-r from-iugreen-950 via-iugreen-900 to-iugreen-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-2 border-iugreen-700">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white p-1 border border-iugreen-400 shadow-md flex items-center justify-center shrink-0">
            <img
              src="/iu-logo.png"
              alt="Islamic University Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-1">
            <div className="text-emerald-300 text-xs font-bold uppercase tracking-wider">
              Islamic University, Kushtia, Bangladesh · Student Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90">
              Student ID: <span className="font-semibold text-white">{user.studentId}</span> ·{" "}
              {user.department}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/items/new"
            className="px-4 py-2.5 bg-white text-iugreen-950 font-extrabold text-xs rounded-xl hover:bg-emerald-50 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-iugreen-800" />
            <span>Report Item</span>
          </Link>
          <Link
            href="/items"
            className="px-4 py-2.5 bg-iugreen-800/80 hover:bg-iugreen-800 text-white font-bold text-xs rounded-xl transition-colors border border-emerald-500/30 flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Search Campus</span>
          </Link>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("reports")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "reports"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Reported Items ({myReports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("claims")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "claims"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>My Submitted Claims ({myClaims.length})</span>
        </button>
      </div>

      {/* Tab 1: My Reports */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          {loadingData ? (
            <div className="p-8 text-center text-slate-400">Loading your reports...</div>
          ) : myReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myReports.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <TypeBadge type={item.type} />
                      <StatusBadge status={item.status} />
                    </div>

                    <Link href={`/items/${item.id}`}>
                      <h3 className="font-bold text-slate-900 text-base hover:text-emerald-700 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="pt-2 text-xs text-slate-400 space-y-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Date: {formatDate(item.dateOccurred)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/items/${item.id}`}
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      View Full Details &rarr;
                    </Link>

                    {item.status === "open" && (
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/items/${item.id}/edit`}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Report"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteReport(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">You haven't reported any items yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Lost something on campus or found an item left behind? Post a report to help reconnect items with owners.
              </p>
              <Link
                href="/items/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Your First Report</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Claims */}
      {activeTab === "claims" && (
        <div className="space-y-4">
          {loadingData ? (
            <div className="p-8 text-center text-slate-400">Loading your claims...</div>
          ) : myClaims.length > 0 ? (
            <div className="space-y-4">
              {myClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Claim on Item:</div>
                      <Link
                        href={`/items/${claim.itemId}`}
                        className="font-bold text-slate-900 text-base hover:text-emerald-700 transition-colors"
                      >
                        {claim.item?.title || "Item Listing"}
                      </Link>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={claim.status} type="claim" />
                      <span className="text-xs text-slate-400">
                        Submitted {timeAgo(claim.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block">Your Proof Description:</span>
                      <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                        {claim.proofDescription}
                      </p>
                    </div>

                    {claim.reviewNote && (
                      <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900">
                        <span className="font-bold block mb-0.5">Admin Review Note:</span>
                        <span>{claim.reviewNote}</span>
                      </div>
                    )}

                    {claim.status === "approved" && (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>
                          Claim approved! Please visit CSE Building, Ground Floor, Room 104 with your Student ID card to collect the item.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">No claims submitted yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                If you lost an item that someone found on campus, browse the listings and click "Claim This Item" with identifying proof.
              </p>
              <Link
                href="/items?type=found"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                <Search className="w-4 h-4" />
                <span>Browse Found Items</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
