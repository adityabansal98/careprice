import { Sparkles, Lightbulb } from "lucide-react";
import type { Procedure } from "@/types";

interface AIInsightsProps {
  procedure: Procedure;
}

export function AIInsights({ procedure }: AIInsightsProps) {
  if (!procedure.insights || procedure.insights.length === 0) {
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
        <div className="p-5">
          <ul className="space-y-3">
            {procedure.insights.map((insight, index) => (
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
        </div>

        {/* Footer */}
        <div className="px-5 pb-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            💡 These insights are based on general pricing trends and may vary by location and provider.
          </p>
        </div>
      </div>
    </div>
  );
}


