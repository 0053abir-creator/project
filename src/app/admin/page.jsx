"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { StatusBadge, TypeBadge } from "@/components/StatusBadge";
import { HandoverModal } from "@/components/HandoverModal";
import {
  LayoutDashboard,
  Inbox,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  BarChart3,
  Archive,
  Tag,
  PlusCircle,
  RefreshCw,
  AlertCircle,
  Search,
  ExternalLink,
  Trash2,
  Check,
  X,
  FileText,
} from "lucide-react";
import { formatDate, timeAgo } from "@/lib/formatters";

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("claims"); // "claims" | "returns" | "items" | "categories" | "metrics"
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");

  // Review Claim State
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [reviewAction, setReviewAction] = useState(""); // "approved" | "rejected"
  const [reviewNote, setReviewNote] = useState("");
  const [reviewing, setReviewing] = useState(false);

  // Handover Modal State
  const [handoverClaim, setHandoverClaim] = useState(null);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);

  // Add Category State
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  // All Items Tab State
  const [allItems, setAllItems] = useState([]);
  const [itemSearch, setItemSearch] = useState("");
  const [itemTypeFilter, setItemTypeFilter] = useState("all");
  const [itemStatusFilter, setItemStatusFilter] = useState("all");

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [reportsRes, itemsRes] = await Promise.all([
        fetch("/api/reports"),
        fetch("/api/items?limit=100"),
      ]);

      const [reports, items] = await Promise.all([reportsRes.json(), itemsRes.json()]);

      if (reports.success) setReportsData(reports);
      if (items.success) setAllItems(items.items || []);
    } catch (err) {
      console.error("Failed to load admin reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/student");
      } else {
        fetchDashboardData();
      }
    }
  }, [user, authLoading]);

  // Handle Review Claim (Approve or Reject)
  const handleReviewClaim = async (e) => {
    e.preventDefault();
    if (!selectedClaim || !reviewAction) return;

    setReviewing(true);
    try {
      const res = await fetch(`/api/claims/${selectedClaim.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: reviewAction,
          reviewNote: reviewNote.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to review claim.");

      setActionMessage(
        `Claim ${reviewAction === "approved" ? "approved" : "rejected"} successfully.`
      );
      setSelectedClaim(null);
      setReviewNote("");
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    } finally {
      setReviewing(false);
    }
  };

  // Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setAddingCategory(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add category.");

      setNewCategoryName("");
      setActionMessage(`Category "${data.category.name}" added successfully.`);
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    } finally {
      setAddingCategory(false);
    }
  };

  // Close Item Report
  const handleCloseItem = async (itemId) => {
    if (!confirm("Are you sure you want to mark this item as Closed?")) return;
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });
      if (res.ok) {
        setActionMessage("Item marked as closed.");
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Reseed Demo Data
  const handleReseed = async () => {
    if (!confirm("Reset database with fresh campus sample data?")) return;
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setActionMessage("Database reset with fresh sample data!");
        fetchDashboardData();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading Admin Desk Portal...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  const metrics = reportsData?.metrics || {
    totalItems: 0,
    statusCounts: { open: 0, claim_pending: 0, returned: 0, closed: 0 },
    typeCounts: { lost: 0, found: 0 },
    pendingClaimsCount: 0,
    returnedCount: 0,
  };

  const filteredItems = allItems.filter((item) => {
    if (itemTypeFilter !== "all" && item.type !== itemTypeFilter) return false;
    if (itemStatusFilter !== "all" && item.status !== itemStatusFilter) return false;
    if (itemSearch.trim()) {
      const s = itemSearch.toLowerCase();
      return (
        item.title?.toLowerCase().includes(s) ||
        item.description?.toLowerCase().includes(s) ||
        item.location?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header with Official IU Logo */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-white p-1 border-2 border-iugreen-600 shadow-md flex items-center justify-center shrink-0">
            <img
              src="/iu-logo.png"
              alt="Islamic University Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-iugreen-800 uppercase tracking-wider mb-0.5">
              <span>Islamic University, Kushtia, Bangladesh · CSE Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Lost &amp; Found Admin Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Review ownership claims, verify student identities, record physical returns, and manage campus categories.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            title="Refresh statistics"
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleReseed}
            className="px-3.5 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors shadow-sm"
          >
            Reset Sample Data
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage("")} className="text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Reports
          </div>
          <div className="text-3xl font-black text-slate-900">{metrics.totalItems}</div>
          <div className="text-[11px] text-slate-500">
            {metrics.typeCounts.found} Found · {metrics.typeCounts.lost} Lost
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Claims</span>
          </div>
          <div className="text-3xl font-black text-amber-600">
            {metrics.pendingClaimsCount}
          </div>
          <div className="text-[11px] text-slate-500">Awaiting proof review</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Successfully Reunited</span>
          </div>
          <div className="text-3xl font-black text-emerald-600">{metrics.returnedCount}</div>
          <div className="text-[11px] text-slate-500">Returned to rightful owners</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Active Open Items
          </div>
          <div className="text-3xl font-black text-blue-600">
            {metrics.statusCounts.open}
          </div>
          <div className="text-[11px] text-slate-500">Available to search &amp; claim</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 gap-2 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("claims")}
          className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "claims"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Pending Claims ({reportsData?.pendingClaimsQueue?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("returns")}
          className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "returns"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Returns Audit Log ({reportsData?.recentReturns?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("items")}
          className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "items"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Manage Items ({allItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "categories"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Manage Categories ({reportsData?.categoryBreakdown?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("metrics")}
          className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "metrics"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Reports &amp; Analytics</span>
        </button>
      </div>

      {/* Tab 1: Pending Claims Queue */}
      {activeTab === "claims" && (
        <div className="space-y-4">
          {reportsData?.pendingClaimsQueue?.length > 0 ? (
            <div className="space-y-4">
              {reportsData.pendingClaimsQueue.map((claim) => (
                <div
                  key={claim.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-0.5">
                        Claim on Item:
                      </span>
                      <Link
                        href={`/items/${claim.itemId}`}
                        className="text-lg font-bold text-slate-900 hover:text-emerald-700 transition-colors flex items-center gap-1.5"
                      >
                        <span>{claim.itemTitle}</span>
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                      </Link>
                      <div className="text-xs text-slate-500">
                        Location: {claim.itemLocation} · Reported {timeAgo(claim.createdAt)}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-right">
                      <div className="font-bold text-slate-900">{claim.claimantName}</div>
                      <div className="text-slate-500">ID: {claim.claimantStudentId}</div>
                      <div className="text-slate-400">{claim.claimantDept}</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1">
                      Submitted Ownership Proof:
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 leading-relaxed font-mono">
                      "{claim.proofDescription}"
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => {
                        setSelectedClaim(claim);
                        setReviewAction("rejected");
                        setReviewNote("Proof details did not match verified item attributes.");
                      }}
                      className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Claim</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedClaim(claim);
                        setReviewAction("approved");
                        setReviewNote("Proof verified against physical item. Approved for collection at Room 104.");
                      }}
                      className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Claim</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">Claim verification queue is empty</h3>
              <p className="text-xs text-slate-500">All submitted claims have been processed.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Returns Audit Log */}
      {activeTab === "returns" && (
        <div className="space-y-4">
          {reportsData?.recentReturns?.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-4">Item Title</th>
                    <th className="p-4">Received By (Student)</th>
                    <th className="p-4">Handed Over By</th>
                    <th className="p-4">Verification Notes</th>
                    <th className="p-4">Date &amp; Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reportsData.recentReturns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900">{ret.itemTitle}</td>
                      <td className="p-4 text-emerald-800 font-semibold">{ret.receivedBy}</td>
                      <td className="p-4 text-slate-600">{ret.handedOverByName}</td>
                      <td className="p-4 max-w-xs truncate text-slate-500">{ret.notes || "—"}</td>
                      <td className="p-4 text-slate-400">{formatDate(ret.returnedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">No returns recorded yet</h3>
              <p className="text-xs text-slate-500">
                When an approved claim is physically handed over to a student, record it to maintain an audit trail.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Manage All Items */}
      {activeTab === "items" && (
        <div className="space-y-4">
          {/* Item filter controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                placeholder="Search items..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={itemTypeFilter}
                onChange={(e) => setItemTypeFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="all">All Types</option>
                <option value="found">Found Only</option>
                <option value="lost">Lost Only</option>
              </select>

              <select
                value={itemStatusFilter}
                onChange={(e) => setItemStatusFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="claim_pending">Claim Pending</option>
                <option value="returned">Returned</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Type</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Reported By</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <TypeBadge type={item.type} />
                    </td>
                    <td className="p-4 font-bold text-slate-900 max-w-xs truncate">
                      <Link href={`/items/${item.id}`} className="hover:text-emerald-700">
                        {item.title}
                      </Link>
                    </td>
                    <td className="p-4 text-slate-500">{item.categoryName}</td>
                    <td className="p-4 text-slate-500 max-w-xs truncate">{item.location}</td>
                    <td className="p-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="p-4 text-slate-500">{item.reporterName}</td>
                    <td className="p-4 text-right space-x-1">
                      {item.status !== "closed" && item.status !== "returned" && (
                        <button
                          onClick={() => handleCloseItem(item.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                        >
                          Close
                        </button>
                      )}
                      <Link
                        href={`/items/${item.id}/edit`}
                        className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg inline-block"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Manage Categories */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Category Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Add New Category</h3>
            <p className="text-xs text-slate-500">
              Create a new category for students to classify lost or found belongings.
            </p>

            <form onSubmit={handleAddCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Sports Equipment, Laboratory Gear..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={addingCategory}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{addingCategory ? "Adding..." : "Add Category"}</span>
              </button>
            </form>
          </div>

          {/* Categories List with Item Counts */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Current Campus Categories</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reportsData?.categoryBreakdown?.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/60"
                >
                  <span className="font-semibold text-xs text-slate-800">{cat.name}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    {cat.count} items
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Analytics & Reports */}
      {activeTab === "metrics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Status Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(metrics.statusCounts).map(([status, count]) => {
                  const pct =
                    metrics.totalItems > 0
                      ? Math.round((count / metrics.totalItems) * 100)
                      : 0;
                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700 capitalize">
                          {status.replace("_", " ")}
                        </span>
                        <span className="text-slate-500">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly Activity */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Items Reported per Week</h3>
              <div className="space-y-3">
                {reportsData?.weeklyReported?.map((week, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">
                      {week.label} ({week.start})
                    </span>
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                      {week.count} reports
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Claim Review Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                Confirm Claim {reviewAction === "approved" ? "Approval" : "Rejection"}
              </h3>
              <button
                onClick={() => setSelectedClaim(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewClaim} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                <div>
                  Item: <strong className="text-slate-800">{selectedClaim.itemTitle}</strong>
                </div>
                <div>
                  Claimant:{" "}
                  <strong className="text-slate-800">
                    {selectedClaim.claimantName} ({selectedClaim.claimantStudentId})
                  </strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Official Verification Note (Visible to Student)
                </label>
                <textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="e.g. Identity confirmed, proof verified, or reason for rejection..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedClaim(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewing}
                  className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm ${
                    reviewAction === "approved"
                      ? "bg-emerald-700 hover:bg-emerald-800"
                      : "bg-rose-700 hover:bg-rose-800"
                  }`}
                >
                  {reviewing
                    ? "Processing..."
                    : reviewAction === "approved"
                    ? "Confirm Approval"
                    : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
