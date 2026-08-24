import React from "react";
import { Badge } from "./ui/badge";

const statusConfig = {
  active: { label: "Active", className: "bg-success/10 text-success hover:bg-success/20" },
  pending: { label: "Pending", className: "bg-warning/10 text-warning hover:bg-warning/20" },
  completed: { label: "Completed", className: "bg-success/10 text-success hover:bg-success/20" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive hover:bg-destructive/20" },
  approved: { label: "Approved", className: "bg-success/10 text-success hover:bg-success/20" },
  suspended: { label: "Suspended", className: "bg-destructive/10 text-destructive hover:bg-destructive/20" },
  funding: { label: "Funding", className: "bg-warning/10 text-warning hover:bg-warning/20" },
  funded: { label: "Funded", className: "bg-success/10 text-success hover:bg-success/20" },
};

export function StatusBadge({ status }) {
  // 🔥 safety check (VERY IMPORTANT)
  if (!status || !statusConfig[status]) {
    return null;
  }

  const config = statusConfig[status];

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
}