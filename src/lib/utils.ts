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

export function validateZipCode(zip: string): boolean {
  return /^\d{5}$/.test(zip);
}

import type { InsuranceProfile, CostBreakdown } from "@/types";

/**
 * Calculate what the user will actually pay out-of-pocket
 * based on their insurance profile (deductible, coinsurance, OOP max)
 */
export function calculateOutOfPocket(
  procedureCost: number,
  profile: InsuranceProfile
): CostBreakdown {
  let remainingCost = procedureCost;
  let deductiblePortion = 0;
  let coinsurancePortion = 0;
  let remainingDeductible = profile.deductibleRemaining;
  let remainingOopMax = profile.oopMaxRemaining;

  // If already hit OOP max, user pays nothing
  if (remainingOopMax <= 0) {
    return {
      procedureCost,
      deductiblePortion: 0,
      coinsurancePortion: 0,
      totalOutOfPocket: 0,
      remainingDeductible,
      remainingOopMax: 0,
    };
  }

  // Step 1: Apply to deductible first
  if (remainingDeductible > 0) {
    deductiblePortion = Math.min(remainingCost, remainingDeductible);
    remainingCost -= deductiblePortion;
    remainingDeductible -= deductiblePortion;
  }

  // Step 2: Apply coinsurance to the rest
  if (remainingCost > 0) {
    coinsurancePortion = remainingCost * (profile.coinsurancePercent / 100);
  }

  // Step 3: Calculate total and check against OOP max
  let totalOutOfPocket = deductiblePortion + coinsurancePortion;

  // Cap at remaining OOP max
  if (totalOutOfPocket > remainingOopMax) {
    totalOutOfPocket = remainingOopMax;
    // Adjust portions proportionally if capped
    const ratio = remainingOopMax / (deductiblePortion + coinsurancePortion);
    deductiblePortion = deductiblePortion * ratio;
    coinsurancePortion = coinsurancePortion * ratio;
  }

  remainingOopMax -= totalOutOfPocket;

  return {
    procedureCost,
    deductiblePortion: Math.round(deductiblePortion),
    coinsurancePortion: Math.round(coinsurancePortion),
    totalOutOfPocket: Math.round(totalOutOfPocket),
    remainingDeductible: Math.round(remainingDeductible),
    remainingOopMax: Math.round(remainingOopMax),
  };
}

