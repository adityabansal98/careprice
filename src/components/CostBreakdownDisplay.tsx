"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, FileText, Calculator, AlertCircle, Lightbulb, MapPin, Receipt, Stethoscope } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { CostComponentDefinition, CalculatedCostComponent, InsuranceProfile } from "@/types";

// AI Insight types
interface AIInsight {
  id: string;
  icon: "location" | "cost_driver" | "separate_bills" | "tip";
  title: string;
  description: string;
  savingsAmount?: string;
  savingsPercent?: string;
}

interface CostBreakdownDisplayProps {
  costComponents: CostComponentDefinition[];
  grossChargeMin: number; // The displayed total price (min)
  grossChargeMax: number; // The displayed total price (max)
  insuranceProfile?: InsuranceProfile | null;
  procedureName: string;
}

function calculateComponentCosts(
  components: CostComponentDefinition[],
  priceMin: number,
  priceMax: number,
  insuranceProfile?: InsuranceProfile | null
): CalculatedCostComponent[] {
  // If it's a single price (min === max), use percentage ranges to create variance
  const isSinglePrice = priceMin === priceMax;
  const basePrice = priceMin;
  
  return components.map((component) => {
    let componentGrossMin: number;
    let componentGrossMax: number;
    
    if (isSinglePrice) {
      // Use the component's percentage range to create min/max
      componentGrossMin = basePrice * (component.percentOfTotal.min / 100);
      componentGrossMax = basePrice * (component.percentOfTotal.max / 100);
    } else {
      // Use average percentage applied to price range
      const avgPercent = (component.percentOfTotal.min + component.percentOfTotal.max) / 2 / 100;
      componentGrossMin = priceMin * avgPercent;
      componentGrossMax = priceMax * avgPercent;
    }
    
    // Calculate OOP if insurance profile is provided
    let oopMin = componentGrossMin;
    let oopMax = componentGrossMax;
    
    if (insuranceProfile) {
      // Apply coinsurance rate to the component
      const coinsuranceRate = insuranceProfile.coinsurancePercent / 100;
      oopMin = componentGrossMin * coinsuranceRate;
      oopMax = componentGrossMax * coinsuranceRate;
    }
    
    return {
      id: component.id,
      name: component.name,
      type: component.type,
      cptCode: component.cptCode,
      description: component.description,
      grossChargeMin: Math.round(componentGrossMin),
      grossChargeMax: Math.round(componentGrossMax),
      oopMin: Math.round(oopMin),
      oopMax: Math.round(oopMax),
    };
  });
}

