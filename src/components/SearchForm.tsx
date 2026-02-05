"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Search, MapPin, Shield, Stethoscope, FileText, ChevronDown, ChevronUp, DollarSign, Percent, HelpCircle, Wallet, Upload, FileUp, CheckCircle, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { validateZipCode } from "@/lib/utils";
import type { Procedure, InsuranceProvider, SearchParams, InsuranceProfile } from "@/types";
import proceduresData from "@/data/procedures.json";

type InputMode = "search" | "upload";

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
  insuranceProfile: InsuranceProfile | null;
  onInsuranceProfileChange: (profile: InsuranceProfile | null) => void;
}

// Typical values by plan type for "Use Typical Values" feature
const TYPICAL_VALUES: Record<string, InsuranceProfile> = {
  PPO: {
    deductibleTotal: 2000,
    deductibleRemaining: 2000,
    coinsurancePercent: 20,
    oopMaxTotal: 6000,
    oopMaxRemaining: 6000,
  },
  HMO: {
    deductibleTotal: 1500,
    deductibleRemaining: 1500,
    coinsurancePercent: 20,
    oopMaxTotal: 5000,
    oopMaxRemaining: 5000,
  },
  EPO: {
    deductibleTotal: 1750,
    deductibleRemaining: 1750,
    coinsurancePercent: 20,
    oopMaxTotal: 5500,
    oopMaxRemaining: 5500,
  },
  POS: {
    deductibleTotal: 2000,
    deductibleRemaining: 2000,
    coinsurancePercent: 25,
    oopMaxTotal: 6500,
    oopMaxRemaining: 6500,
  },
};

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

