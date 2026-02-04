"use client";

import { Star, ThumbsUp, Calendar, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Review } from "@/types";

interface ReviewsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospitalName: string;
  hospitalRating: number;
  reviews: Review[];
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

function RatingBreakdown({ reviews }: { reviews: Review[] }) {
  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
  }));

  const maxCount = Math.max(...ratingCounts.map((r) => r.count), 1);

  return (
    <div className="space-y-2">
      {ratingCounts.map(({ rating, count }) => (
        <div key={rating} className="flex items-center gap-2 text-sm">
          <span className="w-3 text-slate-600 dark:text-slate-400">{rating}</span>
          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
          <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${(count / maxCount) * 100}%` }}
            />
          </div>
          <span className="w-6 text-right text-slate-500 dark:text-slate-400 text-xs">
            {count}
          </span>
        </div>
      ))}
    </div>
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
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-slate-900 dark:text-white">
              {review.author}
            </span>
            <StarRating rating={review.rating} />
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
}: ReviewsModalProps) {
  const sortedReviews = [...reviews].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
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
              <Badge variant="secondary">{reviews.length} reviews</Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex-1 overflow-hidden flex flex-col gap-6">
          {/* Rating Breakdown */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Rating Breakdown
            </h3>
            <RatingBreakdown reviews={reviews} />
          </div>

          {/* Reviews List */}
          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 sticky top-0 bg-white dark:bg-slate-900 py-2">
              Recent Reviews
            </h3>
            <div className="space-y-4">
              {sortedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