// Generate AI insights based on the procedure and cost data
function generateInsights(
  procedureName: string,
  components: CalculatedCostComponent[],
  totalMin: number,
  totalMax: number,
  hasInsurance: boolean
): AIInsight[] {
  const insights: AIInsight[] = [];
  
  // Find the biggest cost driver
  const sortedByAvgCost = [...components].sort((a, b) => {
    const avgA = (a.grossChargeMin + a.grossChargeMax) / 2;
    const avgB = (b.grossChargeMin + b.grossChargeMax) / 2;
    return avgB - avgA;
  });
  
  const biggestDriver = sortedByAvgCost[0];
  const facilityFee = components.find(c => c.id === "facility_fee");
  const anesthesia = components.find(c => c.id === "anesthesia");
  const implant = components.find(c => c.id === "implant" || c.id === "hardware" || c.id === "graft");
  const estimatedComponents = components.filter(c => c.type === "estimated");
  
  // Calculate facility fee percentage of total
  const avgTotal = (totalMin + totalMax) / 2;
  const facilityAvg = facilityFee ? (facilityFee.grossChargeMin + facilityFee.grossChargeMax) / 2 : 0;
  const facilityPercent = avgTotal > 0 ? Math.round((facilityAvg / avgTotal) * 100) : 0;
  
  // Insight 1: Location/Facility Savings (for surgeries with facility fees)
  if (facilityFee && facilityPercent >= 25) {
    const potentialSavingsMin = Math.round(facilityFee.grossChargeMin * 0.3);
    const potentialSavingsMax = Math.round(facilityFee.grossChargeMax * 0.5);
    
    insights.push({
      id: "location_savings",
      icon: "location",
      title: "Location Matters Most",
      description: `Expect a total cost between ${formatCurrency(totalMin)} – ${formatCurrency(totalMax)}. You can typically save 30-50% on facility fees (approx. ${formatCurrency(potentialSavingsMin)}+) by choosing an Ambulatory Surgery Center (ASC) instead of a Hospital.`,
      savingsAmount: formatCurrency(potentialSavingsMin),
      savingsPercent: "30-50%",
    });
  }
  
  // Insight 2: Biggest Cost Driver (if it's facility fee)
  if (biggestDriver && biggestDriver.id === "facility_fee") {
    insights.push({
      id: "hidden_variable",
      icon: "cost_driver",
      title: "The Hidden Variable",
      description: `The Facility Fee is the biggest cost driver (${facilityPercent}% of your total) and varies wildly between locations. Ask your surgeon if they have privileges at an independent surgery center to avoid the higher "Hospital Markup."`,
    });
  } else if (biggestDriver) {
    const driverPercent = avgTotal > 0 
      ? Math.round(((biggestDriver.grossChargeMin + biggestDriver.grossChargeMax) / 2 / avgTotal) * 100) 
      : 0;
    insights.push({
      id: "cost_driver",
      icon: "cost_driver",
      title: "Know Your Biggest Cost",
      description: `${biggestDriver.name} makes up about ${driverPercent}% of your total cost (${formatCurrency(biggestDriver.grossChargeMin)} – ${formatCurrency(biggestDriver.grossChargeMax)}). This is where negotiation or shopping around can make the biggest difference.`,
    });
  }
  
  // Insight 3: Separate Bills Warning
  if (anesthesia || implant) {
    const separateBillItems: string[] = [];
    
    if (anesthesia) {
      const anesthesiaAvg = Math.round((anesthesia.grossChargeMin + anesthesia.grossChargeMax) / 2);
      separateBillItems.push(`Anesthesia (~${formatCurrency(anesthesiaAvg)})`);
    }
    
    if (implant) {
      const implantAvg = Math.round((implant.grossChargeMin + implant.grossChargeMax) / 2);
      separateBillItems.push(`${implant.name} (~${formatCurrency(implantAvg)})`);
    }
    
    if (separateBillItems.length > 0) {
      insights.push({
        id: "separate_bills",
        icon: "separate_bills",
        title: "Watch for \"Separate\" Bills",
        description: `Your surgeon's quote often covers only their fee. Expect separate bills for ${separateBillItems.join(" and ")}${hasInsurance ? " which will apply to your deductible separately" : ""}.`,
      });
    }
  }
  
  // Insight 4: Estimated costs tip
  if (estimatedComponents.length > 0) {
    const estimatedTotal = estimatedComponents.reduce(
      (sum, c) => sum + (c.grossChargeMin + c.grossChargeMax) / 2, 
      0
    );
    const estimatedPercent = avgTotal > 0 ? Math.round((estimatedTotal / avgTotal) * 100) : 0;
    
    if (estimatedPercent >= 15) {
      insights.push({
        id: "ask_for_bundle",
        icon: "tip",
        title: "Pro Tip: Ask for a Bundled Price",
        description: `About ${estimatedPercent}% of your cost comes from estimated items (supplies, implants, etc.). Ask the facility for a "bundled" or "all-inclusive" quote that covers everything to avoid surprise charges.`,
      });
    }
  }
  
  return insights;
}

