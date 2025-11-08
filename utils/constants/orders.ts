export const PaymentStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  DECLINED: "DECLINED",
} as const;

export const OrderStatus = {
  PENDING: "PENDING",
  DELIVERING: "DELIVERING",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export const SortOrder = {
  ASC: "asc",
  DESC: "desc",
} as const;

export type SortOrderType = "asc" | "desc";
