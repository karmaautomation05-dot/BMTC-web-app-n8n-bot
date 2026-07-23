import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmt(dateStr: string, opts?: Intl.DateTimeFormatOptions): string {
  const d = new Date(dateStr);
  return d.toLocaleString("en-IN", { timeZone: "UTC", ...opts });
}

export function fmtDate(dateStr: string, opts?: Intl.DateTimeFormatOptions): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { timeZone: "UTC", ...opts });
}
