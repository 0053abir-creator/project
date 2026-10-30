"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Calendar,
  MapPin,
  FileText,
  PhoneCall,
  Save,
  AlertCircle,
  Tag,
} from "lucide-react";
import config from "@/lib/config";

export function ItemForm({ initialData = null, isEdit = false }) {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    type: initialData?.type || "found",
    title: initialData?.title || "",
    description: initialData?.description || "",
    categoryId: initialData?.categoryId || "",
    location: initialData?.location || config.campusLocations[0] || "",
    customLocation: "",
    dateOccurred:
      initialData?.dateOccurred || new Date().toISOString().split("T")[0],
    contactPreference: initialData?.contactPreference || "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.categories) {
          setCategories(data.categories);
          if (!formData.categoryId && data.categories.length > 0) {
            setFormData((prev) => ({
              ...prev,
              categoryId: prev.categoryId || data.categories[0].id,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const finalLocation =
      formData.location === "Other Campus Area" && formData.customLocation.trim()
        ? formData.customLocation.trim()
        : formData.location;

    const payload = {
      type: formData.type,
      title: formData.title.trim(),
      description: formData.description.trim(),
      categoryId: formData.categoryId,
      location: finalLocation,
      dateOccurred: formData.dateOccurred,
      contactPreference: formData.contactPreference.trim(),
    };

    setSubmitting(true);
    try {
      const url = isEdit ? `/api/items/${initialData.id || initialData._id}` : "/api/items";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details && Array.isArray(data.details)) {
          setError(data.details.join(", "));
        } else {
          setError(data.error || "Failed to save item report.");
        }
        return;
      }

      // Success
      const targetId = isEdit ? initialData.id || initialData._id : data.item?.id || data.item?._id;
      router.push(`/items/${targetId}`);
      router.refresh();
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* PRD Section 10: Privacy and Security Warning */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Privacy Notice for Student Safety:</span>
          Do not include sensitive personal details such as exact student ID card numbers, bank PINs, or national ID numbers in the description. The claimant will describe identifying marks to prove ownership before verification.
        </div>
      </div>

      {/* 1. Item Type Toggle */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Report Type <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, type: "found" }))}
            className={`p-3.5 rounded-xl border text-center font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              formData.type === "found"
                ? "bg-iugreen-800 text-white border-iugreen-800 shadow-md shadow-iugreen-800/20"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span>I Found an Item</span>
          </button>

          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, type: "lost" }))}
            className={`p-3.5 rounded-xl border text-center font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              formData.type === "lost"
                ? "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span>I Lost an Item</span>
          </button>
        </div>
      </div>

      {/* 2. Item Title */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Item Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Casio Scientific Calculator, Brown Leather Wallet, Blue Water Bottle..."
          className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          required
        />
        <div className="flex justify-between text-[11px] text-slate-400 mt-1">
          <span>Between 3 and 100 characters</span>
          <span>{formData.title.length} / 100</span>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-slate-500" />
          <span>Category</span> <span className="text-rose-500">*</span>
        </label>
        <select
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
          required
        >
          {categories.map((cat) => (
            <option key={cat.id || cat._id} value={cat.id || cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Date Occurred */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Date Occurred</span> <span className="text-rose-500">*</span>
        </label>
        <input
          type="date"
          name="dateOccurred"
          value={formData.dateOccurred}
          onChange={handleChange}
          max={new Date().toISOString().split("T")[0]}
          className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
          required
        />
      </div>

      {/* 4. Location Selector */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <span>Campus Location</span> <span className="text-rose-500">*</span>
        </label>
        <select
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
          required
        >
          {config.campusLocations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        {formData.location === "Other Campus Area" && (
          <input
            type="text"
            name="customLocation"
            value={formData.customLocation}
            onChange={handleChange}
            placeholder="Specify campus building, room or corridor..."
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 mt-2"
            required
          />
        )}
      </div>

      {/* 5. Contact Preference */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
          <span>Contact Preference / Safekeeping Location</span>
        </label>
        <input
          type="text"
          name="contactPreference"
          value={formData.contactPreference}
          onChange={handleChange}
          placeholder="e.g. Handed over to CSE Office, Left with Library Reception, or Phone..."
          className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
        />
        <p className="text-[11px] text-slate-400 mt-1">
          Private contact details are masked from other students until verified by admin.
        </p>
      </div>

      {/* 6. Detailed Description */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>Detailed Description</span> <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={5}
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe color, brand, approximate time, and where it was found or lost. Leave key identifying marks unmentioned for ownership verification."
          className="w-full text-sm px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          required
        />
        <div className="flex justify-between text-[11px] text-slate-400 mt-1">
          <span>Minimum 10 characters</span>
          <span>{formData.description.length} / 1000</span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 text-sm font-extrabold text-white bg-iugreen-800 hover:bg-iugreen-900 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          <span>{submitting ? "Saving..." : isEdit ? "Update Report" : "Publish Report"}</span>
        </button>
      </div>
    </form>
  );
}