export function SearchForm({ onSearch, isLoading = false, insuranceProfile, onInsuranceProfileChange }: SearchFormProps) {
  const [procedureQuery, setProcedureQuery] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [insurance, setInsurance] = useState<InsuranceProvider | "cash">("cash");
  const [plan, setPlan] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [zipError, setZipError] = useState("");
  
  // Input mode: search or upload
  const [inputMode, setInputMode] = useState<InputMode>("search");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [extractedProcedure, setExtractedProcedure] = useState<Procedure | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Insurance details section
  const [showInsuranceDetails, setShowInsuranceDetails] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [deductibleTotal, setDeductibleTotal] = useState(insuranceProfile?.deductibleTotal?.toString() || "");
  const [deductibleRemaining, setDeductibleRemaining] = useState(insuranceProfile?.deductibleRemaining?.toString() || "");
  const [coinsurancePercent, setCoinsurancePercent] = useState(insuranceProfile?.coinsurancePercent?.toString() || "");
  const [oopMaxTotal, setOopMaxTotal] = useState(insuranceProfile?.oopMaxTotal?.toString() || "");
  const [oopMaxRemaining, setOopMaxRemaining] = useState(insuranceProfile?.oopMaxRemaining?.toString() || "");

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

  const handleUseTipicalValues = useCallback((planType: string) => {
    const typical = TYPICAL_VALUES[planType];
    if (typical) {
      setDeductibleTotal(typical.deductibleTotal.toString());
      setDeductibleRemaining(typical.deductibleRemaining.toString());
      setCoinsurancePercent(typical.coinsurancePercent.toString());
      setOopMaxTotal(typical.oopMaxTotal.toString());
      setOopMaxRemaining(typical.oopMaxRemaining.toString());
    }
  }, []);

  const handleClearInsuranceDetails = useCallback(() => {
    setDeductibleTotal("");
    setDeductibleRemaining("");
    setCoinsurancePercent("");
    setOopMaxTotal("");
    setOopMaxRemaining("");
    onInsuranceProfileChange(null);
  }, [onInsuranceProfileChange]);

  // Check if insurance details are filled
  const hasInsuranceDetails = deductibleTotal || deductibleRemaining || coinsurancePercent || oopMaxTotal || oopMaxRemaining;

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadedFile(file);
    setIsProcessingUpload(true);
    setExtractedProcedure(null);
    
    // Simulate AI processing - always extract as knee surgery (CPT 29881)
    setTimeout(() => {
      const kneeSurgery = procedures.find(p => p.cpt_code === "29881");
      if (kneeSurgery) {
        setExtractedProcedure(kneeSurgery);
        setProcedureQuery(`${kneeSurgery.name} (${kneeSurgery.cpt_code})`);
      }
      setIsProcessingUpload(false);
    }, 2500); // 2.5 second delay to simulate processing
  }, [procedures]);

  const handleClearUpload = useCallback(() => {
    setUploadedFile(null);
    setExtractedProcedure(null);
    setProcedureQuery("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleModeChange = useCallback((mode: InputMode) => {
    setInputMode(mode);
    if (mode === "search") {
      handleClearUpload();
    } else {
      setProcedureQuery("");
      setShowSuggestions(false);
    }
  }, [handleClearUpload]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // For upload mode, check if we have an extracted procedure
      if (inputMode === "upload") {
        if (!extractedProcedure || isProcessingUpload) return;
      } else {
        if (!procedureQuery.trim()) return;
      }
      
      if (!validateZipCode(zipCode)) {
        setZipError("Please enter a valid 5-digit ZIP code");
        return;
      }

      // Save insurance profile if details are provided
      if (hasInsuranceDetails && insurance !== "cash") {
        const profile: InsuranceProfile = {
          deductibleTotal: parseFloat(deductibleTotal) || 0,
          deductibleRemaining: parseFloat(deductibleRemaining) || 0,
          coinsurancePercent: parseFloat(coinsurancePercent) || 20,
          oopMaxTotal: parseFloat(oopMaxTotal) || 0,
          oopMaxRemaining: parseFloat(oopMaxRemaining) || 0,
        };
        onInsuranceProfileChange(profile);
      }

      // Get the procedure code
      let searchProcedure: string;
      if (inputMode === "upload" && extractedProcedure) {
        searchProcedure = extractedProcedure.cpt_code;
      } else {
        const cptMatch = procedureQuery.match(/\((\d{5})\)/);
        searchProcedure = cptMatch ? cptMatch[1] : procedureQuery;
      }

      onSearch({
        procedure: searchProcedure,
        zipCode,
        insurance,
        plan: plan || undefined,
      });
    },
    [procedureQuery, zipCode, insurance, plan, onSearch, hasInsuranceDetails, deductibleTotal, deductibleRemaining, coinsurancePercent, oopMaxTotal, oopMaxRemaining, onInsuranceProfileChange, inputMode, extractedProcedure, isProcessingUpload]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/60 dark:shadow-slate-900/60 p-6 md:p-8 border-2 border-slate-100 dark:border-slate-800">
        {/* Mode Toggle */}
        <div className="flex items-center gap-2 mb-5">
          <button
            type="button"
            onClick={() => handleModeChange("search")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              inputMode === "search"
                ? "bg-primary-600 text-white shadow-lg shadow-primary-500/25"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Search className="h-4 w-4" />
            Search Procedure
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("upload")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              inputMode === "upload"
                ? "bg-primary-600 text-white shadow-lg shadow-primary-500/25"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Upload className="h-4 w-4" />
            Upload Doctor&apos;s Letter
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* Procedure Input - Search Mode */}
          {inputMode === "search" && (
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
          )}

          {/* Upload Mode */}
          {inputMode === "upload" && (
            <div className="md:col-span-2 lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <FileUp className="inline-block w-4 h-4 mr-1.5 -mt-0.5" />
                Doctor&apos;s Prescription Letter
              </label>
              
              {/* Processing State */}
              {isProcessingUpload && (
                <div className="border-2 border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-950/30 rounded-xl p-6 text-center">
                  <Loader2 className="h-8 w-8 text-primary-600 animate-spin mx-auto mb-3" />
                  <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    Extracting prescribed surgery...
                  </p>
                  <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                    Analyzing your doctor&apos;s letter
                  </p>
                </div>
              )}

              {/* Extracted Procedure Display */}
              {!isProcessingUpload && extractedProcedure && (
                <div className="border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          Procedure Identified
                        </p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {extractedProcedure.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          CPT: {extractedProcedure.cpt_code} • {extractedProcedure.category}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearUpload}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  {uploadedFile && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {uploadedFile.name}
                    </p>
                  )}
                </div>
              )}

              {/* Upload Area */}
              {!isProcessingUpload && !extractedProcedure && (
                <div
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center hover:border-primary-400 dark:hover:border-primary-500 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Click to upload your doctor&apos;s letter
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    PDF, JPG, PNG, DOC up to 10MB
                  </p>
                </div>
              )}
            </div>
          )}

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

        {/* Insurance Details Collapsible Section */}
        {insurance !== "cash" && (
          <div className="mt-5 border-t border-slate-200 dark:border-slate-700 pt-5">
            <button
              type="button"
              onClick={() => setShowInsuranceDetails(!showInsuranceDetails)}
              className="w-full flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md shadow-violet-500/20">
                  <Wallet className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300 text-sm group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    Know your insurance details? Add them for a better estimate
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {hasInsuranceDetails ? "Details added - will calculate your actual out-of-pocket cost" : "Optional - enter deductible & coinsurance for personalized costs"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasInsuranceDetails && (
                  <span className="text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-2 py-1 rounded-full font-medium">
                    Active
                  </span>
                )}
                {showInsuranceDetails ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </button>

            {/* Expanded Insurance Details Form */}
            {showInsuranceDetails && (
              <div className="mt-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                {/* Help Section */}
                <button
                  type="button"
                  onClick={() => setShowHelp(!showHelp)}
                  className="flex items-center gap-1.5 text-sm text-violet-600 dark:text-violet-400 mb-4 hover:underline"
                >
                  <HelpCircle className="h-4 w-4" />
                  Where do I find these numbers?
                </button>
                
                {showHelp && (
                  <div className="bg-white dark:bg-slate-900/50 rounded-lg p-3 mb-4 text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    <p className="font-medium mb-2">Find your numbers in:</p>
                    <ul className="space-y-1 text-xs">
                      <li>📱 Your insurance app (Aetna, UHC, etc.) - usually on home screen</li>
                      <li>💳 Back of your insurance card</li>
                      <li>📄 Summary of Benefits from your employer</li>
                      <li>📞 Call the number on your card</li>
                    </ul>
                  </div>
                )}

                {/* Quick Fill Buttons */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Don&apos;t know? Use typical values:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(TYPICAL_VALUES).map((planType) => (
                      <button
                        key={planType}
                        type="button"
                        onClick={() => handleUseTipicalValues(planType)}
                        className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-300 transition-colors border border-slate-200 dark:border-slate-700"
                      >
                        Typical {planType}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Deductible */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                        <DollarSign className="inline h-3 w-3 mr-1" />
                        Total Deductible
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g., 2000"
                        value={deductibleTotal}
                        onChange={(e) => setDeductibleTotal(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                        <DollarSign className="inline h-3 w-3 mr-1" />
                        Deductible Remaining
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g., 800"
                        value={deductibleRemaining}
                        onChange={(e) => setDeductibleRemaining(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Coinsurance */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                      <Percent className="inline h-3 w-3 mr-1" />
                      Your Coinsurance % (what you pay after deductible)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 20"
                      value={coinsurancePercent}
                      onChange={(e) => setCoinsurancePercent(e.target.value)}
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      If your plan is 80/20, enter 20 (you pay 20%)
                    </p>
                  </div>

                  {/* OOP Max */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                        <Shield className="inline h-3 w-3 mr-1" />
                        Out-of-Pocket Max
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g., 6000"
                        value={oopMaxTotal}
                        onChange={(e) => setOopMaxTotal(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                        <Shield className="inline h-3 w-3 mr-1" />
                        OOP Max Remaining
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g., 4500"
                        value={oopMaxRemaining}
                        onChange={(e) => setOopMaxRemaining(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Clear Button */}
                {hasInsuranceDetails && (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleClearInsuranceDetails}
                      className="text-xs text-slate-500 hover:text-red-500 transition-colors"
                    >
                      Clear insurance details
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Search Button */}
        <div className="mt-6 flex justify-center">
          <Button
            type="submit"
            size="lg"
            disabled={
              isLoading || 
              isProcessingUpload ||
              !zipCode ||
              (inputMode === "search" && !procedureQuery.trim()) ||
              (inputMode === "upload" && !extractedProcedure)
            }
            className="w-full md:w-auto min-w-[200px]"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Searching...
              </>
            ) : isProcessingUpload ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
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
