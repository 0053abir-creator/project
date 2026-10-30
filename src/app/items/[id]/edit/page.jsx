"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { ItemForm } from "@/components/ItemForm";
import { Edit, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditItemPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadItem() {
      try {
        const res = await fetch(`/api/items/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load item.");
        setItem(data.item);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadItem();
  }, [id]);

  if (authLoading || loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading item editor...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Cannot Edit Item</h2>
        <p className="text-sm text-slate-500">{error || "Item not found."}</p>
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

  // Authorization check
  const isOwner = user && item.reportedBy && item.reportedBy.toString() === user.id.toString();
  const isAdmin = user && user.role === "admin";

  if (!isOwner && !isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
        <p className="text-sm text-slate-500">
          You are not authorized to edit this report.
        </p>
      </div>
    );
  }

  if (isOwner && !isAdmin && item.status !== "open") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Report Cannot Be Edited</h2>
        <p className="text-sm text-slate-500">
          This item report is currently '{item.status}'. Only reports in 'open' status can be edited by students.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
          <Edit className="w-4 h-4" />
          <span>Edit Report</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Update Item Details
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Modify the information for "{item.title}".
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <ItemForm initialData={item} isEdit={true} />
      </div>
    </div>
  );
}
