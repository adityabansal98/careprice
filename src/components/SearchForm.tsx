"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Search, MapPin, Shield, Stethoscope, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { validateZipCode } from "@/lib/utils";
import type { Procedure, InsuranceProvider, SearchParams } from "@/types";
import proceduresData from "@/data/procedures.json";

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
}

const INSURANCE_OPTIONS: Array<{ value: InsuranceProvider | "cash"; label: string }> = [
  { value: "cash", label: "Cash Price (No Insurance)" },
  { value: "aetna", label: "Aetna" },
  { value: "bcbs", label: "Blue Cross Blue Shield" },
  { value: "uhc", label: "UnitedHealthcare" },
  { value: "cigna", label: "Cigna" },
  { value: "humana", label: "Humana" },
];

// Available plan types per insurance provider
const PLAN_OPTIONS: Record<InsuranceProvider, string[]> = {
  aetna: ["PPO", "HMO", "EPO"],
  bcbs: ["PPO", "HMO", "POS"],
  uhc: ["PPO", "HMO", "EPO"],
  cigna: ["PPO", "HMO", "POS"],
  humana: ["PPO", "HMO", "EPO"],
};

export function SearchForm({ onSearch, isLoading = false }: SearchFormProps) {
  const [procedureQuery, setProcedureQuery] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [insurance, setInsurance] = useState<InsuranceProvider | "cash">("cash");
  const [plan, setPlan] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [zipError, setZipError] = useState("");

  const procedures = proceduresData as Procedure[];

  // Get available plans for selected insurance
  const availablePlans = useMemo(() => {
    if (insurance === "cash") return [];
    return PLAN_OPTIONS[insurance] || [];
  }, [insurance]);

  // Reset plan when insurance changes
  useEffect(() => {
    setPlan("");
  }, [insurance]);

  const filteredProcedures = useMemo(() => {
    if (!procedureQuery.trim()) return [];
    const query = procedureQuery.toLowerCase();
    return procedures.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.cpt_code.includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  }, [procedureQuery, procedures]);

  const handleProcedureSelect = useCallback((procedure: Procedure) => {
    setProcedureQuery(`${procedure.name} (${procedure.cpt_code})`);
    setShowSuggestions(false);
  }, []);

  const handleZipChange = useCallback((value: string) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 5);
    setZipCode(numericValue);
    if (numericValue.length === 5 && !validateZipCode(numericValue)) {
      setZipError("Please enter a valid 5-digit ZIP code");
    } else {
      setZipError("");
    }
  }, []);

  const handleInsuranceChange = useCallback((value: string) => {
    setInsurance(value as InsuranceProvider | "cash");
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!procedureQuery.trim()) return;
      if (!validateZipCode(zipCode)) {
        setZipError("Please enter a valid 5-digit ZIP code");
        return;
      }

      // Extract CPT code from selection
      const cptMatch = procedureQuery.match(/\((\d{5})\)/);
      const searchProcedure = cptMatch ? cptMatch[1] : procedureQuery;

      onSearch({
        procedure: searchProcedure,
        zipCode,
        insurance,
        plan: plan || undefined,
      });
    },
    [procedureQuery, zipCode, insurance, plan, onSearch]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/60 dark:shadow-slate-900/60 p-6 md:p-8 border-2 border-slate-100 dark:border-slate-800">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* Procedure Input with Autocomplete */}
          <div className="relative md:col-span-2 lg:col-span-2">
            <label
              htmlFor="procedure"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              <Stethoscope className="inline-block w-4 h-4 mr-1.5 -mt-0.5" />
              Procedure or CPT Code
            </label>
            <Input
              id="procedure"
              type="text"
              placeholder="e.g., MRI, 72148"
              value={procedureQuery}
              onChange={(e) => {
                setProcedureQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              icon={<Search className="h-5 w-5" />}
              aria-label="Search for a medical procedure"
              aria-autocomplete="list"
              aria-expanded={showSuggestions && filteredProcedures.length > 0}
            />
            {/* Autocomplete Dropdown */}
            {showSuggestions && filteredProcedures.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
                {filteredProcedures.map((procedure) => (
                  <button
                    key={procedure.cpt_code}
                    type="button"
                    className="w-full px-4 py-3 text-left hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                    onClick={() => handleProcedureSelect(procedure)}
                  >
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {procedure.name}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      CPT: {procedure.cpt_code} • {procedure.category}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ZIP Code Input */}
          <div className="md:col-span-1 lg:col-span-2">
            <label
              htmlFor="zipcode"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              <MapPin className="inline-block w-4 h-4 mr-1.5 -mt-0.5" />
              ZIP Code
            </label>
            <Input
              id="zipcode"
              type="text"
              placeholder="10001"
              value={zipCode}
              onChange={(e) => handleZipChange(e.target.value)}
              icon={<MapPin className="h-5 w-5" />}
              aria-label="Enter your ZIP code"
              aria-invalid={!!zipError}
            />
            {zipError && (
              <p className="mt-1.5 text-sm text-red-500" role="alert">
                {zipError}
              </p>
            )}
          </div>

          {/* Insurance Select */}
          <div className="md:col-span-1 lg:col-span-2">
            <label
              htmlFor="insurance"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              <Shield className="inline-block w-4 h-4 mr-1.5 -mt-0.5" />
              Insurance Provider
            </label>
            <Select
              id="insurance"
              value={insurance}
              onChange={(e) => handleInsuranceChange(e.target.value)}
              icon={<Shield className="h-5 w-5" />}
              aria-label="Select your insurance provider"
            >
              {INSURANCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Plan Type Select - Only shown when insurance is selected */}
          <div className="md:col-span-1 lg:col-span-2">
            <label
              htmlFor="plan"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              <FileText className="inline-block w-4 h-4 mr-1.5 -mt-0.5" />
              Plan Type {insurance !== "cash" && <span className="text-slate-400">(Optional)</span>}
            </label>
            <Select
              id="plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              icon={<FileText className="h-5 w-5" />}
              aria-label="Select your plan type"
              disabled={insurance === "cash"}
              className={insurance === "cash" ? "opacity-50 cursor-not-allowed" : ""}
            >
              <option value="">
                {insurance === "cash" ? "N/A - Cash Price" : "All Plans (Show Range)"}
              </option>
              {availablePlans.map((planOption) => (
                <option key={planOption} value={planOption}>
                  {planOption}
                </option>
              ))}
            </Select>
            {insurance !== "cash" && !plan && (
              <p className="mt-1.5 text-xs text-slate-500">
                Select a plan for exact pricing, or leave empty to see the price range
              </p>
            )}
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-6 flex justify-center">
          <Button
            type="submit"
            size="lg"
            disabled={isLoading || !procedureQuery.trim() || !zipCode}
            className="w-full md:w-auto min-w-[200px]"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Compare Prices
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
