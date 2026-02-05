"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, FileText, Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { CostComponentDefinition, CalculatedCostComponent, InsuranceProfile } from "@/types";

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
          
        </div>
      )}
    </div>
  );
}
