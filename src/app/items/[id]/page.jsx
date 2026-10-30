"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { StatusBadge, TypeBadge } from "@/components/StatusBadge";
import { ClaimModal } from "@/components/ClaimModal";
import { HandoverModal } from "@/components/HandoverModal";
import {
  MapPin,
  Calendar,
  Clock,
  User,
  Tag,
  ShieldAlert,
  ShieldCheck,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Share2,
  PhoneCall,
  Lock,
} from "lucide-react";
import { formatDate, timeAgo } from "@/lib/formatters";

export default function ItemDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals state
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchItemDetails = async () => {
    try {
      const res = await fetch(`/api/items/${id}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load item details.");
      }
      setItem(data.item);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchItemDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item report? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete item.");
      router.push("/items");
    } catch (err) {
      alert(err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading item details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Item Not Found</h2>
        <p className="text-sm text-slate-500">{error || "The requested item report does not exist."}</p>
        <Link
          href="/items"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white text-sm font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Browse</span>
        </Link>
      </div>
    );
  }

  const isOwner = item.isOwner;
  const isAdmin = user?.role === "admin";
  const canEdit = isOwner ? item.status === "open" : isAdmin;
  const canDelete = isOwner ? item.status === "open" : isAdmin;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/items"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Items</span>
        </Link>

        {/* Owner or Admin action buttons */}
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/items/${item.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Edit className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Report</span>
            </Link>
          )}

          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors shadow-sm disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleting ? "Deleting..." : "Delete"}</span>
            </button>
          )}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Status Alerts */}
      {item.status === "returned" && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-900">
          <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Successfully Reunited with Owner</h4>
            <p className="text-xs text-emerald-800 mt-0.5">
              This item has been officially claimed, verified, and returned at the CSE Lost &amp; Found Desk.
            </p>
          </div>
        </div>
      )}

      {item.status === "claim_pending" && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900">
          <Clock className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Claim Verification in Progress</h4>
            <p className="text-xs text-amber-800 mt-0.5">
              An ownership claim for this item is currently pending review by the Lost &amp; Found Desk admin.
            </p>
          </div>
        </div>
      )}

      {/* User's own claim banner */}
      {item.userClaim && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 ${
            item.userClaim.status === "approved"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : item.userClaim.status === "rejected"
              ? "bg-rose-50 border-rose-200 text-rose-900"
              : "bg-blue-50 border-blue-200 text-blue-900"
          }`}
        >
          <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-sm">
              Your Claim Status:{" "}
              <span className="uppercase tracking-wider font-extrabold">
                {item.userClaim.status}
              </span>
            </h4>
            <p>
              <strong>Your submitted proof:</strong> {item.userClaim.proofDescription}
            </p>
            {item.userClaim.reviewNote && (
              <p className="font-medium text-slate-700">
                <strong>Admin Note:</strong> {item.userClaim.reviewNote}
              </p>
            )}
            {item.userClaim.status === "approved" && (
              <div className="pt-1 font-bold text-emerald-800">
                Please visit CSE Building, Ground Floor, Room 104 with your student identity card to collect this item.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Badges */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TypeBadge type={item.type} />
              <StatusBadge status={item.status} />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span>{item.categoryName}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {item.title}
          </h1>

          {/* Meta grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="block text-slate-400 text-[10px] uppercase font-bold">
                  Campus Location
                </span>
                <span className="font-semibold text-slate-800">{item.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="block text-slate-400 text-[10px] uppercase font-bold">
                  Date Occurred
                </span>
                <span className="font-semibold text-slate-800">
                  {formatDate(item.dateOccurred)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="block text-slate-400 text-[10px] uppercase font-bold">
                  Reported By
                </span>
                <span className="font-semibold text-slate-800">
                  {item.reporterName} {item.reporterDept ? `(${item.reporterDept})` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Item Description
            </h3>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>

          {/* Contact Preference & Safekeeping info */}
          <div className="pt-4 border-t border-slate-100 flex items-start gap-3 text-xs text-slate-500">
            <PhoneCall className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-700 block">
                Contact &amp; Safekeeping:
              </span>
              <span>{item.contactPreference}</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 sm:px-8 py-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Reported {timeAgo(item.createdAt)}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* If Item is open found item and user is not owner -> Claim Button */}
            {item.canClaim && (
              <button
                onClick={() => {
                  if (!user) {
                    router.push("/login");
                  } else {
                    setIsClaimModalOpen(true);
                  }
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-iugreen-800 hover:bg-iugreen-900 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Claim This Item</span>
              </button>
            )}

            {/* If Admin and active approved claim exists on item -> Record Handover */}
            {isAdmin && item.activeClaim && item.activeClaim.status === "approved" && item.status !== "returned" && (
              <button
                onClick={() => setIsHandoverModalOpen(true)}
                className="w-full sm:w-auto px-6 py-2.5 bg-iugreen-800 hover:bg-iugreen-900 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Record Handover / Return</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      <ClaimModal
        item={item}
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onSuccess={(newClaim) => {
          setActionSuccess("Claim submitted successfully! It is now under review by the desk admin.");
          fetchItemDetails();
        }}
      />

      {/* Handover Modal (Admin) */}
      {isAdmin && item.activeClaim && (
        <HandoverModal
          item={item}
          claim={item.activeClaim}
          isOpen={isHandoverModalOpen}
          onClose={() => setIsHandoverModalOpen(false)}
          onSuccess={(returnRecord) => {
            setActionSuccess("Handover recorded! Item marked as returned.");
            fetchItemDetails();
          }}
        />
      )}
    </div>
  );
}
