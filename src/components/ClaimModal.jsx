"use client";

import React, { useState } from "react";
import { X, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";

export function ClaimModal({ item, isOpen, onClose, onSuccess }) {
  const [proofDescription, setProofDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (proofDescription.trim().length < 10) {
      setError("Please describe your proof in at least 10 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id || item._id,
          proofDescription: proofDescription.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit claim.");
      }

      onSuccess(data.claim);
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Submit Ownership Claim</h3>
            <p className="text-xs text-slate-500 line-clamp-1">Item: {item.title}</p>
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

          {/* Verification advice notice */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-emerald-900 leading-relaxed">
            <ShieldAlert className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Admin Verification Process:</span>
              Describe specific identifying features not mentioned in the public post (e.g. unique scratches, stickers, screen lock wallpaper, internal contents, or serial numbers). The admin desk will inspect your proof before approving the claim.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Proof of Ownership <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={proofDescription}
              onChange={(e) => setProofDescription(e.target.value)}
              placeholder="e.g., Inside the front pouch there is a blue ink pen and a seminar library slip with my student ID..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 placeholder:text-slate-400"
              required
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Minimum 10 characters</span>
              <span>{proofDescription.length} / 1000</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-extrabold text-white bg-iugreen-800 hover:bg-iugreen-900 rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Claim</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
