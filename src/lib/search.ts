import type { Hospital, Procedure, HospitalResult, SearchParams, InsuranceProvider, PriceInfo, PlanRates, PlanPriceRange, InsuranceRates } from "@/types";
import { calculateDistance } from "@/lib/utils";
import hospitalsData from "@/data/hospitals.json";
import proceduresData from "@/data/procedures.json";

const hospitals = hospitalsData as Hospital[];
const procedures = proceduresData as Procedure[];

/**
 * Calculate price info based on insurance selection
 * - No insurance: Cash price (single value)
 * - Insurance only: Aggregated range across all plans
 * - Insurance + Plan: Range for that specific plan
 */
function calculatePriceInfo(
  insuranceRates: InsuranceRates,
  cashPrice: number,
  insurance: InsuranceProvider | "cash",
  plan?: string
): PriceInfo {
  // Cash price scenario - single value
  if (insurance === "cash") {
    return {
      type: "cash",
      value: cashPrice,
    };
  }

  const providerRates = insuranceRates[insurance];

  // Insurance provider not found - fall back to cash
  if (!providerRates) {
    return {
      type: "cash",
      value: cashPrice,
    };
  }

  // Specific plan selected - show that plan's range
  if (plan && providerRates[plan]) {
    const planRange = providerRates[plan] as PlanPriceRange;
    return {
      type: "plan_range",
      min: planRange.min,
      max: planRange.max,
      planName: plan,
    };
  }

  // No plan selected - aggregate range across all plans for this insurance
  const allPlanRanges = Object.values(providerRates) as PlanPriceRange[];

  if (allPlanRanges.length === 0) {
    return {
      type: "cash",
      value: cashPrice,
    };
  }

  // Find the overall min and max across all plans
  const overallMin = Math.min(...allPlanRanges.map((r) => r.min));
  const overallMax = Math.max(...allPlanRanges.map((r) => r.max));

  return {
    type: "insurance_range",
    min: overallMin,
    max: overallMax,
  };
}

/**
 * Get display price for sorting (uses minimum of range or single value)
 */
export function getDisplayPrice(priceInfo: PriceInfo): number {
  if (priceInfo.type === "cash") {
    return priceInfo.value ?? 0;
  }
  return priceInfo.min ?? 0;
}

export function searchHospitals(params: SearchParams): HospitalResult[] {
  const { procedure: searchProcedure, zipCode, insurance, plan } = params;

  // Find matching procedure by CPT code or name
  const matchedProcedure = procedures.find(
    (p) =>
      p.cpt_code === searchProcedure ||
      p.name.toLowerCase().includes(searchProcedure.toLowerCase()) ||
      searchProcedure.toLowerCase().includes(p.cpt_code)
  );

  if (!matchedProcedure) {
    return [];
  }

  const results: HospitalResult[] = [];

  for (const hospital of hospitals) {
    const procedurePrice = hospital.prices[matchedProcedure.cpt_code];

    if (!procedurePrice) {
      continue;
    }

    const priceInfo = calculatePriceInfo(
      procedurePrice.insurance_rates,
      procedurePrice.cash_price,
      insurance,
      plan
    );

    const distance = calculateDistance(zipCode, hospital.zip);

    results.push({
      hospital,
      priceInfo,
      distance,
      procedure: matchedProcedure,
    });
  }

  // Default sort by price (lowest first, using min of range)
  return results.sort((a, b) => getDisplayPrice(a.priceInfo) - getDisplayPrice(b.priceInfo));
}

export function getProcedureByCode(cptCode: string): Procedure | undefined {
  return procedures.find((p) => p.cpt_code === cptCode);
}

export function searchProcedures(query: string): Procedure[] {
  const lowerQuery = query.toLowerCase();
  return procedures.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.cpt_code.includes(query) ||
      p.category.toLowerCase().includes(lowerQuery)
  );
}
