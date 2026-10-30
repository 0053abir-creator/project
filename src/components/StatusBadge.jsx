"use client";

import React from "react";
import { STATUS_CONFIG, CLAIM_STATUS_CONFIG } from "@/lib/formatters";
import { CheckCircle2, Clock, AlertCircle, Archive, ShieldCheck } from "lucide-react";

export function StatusBadge({ status, type = "item" }) {
  if (type === "claim") {
    const config = CLAIM_STATUS_CONFIG[status] || CLAIM_STATUS_CONFIG.pending;
    let Icon = Clock;
    if (status === "approved") Icon = CheckCircle2;
    if (status === "rejected") Icon = AlertCircle;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.badgeClass}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  }

  // Item status
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  let Icon = Clock;
  if (status === "open") Icon = Clock;
  if (status === "claim_pending") Icon = AlertCircle;
  if (status === "returned") Icon = ShieldCheck;
  if (status === "closed") Icon = Archive;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.badgeClass}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

export function TypeBadge({ type }) {
  const isFound = type === "found";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
        isFound
          ? "bg-iugreen-800 text-white shadow-sm"
          : "bg-rose-600 text-white shadow-sm"
      }`}
    >
      {isFound ? "Found Item" : "Lost Item"}
    </span>
  );
}
