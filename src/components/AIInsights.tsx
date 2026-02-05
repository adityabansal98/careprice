"use client";

import { Sparkles, MapPin, AlertCircle, UserCheck, Lightbulb } from "lucide-react";
import type { Procedure } from "@/types";

interface AIInsightsProps {
  procedure: Procedure;
}

// AI Insight types
interface AIInsight {
  id: string;
  icon: "location" | "separate_bills" | "physician";
  title: string;
  description: string;
}

// Generate AI insights based on the procedure
function generateInsights(procedure: Procedure): AIInsight[] {
  const insights: AIInsight[] = [];
  const costComponents = procedure.costComponents || [];
  
  // Find key components
  const facilityFee = costComponents.find(c => c.id === "facility_fee");
  const anesthesia = costComponents.find(c => c.id === "anesthesia");
  const implant = costComponents.find(c => c.id === "implant" || c.id === "hardware" || c.id === "graft");
  
  // Calculate facility fee percentage
  const facilityPercent = facilityFee 
    ? Math.round((facilityFee.percentOfTotal.min + facilityFee.percentOfTotal.max) / 2) 
    : 0;
  
  // Insight 1: Location/Facility Savings (for surgeries with facility fees)
  if (facilityFee && facilityPercent >= 25) {
    insights.push({
      id: "location_savings",
      icon: "location",
      title: "Location Matters Most",
      description: `You can typically save 30-50% on facility fees by choosing an Ambulatory Surgery Center (ASC) instead of a Hospital. The facility fee makes up about ${facilityPercent}% of your total cost.`,
    });
  }
  
  // Insight 2: Separate Bills Warning
  if (anesthesia || implant) {
    const separateBillItems: string[] = [];
    
    if (anesthesia) {
      const anesthesiaPercent = Math.round((anesthesia.percentOfTotal.min + anesthesia.percentOfTotal.max) / 2);
      separateBillItems.push(`Anesthesia (~${anesthesiaPercent}% of total)`);
    }
    
    if (implant) {
      const implantPercent = Math.round((implant.percentOfTotal.min + implant.percentOfTotal.max) / 2);
      separateBillItems.push(`${implant.name} (~${implantPercent}% of total)`);
    }
    
    if (separateBillItems.length > 0) {
      insights.push({
        id: "separate_bills",
        icon: "separate_bills",
        title: "Watch for \"Separate\" Bills",
        description: `Your surgeon's quote often covers only their fee. Expect separate bills for ${separateBillItems.join(" and ")} which will apply to your deductible separately.`,
      });
    }
  }
  
  // Insight 3: Physician Independent Contractor Check
  insights.push({
    id: "physician_check",
    icon: "physician",
    title: "Pro Tip: Check The Hidden Variable",
    description: `Ask if your physician is an independent contractor. If so, you have the right to ask for a change of physician as hiring an independent contractor would cause significant surcharges.`,
  });
  
  return insights;
}

// Insight Card Component
function InsightCard({ insight }: { insight: AIInsight }) {
  const getIcon = () => {
    switch (insight.icon) {
      case "location":
        return <MapPin className="h-4 w-4" />;
      case "separate_bills":
        return <AlertCircle className="h-4 w-4" />;
      case "physician":
        return <UserCheck className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };
  
  const getColorClasses = () => {
    switch (insight.icon) {
      case "location":
        return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400";
      case "separate_bills":
        return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400";
      case "physician":
        return "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400";
      default:
        return "bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400";
    }
  };
  
  const getIconBgClasses = () => {
    switch (insight.icon) {
      case "location":
        return "bg-emerald-100 dark:bg-emerald-900/50";
      case "separate_bills":
        return "bg-amber-100 dark:bg-amber-900/50";
      case "physician":
        return "bg-cyan-100 dark:bg-cyan-900/50";
      default:
        return "bg-slate-100 dark:bg-slate-900/50";
    }
  };
  
  return (
    <div className={`p-4 rounded-xl border ${getColorClasses()}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconBgClasses()}`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm mb-1">{insight.title}</p>
          <p className="text-sm leading-relaxed opacity-90">{insight.description}</p>
        </div>
      </div>
    </div>
  );
}

export function AIInsights({ procedure }: AIInsightsProps) {
  const insights = generateInsights(procedure);
  
  // If no smart insights, fall back to procedure insights
  if (insights.length === 0 && (!procedure.insights || procedure.insights.length === 0)) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-pink-950/40 rounded-2xl border-2 border-indigo-200/50 dark:border-indigo-800/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">AI Insights</h3>
              <p className="text-white/80 text-xs">
                Smart tips for {procedure.name}
              </p>
            </div>
          </div>
        </div>

        {/* Insights List */}
        <div className="p-5 space-y-3">
          {insights.length > 0 ? (
            insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))
          ) : (
            // Fallback to original procedure insights
            <ul className="space-y-3">
              {procedure.insights?.map((insight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Lightbulb className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                    {insight}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
