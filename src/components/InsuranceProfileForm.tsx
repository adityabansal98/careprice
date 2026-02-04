"use client";

import { useState } from "react";
import { Wallet, HelpCircle, ChevronDown, ChevronUp, Calculator, X, DollarSign, Percent, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InsuranceProfile } from "@/types";

interface InsuranceProfileFormProps {
  profile: InsuranceProfile | null;
  onSave: (profile: InsuranceProfile) => void;
  onClear: () => void;
}

// Typical values by plan type for "Use Typical Values" feature
const TYPICAL_VALUES: Record<string, Partial<InsuranceProfile>> = {
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

export function InsuranceProfileForm({ profile, onSave, onClear }: InsuranceProfileFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const [deductibleTotal, setDeductibleTotal] = useState(profile?.deductibleTotal?.toString() || "");
  const [deductibleRemaining, setDeductibleRemaining] = useState(profile?.deductibleRemaining?.toString() || "");
  const [coinsurancePercent, setCoinsurancePercent] = useState(profile?.coinsurancePercent?.toString() || "");
  const [oopMaxTotal, setOopMaxTotal] = useState(profile?.oopMaxTotal?.toString() || "");
  const [oopMaxRemaining, setOopMaxRemaining] = useState(profile?.oopMaxRemaining?.toString() || "");

  const handleSave = () => {
    const newProfile: InsuranceProfile = {
      deductibleTotal: parseFloat(deductibleTotal) || 0,
      deductibleRemaining: parseFloat(deductibleRemaining) || 0,
      coinsurancePercent: parseFloat(coinsurancePercent) || 20,
      oopMaxTotal: parseFloat(oopMaxTotal) || 0,
      oopMaxRemaining: parseFloat(oopMaxRemaining) || 0,
    };
    onSave(newProfile);
    setIsExpanded(false);
  };

  const handleUseTipicalValues = (planType: string) => {
    const typical = TYPICAL_VALUES[planType];
    if (typical) {
      setDeductibleTotal(typical.deductibleTotal?.toString() || "");
      setDeductibleRemaining(typical.deductibleRemaining?.toString() || "");
      setCoinsurancePercent(typical.coinsurancePercent?.toString() || "");
      setOopMaxTotal(typical.oopMaxTotal?.toString() || "");
      setOopMaxRemaining(typical.oopMaxRemaining?.toString() || "");
    }
  };

  const handleClear = () => {
    setDeductibleTotal("");
    setDeductibleRemaining("");
    setCoinsurancePercent("");
    setOopMaxTotal("");
    setOopMaxRemaining("");
    onClear();
  };

  // Summary view when profile is set
  if (profile && !isExpanded) {
    const deductiblePercent = ((profile.deductibleTotal - profile.deductibleRemaining) / profile.deductibleTotal) * 100;
    const oopPercent = ((profile.oopMaxTotal - profile.oopMaxRemaining) / profile.oopMaxTotal) * 100;
    
    return (
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-xl p-4 border border-violet-200 dark:border-violet-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Calculator className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-violet-800 dark:text-violet-200">My Insurance Status</h3>
              <p className="text-xs text-violet-600 dark:text-violet-400">Personalized cost estimates active</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(true)}
              className="text-xs text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-200 font-medium"
            >
              Edit
            </button>
            <button
              onClick={handleClear}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Deductible</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              ${profile.deductibleRemaining.toLocaleString()} left
            </p>
            <div className="h-1.5 bg-violet-100 dark:bg-violet-900/50 rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full bg-violet-500 rounded-full"
                style={{ width: `${deductiblePercent}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Coinsurance</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {profile.coinsurancePercent}% / {100 - profile.coinsurancePercent}%
            </p>
            <p className="text-xs text-slate-400 mt-1">You / Insurance</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">OOP Max</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              ${profile.oopMaxRemaining.toLocaleString()} left
            </p>
            <div className="h-1.5 bg-violet-100 dark:bg-violet-900/50 rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full bg-violet-500 rounded-full"
                style={{ width: `${oopPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header / Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">
              Calculate Your Actual Cost
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter your deductible & coinsurance for personalized estimates
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400" />
        )}
      </button>

      {/* Expanded Form */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-800">
          {/* Help Section */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-1.5 text-sm text-violet-600 dark:text-violet-400 mt-3 mb-4 hover:underline"
          >
            <HelpCircle className="h-4 w-4" />
            Where do I find these numbers?
          </button>
          
          {showHelp && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 mb-4 text-sm text-slate-600 dark:text-slate-400">
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
                  onClick={() => handleUseTipicalValues(planType)}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
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

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button onClick={handleSave} className="flex-1">
              <Calculator className="h-4 w-4 mr-2" />
              Calculate My Costs
            </Button>
            <Button variant="outline" onClick={() => setIsExpanded(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
