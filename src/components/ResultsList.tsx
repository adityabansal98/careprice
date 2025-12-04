"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { ArrowUpDown, DollarSign, MapPin, Star, AlertCircle, List, Map } from "lucide-react";
import { HospitalCard } from "@/components/HospitalCard";
import { AIInsights } from "@/components/AIInsights";
import { Button } from "@/components/ui/button";
import { getDisplayPrice } from "@/lib/search";
import type { HospitalResult, SortOption, ViewMode } from "@/types";

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/MapView").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse flex items-center justify-center">
      <span className="text-slate-400">Loading map...</span>
    </div>
  ),
});

interface ResultsListProps {
  results: HospitalResult[];
  isLoading?: boolean;
}

const SORT_OPTIONS: Array<{ value: SortOption; label: string; icon: React.ReactNode }> = [
  { value: "price", label: "Lowest Price", icon: <DollarSign className="h-4 w-4" /> },
  { value: "distance", label: "Closest", icon: <MapPin className="h-4 w-4" /> },
  { value: "rating", label: "Highest Rated", icon: <Star className="h-4 w-4" /> },
];

const VIEW_OPTIONS: Array<{ value: ViewMode; label: string; icon: React.ReactNode }> = [
  { value: "list", label: "List", icon: <List className="h-4 w-4" /> },
  { value: "map", label: "Map", icon: <Map className="h-4 w-4" /> },
];

export function ResultsList({ results, isLoading = false }: ResultsListProps) {
  const [sortBy, setSortBy] = useState<SortOption>("price");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const sortedResults = useMemo(() => {
    const sorted = [...results];
    switch (sortBy) {
      case "price":
        return sorted.sort((a, b) => getDisplayPrice(a.priceInfo) - getDisplayPrice(b.priceInfo));
      case "distance":
        const distanceOrder = { close: 0, medium: 1, far: 2 };
        return sorted.sort(
          (a, b) => distanceOrder[a.distance] - distanceOrder[b.distance]
        );
      case "rating":
        return sorted.sort((a, b) => b.hospital.rating - a.hospital.rating);
      default:
        return sorted;
    }
  }, [results, sortBy]);

  // Determine the price display type
  const priceType = results[0]?.priceInfo.type;
  const isCash = priceType === "cash";
  const isPlanRange = priceType === "plan_range";

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white/60 dark:bg-slate-900/60 rounded-2xl h-64 border-2 border-slate-100 dark:border-slate-800"
            />
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  const getSubtitleText = () => {
    if (isCash) {
      return "Showing cash prices - pay directly without insurance";
    }
    if (isPlanRange) {
      return "Showing negotiated rate ranges for your selected plan";
    }
    return "Showing price ranges across all plan types. Select a specific plan for narrower ranges.";
  };

  // Get procedure from first result for AI Insights
  const procedure = results[0]?.procedure;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 space-y-6">
      {/* AI Insights */}
      {procedure && <AIInsights procedure={procedure} />}

      {/* Results Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {results.length} {results.length === 1 ? "Hospital" : "Hospitals"} Found
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {getSubtitleText()}
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 rounded-xl p-1.5 border-2 border-slate-200 dark:border-slate-700">
            {VIEW_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={viewMode === option.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(option.value)}
                className={viewMode === option.value ? "" : "hover:bg-slate-100 dark:hover:bg-slate-800"}
              >
                {option.icon}
                <span className="ml-1.5">{option.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Sort Options - Only show in list view */}
        {viewMode === "list" && (
          <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 rounded-xl p-1.5 border-2 border-slate-200 dark:border-slate-700 w-fit">
            <ArrowUpDown className="h-4 w-4 text-slate-400 ml-2" />
            <span className="text-sm text-slate-500 mr-1">Sort:</span>
            {SORT_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={sortBy === option.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortBy(option.value)}
                className={sortBy === option.value ? "" : "hover:bg-slate-100 dark:hover:bg-slate-800"}
              >
                {option.icon}
                <span className="ml-1.5 hidden sm:inline">{option.label}</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Price Transparency Notice */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-900 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-amber-800 dark:text-amber-300">
            Price Transparency Notice
          </p>
          <p className="text-amber-700 dark:text-amber-400 mt-1">
            {isCash
              ? "Cash prices shown are self-pay rates. These may vary based on services rendered."
              : "Price ranges shown represent the minimum and maximum negotiated rates. Your actual cost depends on your specific plan details, deductible status, and services required. Always verify with the hospital before scheduling."}
          </p>
        </div>
      </div>

      {/* Map View */}
      {viewMode === "map" && (
        <MapView results={sortedResults} />
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="grid gap-6">
          {sortedResults.map((result, index) => (
            <HospitalCard
              key={result.hospital.id}
              result={result}
              rank={index + 1}
            />
          ))}
        </div>
      )}

      {/* Footer CTA */}
      <div className="text-center py-8">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Can&apos;t find your hospital? Prices are updated regularly as new data becomes available.
        </p>
      </div>
    </div>
  );
}
