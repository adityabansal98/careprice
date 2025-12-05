export interface Procedure {
  cpt_code: string;
  name: string;
  category: string;
  description: string;
  insights: string[];
}

// Each plan now has a min/max range
export interface PlanPriceRange {
  min: number;
  max: number;
}

// Plan rates within an insurance provider - each plan has min/max
export interface PlanRates {
  [planName: string]: PlanPriceRange;
}

// Insurance rates now contain nested plan types with ranges
export interface InsuranceRates {
  aetna?: PlanRates;
  bcbs?: PlanRates;
  uhc?: PlanRates;
  cigna?: PlanRates;
  humana?: PlanRates;
  [key: string]: PlanRates | undefined;
}

export interface ProcedurePrice {
  gross_charge: number;
  cash_price: number;
  insurance_rates: InsuranceRates;
}

// Geographic coordinates for map display
export interface Coordinates {
  lat: number;
  lng: number;
}

// Financial assistance program offered by a hospital
export interface FinancialAssistance {
  available: boolean;
  discountPercent?: number;
  eligibilityCriteria?: string;
  programName?: string;
  incomeThreshold?: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  rating: number;
  dataFreshness: string;
  coordinates: Coordinates;
  financialAssistance?: FinancialAssistance;
  prices: {
    [cptCode: string]: ProcedurePrice;
  };
}

export interface SearchParams {
  procedure: string;
  zipCode: string;
  insurance: InsuranceProvider | "cash";
  plan?: string; // Optional plan name
}

export type InsuranceProvider = "aetna" | "bcbs" | "uhc" | "cigna" | "humana";

// Price is always either cash (single value) or a range
export interface PriceInfo {
  type: "cash" | "insurance_range" | "plan_range";
  value?: number; // For cash only
  min?: number; // For ranges
  max?: number; // For ranges
  planName?: string; // The specific plan if selected
}

export interface HospitalResult {
  hospital: Hospital;
  priceInfo: PriceInfo;
  distance: "close" | "medium" | "far";
  procedure: Procedure;
}

export type SortOption = "price" | "distance" | "rating";

export type ViewMode = "list" | "map";

// Available plans per insurance provider
export interface InsurancePlans {
  [provider: string]: string[];
}
