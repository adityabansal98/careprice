"use client";

import { useState, useCallback, useRef } from "react";
import { Heart, ShieldCheck, TrendingDown, Sparkles, Activity } from "lucide-react";
import { SearchForm, SearchFormRef } from "@/components/SearchForm";
import { ResultsList } from "@/components/ResultsList";
import { ChatAssistant } from "@/components/ChatAssistant";
import { searchHospitals } from "@/lib/search";
import type { HospitalResult, SearchParams, InsuranceProfile } from "@/types";

// Common knee procedures for quick selection
const KNEE_PROCEDURES = [
  { cpt: "27447", name: "Total Knee Replacement", shortName: "Total Replacement" },
  { cpt: "29881", name: "Knee Arthroscopy", shortName: "Arthroscopy" },
  { cpt: "27428", name: "ACL Reconstruction", shortName: "ACL Repair" },
  { cpt: "29882", name: "Meniscus Repair", shortName: "Meniscus Repair" },
  { cpt: "27446", name: "Partial Knee Replacement", shortName: "Partial Replacement" },
  { cpt: "73721", name: "MRI Knee", shortName: "Knee MRI" },
];

export default function Home() {
  const [results, setResults] = useState<HospitalResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [insuranceProfile, setInsuranceProfile] = useState<InsuranceProfile | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchFormRef = useRef<SearchFormRef>(null);

  // Handle quick-select: just pre-fill the procedure, don't search
  const handleQuickSelect = useCallback((cptCode: string) => {
    searchFormRef.current?.setProcedure(cptCode);
    // Scroll to the form
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSearch = useCallback((params: SearchParams) => {
    setIsLoading(true);
    setHasSearched(true);

    // Scroll to results section immediately
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    // Simulate network delay for better UX
    setTimeout(() => {
      const searchResults = searchHospitals(params);
      setResults(searchResults);
      setIsLoading(false);
    }, 500);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-teal-600 bg-clip-text text-transparent">
                CarePrice
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a
                href="#"
                className="text-sm font-medium text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
              >
                How it Works
              </a>
              <a
                href="#"
                className="text-sm font-medium text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
              >
                About
              </a>
              <a
                href="#"
                className="text-sm font-medium text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
              >
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-400/20 to-teal-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-teal-400/20 to-primary-400/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary-100/80 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            The #1 Knee Surgery Price Comparison Platform
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-6">
            Know Your
            <span className="bg-gradient-to-r from-primary-600 via-teal-500 to-primary-600 bg-clip-text text-transparent">
              {" "}Knee Surgery Costs{" "}
            </span>
            Before You Go
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Compare prices for knee replacements, arthroscopy, ACL repairs, and more. 
            Find the best rate based on your insurance and save thousands on your surgery.
          </p>

          {/* Quick Select Knee Procedures */}
          <div className="mb-8">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Quick select your procedure:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {KNEE_PROCEDURES.map((proc) => (
                <button
                  key={proc.cpt}
                  type="button"
                  onClick={() => handleQuickSelect(proc.cpt)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-primary-400 hover:text-primary-600 dark:hover:border-primary-500 dark:hover:text-primary-400 transition-all shadow-sm hover:shadow-md"
                >
                  {proc.shortName}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
            Or enter your details below for personalized pricing
          </p>

          {/* Search Form */}
          <SearchForm 
            ref={searchFormRef}
            onSearch={handleSearch} 
            isLoading={isLoading} 
            insuranceProfile={insuranceProfile}
            onInsuranceProfileChange={setInsuranceProfile}
          />

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 md:gap-10">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span className="text-sm">100% Free to Use</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <TrendingDown className="h-5 w-5 text-primary-500" />
              <span className="text-sm">Average savings of $4,200 on knee surgery</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Activity className="h-5 w-5 text-rose-500" />
              <span className="text-sm">Trusted by 15,000+ knee surgery patients</span>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section ref={resultsRef} className="pb-20 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        {hasSearched && (
          <>
            <ResultsList
              results={results}
              isLoading={isLoading}
              insuranceProfile={insuranceProfile}
              onInsuranceProfileChange={setInsuranceProfile}
            />
            {!isLoading && results.length === 0 && (
              <div className="max-w-4xl mx-auto mt-8">
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 text-center border-2 border-slate-200 dark:border-slate-800">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    No Results Found
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    We couldn&apos;t find any hospitals with pricing data for this procedure in your
                    area. Try searching for a different procedure or expanding your search radius.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Features Section */}
      {!hasSearched && (
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 dark:text-slate-100 mb-4">
              Why Choose CarePrice?
            </h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              We specialize exclusively in knee surgeries, giving you the most accurate and comprehensive pricing data available.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary-500/25">
                  <TrendingDown className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Knee Surgery Experts
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  We focus solely on knee procedures - from arthroscopy to total replacements. Get specialized pricing data you can trust.
                </p>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-teal-500/25">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Your Insurance, Your Price
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  See exactly what you&apos;ll pay with your insurance plan, deductible, and coinsurance factored in.
                </p>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-rose-500/25">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Get Back on Your Feet
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Compare top-rated orthopedic centers and find quality care that fits your budget.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">CarePrice</span>
            </div>
            <p className="text-sm text-center md:text-right">
              © {new Date().getFullYear()} CarePrice. All rights reserved.
              <br />
              <span className="text-xs">
                Prices shown are estimates based on publicly available hospital data.
              </span>
            </p>
          </div>
        </div>
      </footer>

      {/* Chat Assistant */}
      <ChatAssistant />
    </div>
  );
}

