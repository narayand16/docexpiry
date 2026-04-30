import { DocumentStatus } from "@/types";

export function computeStatus(expiryDate: string): DocumentStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) return "expired";
  if (diffDays <= 30) return "critical";
  if (diffDays <= 90) return "upcoming";
  return "safe";
}
