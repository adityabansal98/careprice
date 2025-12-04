import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateDistance(userZip: string, hospitalZip: string): "close" | "medium" | "far" {
  // Mock distance logic: same first 3 digits = close, same first 2 = medium, else far
  if (userZip.substring(0, 3) === hospitalZip.substring(0, 3)) {
    return "close";
  } else if (userZip.substring(0, 2) === hospitalZip.substring(0, 2)) {
    return "medium";
  }
  return "far";
}

export function getDistanceLabel(distance: "close" | "medium" | "far"): string {
  switch (distance) {
    case "close":
      return "< 5 miles";
    case "medium":
      return "5-15 miles";
    case "far":
      return "15+ miles";
  }
}

export function calculateConfidenceScore(dataFreshness: string): number {
  const freshnessDate = new Date(dataFreshness);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - freshnessDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff <= 30) return 95;
  if (daysDiff <= 60) return 85;
  if (daysDiff <= 90) return 75;
  if (daysDiff <= 180) return 60;
  return 50;
}

export function validateZipCode(zip: string): boolean {
  return /^\d{5}$/.test(zip);
}