// Insight Card Component
function InsightCard({ insight }: { insight: AIInsight }) {
  const getIcon = () => {
    switch (insight.icon) {
      case "location":
        return <MapPin className="h-4 w-4" />;
      case "cost_driver":
        return <Receipt className="h-4 w-4" />;
      case "separate_bills":
        return <AlertCircle className="h-4 w-4" />;
      case "tip":
        return <Stethoscope className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };
  
  const getColorClasses = () => {
    switch (insight.icon) {
      case "location":
        return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400";
      case "cost_driver":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400";
      case "separate_bills":
        return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400";
      case "tip":
        return "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400";
      default:
        return "bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400";
    }
  };
  
  const getIconBgClasses = () => {
    switch (insight.icon) {
      case "location":
        return "bg-emerald-100 dark:bg-emerald-900/50";
      case "cost_driver":
        return "bg-blue-100 dark:bg-blue-900/50";
      case "separate_bills":
        return "bg-amber-100 dark:bg-amber-900/50";
      case "tip":
        return "bg-violet-100 dark:bg-violet-900/50";
      default:
        return "bg-slate-100 dark:bg-slate-900/50";
    }
  };
  
  return (
    <div className={`p-3 rounded-lg border ${getColorClasses()}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconBgClasses()}`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm mb-1">{insight.title}</p>
          <p className="text-xs leading-relaxed opacity-90">{insight.description}</p>
        </div>
      </div>
    </div>
  );
}

function ComponentRow({ 
  component, 
  showOop 
}: { 
  component: CalculatedCostComponent;
  showOop: boolean;
}) {
  const isCptBased = component.type === "cpt_based";
  const isRange = component.grossChargeMin !== component.grossChargeMax;
  
  return (
    <div className="py-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-slate-700 dark:text-slate-300">
              {component.name}
            </span>
            {isCptBased ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                <FileText className="h-3 w-3" />
                CPT-based
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                <Calculator className="h-3 w-3" />
                Estimated
              </span>
            )}
            {component.cptCode && (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                ({component.cptCode})
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {component.description}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          {showOop ? (
            <div>
              <p className="text-sm font-semibold text-violet-700 dark:text-violet-400">
                {isRange 
                  ? `${formatCurrency(component.oopMin)} - ${formatCurrency(component.oopMax)}`
                  : formatCurrency(component.oopMin)
                }
              </p>
              <p className="text-xs text-slate-400 line-through">
                {isRange 
                  ? `${formatCurrency(component.grossChargeMin)} - ${formatCurrency(component.grossChargeMax)}`
                  : formatCurrency(component.grossChargeMin)
                }
              </p>
            </div>
          ) : (
            <p className="text-sm font-semibold text-primary-700 dark:text-primary-400">
              {isRange 
                ? `${formatCurrency(component.grossChargeMin)} - ${formatCurrency(component.grossChargeMax)}`
                : formatCurrency(component.grossChargeMin)
              }
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function CostBreakdownDisplay({
  costComponents,
  grossChargeMin,
  grossChargeMax,
  insuranceProfile,
  procedureName,
}: CostBreakdownDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const calculatedComponents = useMemo(
    () => calculateComponentCosts(costComponents, grossChargeMin, grossChargeMax, insuranceProfile),
    [costComponents, grossChargeMin, grossChargeMax, insuranceProfile]
  );
  
  // Calculate the actual sum of component costs so total matches breakdown
  const componentTotals = useMemo(() => {
    const grossMin = calculatedComponents.reduce((sum, c) => sum + c.grossChargeMin, 0);
    const grossMax = calculatedComponents.reduce((sum, c) => sum + c.grossChargeMax, 0);
    const oopMin = calculatedComponents.reduce((sum, c) => sum + c.oopMin, 0);
    const oopMax = calculatedComponents.reduce((sum, c) => sum + c.oopMax, 0);
    return { grossMin, grossMax, oopMin, oopMax };
  }, [calculatedComponents]);
  
  const cptBasedCount = costComponents.filter(c => c.type === "cpt_based").length;
  const estimatedCount = costComponents.filter(c => c.type === "estimated").length;
  const showOop = !!insuranceProfile;
  
  // Generate AI insights
  const insights = useMemo(
    () => generateInsights(
      procedureName,
      calculatedComponents,
      componentTotals.grossMin,
      componentTotals.grossMax,
      showOop
    ),
    [procedureName, calculatedComponents, componentTotals, showOop]
  );
  
  if (!costComponents || costComponents.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Cost Breakdown
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {cptBasedCount} negotiated rate{cptBasedCount !== 1 ? 's' : ''} • {estimatedCount} estimate{estimatedCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isExpanded ? 'Hide details' : 'View details'}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </button>
      
      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                <FileText className="h-3 w-3" />
                CPT-based
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Insurance-negotiated rate
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                <Calculator className="h-3 w-3" />
                Estimated
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Based on typical costs
              </span>
            </div>
          </div>
          
          {/* Component List */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 px-4">
            {calculatedComponents.map((component) => (
              <ComponentRow 
                key={component.id} 
                component={component} 
                showOop={showOop}
              />
            ))}
          </div>
          
          {/* Totals Row */}
          <div className="mt-3 p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg border border-primary-200 dark:border-primary-800">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-primary-700 dark:text-primary-300">
                Total {showOop ? 'Estimated Out-of-Pocket' : 'Estimated Cost'}
              </span>
              <span className="font-bold text-lg text-primary-700 dark:text-primary-400">
                {showOop ? (
                  componentTotals.oopMin !== componentTotals.oopMax
                    ? `${formatCurrency(componentTotals.oopMin)} - ${formatCurrency(componentTotals.oopMax)}`
                    : formatCurrency(componentTotals.oopMin)
                ) : (
                  componentTotals.grossMin !== componentTotals.grossMax
                    ? `${formatCurrency(componentTotals.grossMin)} - ${formatCurrency(componentTotals.grossMax)}`
                    : formatCurrency(componentTotals.grossMin)
                )}
              </span>
            </div>
          </div>
          
          {/* AI Insights */}
          {insights.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  AI Insights
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  Smart tips based on your procedure
                </span>
              </div>
              <div className="space-y-2">
                {insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </div>
          )}
          
          {/* Disclaimer */}
          <div className="mt-3 flex items-start gap-2 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <AlertCircle className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-400">
              <p className="font-medium mb-1">About these estimates</p>
              <ul className="space-y-1 text-slate-500 dark:text-slate-500">
                <li>• <strong>CPT-based</strong> costs use actual hospital pricing data and insurance rates.</li>
                <li>• <strong>Estimated</strong> costs are calculated based on typical percentage ranges.</li>
                <li>• Actual costs may vary based on your specific case and hospital policies.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
