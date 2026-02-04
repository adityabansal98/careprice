"use client";

import { Star, ThumbsUp, Calendar, Tag, Building2, Users, ShieldCheck, Stethoscope, Volume2, SprayCan } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Review, HCAHPSMetrics } from "@/types";

interface ReviewsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospitalName: string;
  hospitalRating: number;
  reviews: Review[];
  hcahpsData: HCAHPSMetrics | null;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const starSize = size === "lg" ? "h-5 w-5" : "h-4 w-4";
  
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${
            star <= rating
              ? "text-amber-400 fill-amber-400"
              : star - 0.5 <= rating
              ? "text-amber-400 fill-amber-400/50"
              : "text-slate-300 dark:text-slate-600"
          }`}
        />
      ))}
    </div>
  );
}

function MetricBar({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  const percentage = (value / 5) * 100;
  
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-slate-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-600 dark:text-slate-400 truncate">{label}</span>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{value.toFixed(1)}</span>
        </div>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function HCAHPSSection({ data }: { data: HCAHPSMetrics }) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-900/20 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">CMS Hospital Compare</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Official Medicare Data</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          {data.lastUpdated}
        </Badge>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white dark:bg-slate-900/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {data.recommendationRate}%
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Would Recommend</p>
        </div>
        <div className="bg-white dark:bg-slate-900/50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">{data.overallRating}</span>
            <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Overall Rating</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        <MetricBar label="Communication with Nurses" value={data.metrics.communicationWithNurses} icon={Users} />
        <MetricBar label="Communication with Doctors" value={data.metrics.communicationWithDoctors} icon={Stethoscope} />
        <MetricBar label="Staff Responsiveness" value={data.metrics.responsivenessOfStaff} icon={ShieldCheck} />
        <MetricBar label="Cleanliness" value={data.metrics.cleanlinessRating} icon={SprayCan} />
        <MetricBar label="Quietness" value={data.metrics.quietnessRating} icon={Volume2} />
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Users className="h-3 w-3" />
          Based on {data.surveyResponseCount.toLocaleString()} patient surveys
        </p>
      </div>
    </div>
  );
}

function SourceBadge({ source }: { source: Review["source"] }) {
  const config = {
    google: { label: "Google", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
    healthgrades: { label: "Healthgrades", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
    yelp: { label: "Yelp", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
  };
  
  const { label, color } = config[source];
  
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {label}
    </span>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0 pb-4 last:pb-0">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-medium text-slate-900 dark:text-white">
              {review.author}
            </span>
            <StarRating rating={review.rating} />
            <SourceBadge source={review.source} />
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(review.date)}
            </span>
            {review.procedureCategory && (
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {review.procedureCategory}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">
        {review.title}
      </h4>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {review.content}
      </p>
      
      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <ThumbsUp className="h-3.5 w-3.5" />
        <span>{review.helpful} people found this helpful</span>
      </div>
    </div>
  );
}

export function ReviewsModal({
  open,
  onOpenChange,
  hospitalName,
  hospitalRating,
  reviews,
  hcahpsData,
}: ReviewsModalProps) {
  const sortedReviews = [...reviews].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const googleReviewCount = reviews.filter(r => r.source === "google").length;
  const healthgradesReviewCount = reviews.filter(r => r.source === "healthgrades").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{hospitalName}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {hospitalRating.toFixed(1)}
                </span>
                <StarRating rating={hospitalRating} size="lg" />
              </div>
              <div className="flex gap-2">
                {googleReviewCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {googleReviewCount} Google
                  </Badge>
                )}
                {healthgradesReviewCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {healthgradesReviewCount} Healthgrades
                  </Badge>
                )}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex-1 overflow-y-auto space-y-6">
          {/* HCAHPS Official Data Section */}
          {hcahpsData && <HCAHPSSection data={hcahpsData} />}

          {/* Patient Reviews Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Patient Reviews
              </h3>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="space-y-4">
              {sortedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>

          {/* Data Attribution */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-xs text-slate-500 dark:text-slate-400">
            <p className="font-medium mb-1">Data Sources</p>
            <ul className="space-y-0.5">
              <li>• Official ratings from CMS Hospital Compare (Medicare.gov)</li>
              <li>• Patient reviews aggregated from Google & Healthgrades</li>
            </ul>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
