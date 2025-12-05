import {
  MapPin,
  Phone,
  Star,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Heart,
  BadgePercent,
  Info,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, getDistanceLabel } from "@/lib/utils";
import type { HospitalResult, PriceInfo, FinancialAssistance } from "@/types";

interface HospitalCardProps {
  result: HospitalResult;
  rank: number;
}

function PriceDisplay({ priceInfo, grossCharge }: { priceInfo: PriceInfo; grossCharge: number }) {
  const getPriceLabel = () => {
    switch (priceInfo.type) {
      case "cash":
        return "Cash Price";
      case "plan_range":
        return `${priceInfo.planName} Plan Rate`;
      case "insurance_range":
        return "Insurance Rate Range";
      default:
        return "Estimated Price";
    }
  };

  const getPriceSubtext = () => {
    switch (priceInfo.type) {
      case "cash":
        return "Pay directly without insurance";
      case "plan_range":
        return "Negotiated rate range for your plan";
      case "insurance_range":
        return "Range across all plan types";
      default:
        return null;
    }
  };

  // Cash is the only single value now
  const isSingleValue = priceInfo.type === "cash";

  return (
    <div className="bg-gradient-to-r from-primary-50 to-teal-50 dark:from-primary-950/50 dark:to-teal-950/50 rounded-xl p-4">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            {getPriceLabel()}
          </p>
          {isSingleValue ? (
            <p className="text-3xl md:text-4xl font-bold text-primary-700 dark:text-primary-400">
              {formatCurrency(priceInfo.value ?? 0)}
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xl md:text-3xl font-bold text-primary-700 dark:text-primary-400">
                {formatCurrency(priceInfo.min ?? 0)}
              </span>
              <ArrowRight className="h-5 w-5 text-slate-400" />
              <span className="text-2xl md:text-3xl font-bold text-primary-700 dark:text-primary-400">
                {formatCurrency(priceInfo.max ?? 0)}
              </span>
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 mb-1">Gross Charge</p>
          <p className="text-lg text-slate-400 line-through">
            {formatCurrency(grossCharge)}
          </p>
        </div>
      </div>
      {getPriceSubtext() && (
        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          {getPriceSubtext()}
        </p>
      )}
    </div>
  );
}

function FinancialAssistanceInfo({ assistance }: { assistance: FinancialAssistance }) {
  if (!assistance.available) return null;

  // Generate personalized eligibility reasons based on the program
  const getEligibilityReasons = () => {
    const reasons: string[] = [];
    
    if (assistance.discountPercent && assistance.discountPercent >= 75) {
      reasons.push("Your household income falls within the assistance threshold");
      reasons.push("You are currently uninsured or underinsured");
      reasons.push("You reside in the hospital's service area");
    } else if (assistance.discountPercent && assistance.discountPercent >= 50) {
      reasons.push("Your income is below 200% of the Federal Poverty Level");
      reasons.push("You have demonstrated financial hardship");
    } else {
      reasons.push("You qualify based on your insurance status");
      reasons.push("Your income meets the program requirements");
    }
    
    return reasons;
  };

  const reasons = getEligibilityReasons();

  return (
    <div className="mt-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Heart className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h4 className="font-bold text-emerald-800 dark:text-emerald-200 text-base">
              🎉 Great news! You&apos;re eligible for {assistance.discountPercent}% off
            </h4>
          </div>
          
          {assistance.programName && (
            <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-3">
              Through the <strong>{assistance.programName}</strong>
            </p>
          )}
          
          <div className="bg-white/60 dark:bg-slate-900/40 rounded-lg p-3 mb-3">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2 uppercase tracking-wide">
              You qualify because:
            </p>
            <ul className="space-y-1.5">
              {reasons.map((reason, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <span className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs">✓</span>
                  </span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
          
          <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            Contact the hospital&apos;s financial services to confirm eligibility and apply.
          </p>
        </div>
      </div>
    </div>
  );
}

export function HospitalCard({ result, rank }: HospitalCardProps) {
  const { hospital, priceInfo, distance, procedure } = result;

  const getDistanceBadgeVariant = (dist: "close" | "medium" | "far") => {
    if (dist === "close") return "success";
    if (dist === "medium") return "warning";
    return "secondary";
  };

  const getPriceTypeBadge = () => {
    switch (priceInfo.type) {
      case "cash":
        return <Badge variant="secondary">💵 Cash</Badge>;
      case "plan_range":
        return <Badge variant="success">✓ {priceInfo.planName}</Badge>;
      case "insurance_range":
        return <Badge variant="info">📊 All Plans</Badge>;
      default:
        return null;
    }
  };

  const getRankStyle = (r: number) => {
    if (r === 1) return "bg-gradient-to-br from-amber-400 to-amber-500 text-white";
    if (r === 2) return "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700";
    if (r === 3) return "bg-gradient-to-br from-amber-600 to-amber-700 text-white";
    return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
  };

  return (
    <div>
      <Card className="relative overflow-hidden group">
        {/* Rank Badge */}
        <div
          className={`absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${getRankStyle(rank)}`}
        >
          {rank}
        </div>

        {/* Best Price Ribbon */}
        {rank === 1 && (
          <div className="absolute top-0 right-0">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-lg">
              BEST PRICE
            </div>
          </div>
        )}

        {/* Financial Aid Badge */}
        {hospital.financialAssistance?.available && (
          <div className="absolute top-12 right-0">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-l-lg shadow-md flex items-center gap-1">
              <Heart className="h-3 w-3" />
              You Qualify for Aid!
            </div>
          </div>
        )}

        <CardHeader className="pt-6 pl-16">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-lg md:text-xl line-clamp-2">
              {hospital.name}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {hospital.city}, {hospital.state}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                {hospital.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Price Display */}
          <PriceDisplay
            priceInfo={priceInfo}
            grossCharge={hospital.prices[procedure.cpt_code]?.gross_charge || 0}
          />

          {/* Badges Row */}
          <div className="flex flex-wrap gap-2">
            {getPriceTypeBadge()}
            <Badge variant={getDistanceBadgeVariant(distance)}>
              <MapPin className="h-3 w-3 mr-1" />
              {getDistanceLabel(distance)}
            </Badge>
          </div>

          {/* Procedure Info */}
          <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
            <p className="font-medium text-slate-700 dark:text-slate-300">
              {procedure.name}
            </p>
            <p className="text-xs mt-1">
              CPT: {procedure.cpt_code} • {procedure.category}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Phone className="h-4 w-4 mr-2" />
            {hospital.phone}
          </Button>
          <Button variant="ghost" size="sm" className="w-full sm:w-auto">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </CardFooter>
      </Card>

      {/* Financial Assistance Info - Below the card */}
      {hospital.financialAssistance && (
        <FinancialAssistanceInfo assistance={hospital.financialAssistance} />
      )}
    </div>
  );
}
