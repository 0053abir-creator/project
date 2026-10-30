// Pure client-safe formatting and status utilities (no Node/MongoDB dependencies)

// Format friendly date ("Oct 28, 2026")
export function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
}

// Relative time format ("2h ago", "yesterday")
export function timeAgo(dateString) {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    const seconds = Math.floor((new Date() - d) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  } catch {
    return "";
  }
}

// Status styling configurations
export const STATUS_CONFIG = {
  open: {
    label: "Open",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
    textColor: "text-blue-700 dark:text-blue-300",
    borderColor: "border-blue-200 dark:border-blue-800",
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border-blue-300",
  },
  claim_pending: {
    label: "Claim Pending",
    bgColor: "bg-amber-50 dark:bg-amber-950/40",
    textColor: "text-amber-700 dark:text-amber-300",
    borderColor: "border-amber-200 dark:border-amber-800",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border-amber-300",
  },
  returned: {
    label: "Returned",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    textColor: "text-emerald-700 dark:text-emerald-300",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-300",
  },
  closed: {
    label: "Closed",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    textColor: "text-gray-700 dark:text-gray-400",
    borderColor: "border-gray-200 dark:border-gray-700",
    badgeClass: "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-300",
  },
};

export const CLAIM_STATUS_CONFIG = {
  pending: {
    label: "Under Review",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border-amber-300",
  },
  approved: {
    label: "Approved",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-300",
  },
  rejected: {
    label: "Rejected",
    badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 border-rose-300",
  },
};
