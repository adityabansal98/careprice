export interface Procedure {
  cpt_code: string;
  name: string;
  category: string;
  description: string;
  insights: string[];
  costComponents?: CostComponentDefinition[];
}

// Cost component types for detailed breakdown
export type CostComponentType = "cpt_based" | "estimated";

export interface CostComponentDefinition {
  id: string;
  name: string;
  type: CostComponentType;
  cptCode?: string; // If CPT-based, the related code
  description: string;
  percentOfTotal: { min: number; max: number }; // Typical % range of total cost
}

// Calculated cost component with actual dollar amounts
export interface CalculatedCostComponent {
  id: string;
  name: string;
  type: CostComponentType;
  cptCode?: string;
  description: string;
  grossChargeMin: number;
  grossChargeMax: number;
  oopMin: number;
  oopMax: number;
}

export interface Review {
  id: string;
  hospitalId: string;
  author: string;
  date: string;
  rating: number;
  title: string;
  content: string;
  procedureCategory?: string;
  helpful: number;
  source: "google" | "healthgrades" | "yelp";
}

// CMS HCAHPS (Hospital Consumer Assessment of Healthcare Providers and Systems)
export interface HCAHPSMetrics {
  hospitalId: string;
  overallRating: number; // 1-5 stars
  recommendationRate: number; // percentage
  surveyResponseCount: number;
  metrics: {
    communicationWithNurses: number; // 1-5
    communicationWithDoctors: number; // 1-5
    responsivenessOfStaff: number; // 1-5
    painManagement: number; // 1-5
    communicationAboutMedicines: number; // 1-5
    cleanlinessRating: number; // 1-5
    quietnessRating: number; // 1-5
  };
  lastUpdated: string; // Quarter like "Q4 2025"
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
  gross_charge_min: number;
  gross_charge_max: number;
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
  website: string;
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

// User's insurance profile for personalized cost calculation
export interface InsuranceProfile {
  deductibleRemaining: number;  // How much deductible is left to pay (e.g., $800)
  coinsurancePercent: number;   // User's share after deductible (e.g., 20)
  oopMaxRemaining: number;      // How much until OOP max is hit (e.g., $4500)
}

// Calculated out-of-pocket cost breakdown
export interface CostBreakdown {
  procedureCost: number;        // The insurance-negotiated price
  deductiblePortion: number;    // Amount applied to deductible
  coinsurancePortion: number;   // Amount paid as coinsurance
  totalOutOfPocket: number;     // What user actually pays
  remainingDeductible: number;  // Deductible left after this procedure
  remainingOopMax: number;      // OOP max left after this procedure
}
