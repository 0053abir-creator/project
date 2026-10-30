"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Calendar, Clock, ArrowRight, Tag, Sparkles } from "lucide-react";
import { StatusBadge, TypeBadge } from "./StatusBadge";
import { formatDate, timeAgo } from "@/lib/formatters";

export function ItemCard({ item }) {
  if (!item) return null;

  const isFound = item.type === "found";
  const isOpen = item.status === "open";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group relative">
      {/* Subtle top accent bar */}
      <div
        className={`h-1.5 w-full ${
          isFound ? "bg-gradient-to-r from-iugreen-600 to-emerald-400" : "bg-gradient-to-r from-rose-500 to-orange-400"
        }`}
      />

      <div className="p-5 flex-1 flex flex-col">
        {/* Header badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <TypeBadge type={item.type} />
          <StatusBadge status={item.status} />
        </div>

        {/* Category & Claim readiness indicator */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-iugreen-800 bg-iugreen-50 border border-iugreen-200/80 px-2.5 py-0.5 rounded-full">
            <Tag className="w-3 h-3 text-iugreen-600" />
            <span>{item.categoryName || "General"}</span>
          </div>

          {isFound && isOpen && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Claimable</span>
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/items/${item.id || item._id}`} className="group/title">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover/title:text-iugreen-800 transition-colors line-clamp-1 mb-2">
            {item.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed flex-1">
          {item.description}
        </p>

        {/* Location & Date Meta */}
        <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-500 mt-auto">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-medium text-slate-700">{item.location}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(item.dateOccurred)}</span>
            </span>

            {item.createdAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{timeAgo(item.createdAt)}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
          By {item.reporterName || "Campus Member"}
        </span>

        <Link
          href={`/items/${item.id || item._id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-iugreen-800 hover:text-iugreen-900 transition-colors group-hover:translate-x-0.5"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
