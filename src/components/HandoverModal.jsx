"use client";

import React, { useState } from "react";
import { X, ShieldCheck, AlertCircle } from "lucide-react";

export function HandoverModal({ item, claim, isOpen, onClose, onSuccess }) {
  const [receivedBy, setReceivedBy] = useState(
    claim?.claimant?.name
      ? `${claim.claimant.name} (${claim.claimant.studentId || ""})`
      : ""
  );
  const [notes, setNotes] = useState(
    "Verified student identity card in person. Received in good condition."
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !item || !claim) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!receivedBy.trim()) {
      setError("Please specify who received the item.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id || item._id,
          claimId: claim.id || claim._id,
          receivedBy: receivedBy.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to record handover.");
      }

      onSuccess(data.returnRecord);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-lg">Record Item Handover</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
            <div className="text-slate-500">
              Item: <span className="font-bold text-slate-800">{item.title}</span>
            </div>
            <div className="text-slate-500">
              Claimant:{" "}
              <span className="font-bold text-slate-800">
                {claim.claimant?.name || "Student"} (ID: {claim.claimant?.studentId || "N/A"})
              </span>
            </div>
            <div className="text-slate-500">
              Department:{" "}
              <span className="font-semibold text-slate-700">
                {claim.claimant?.department || "N/A"}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Received By (Name &amp; Student ID) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
              placeholder="e.g. Tanvir Hasan (2021-CSE-045)"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Handover Verification Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Physical ID card verified, register signed, item condition confirmed..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-extrabold text-white bg-iugreen-800 hover:bg-iugreen-900 rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{submitting ? "Recording..." : "Confirm Handover & Return"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
