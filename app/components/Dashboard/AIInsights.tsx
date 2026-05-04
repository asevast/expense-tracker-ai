"use client";

import { useState } from "react";
import { useExpenses } from "@/app/context/ExpenseContext";
import { useAIConfig } from "@/app/context/AIContext";
import { callAI } from "@/app/lib/ai-client";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/app/lib/utils";

export function AIInsights() {
  const { getDashboardStats } = useExpenses();
  const { config } = useAIConfig();
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = getDashboardStats();

  const getSummaryString = () => {
    const topCategories = Object.entries(stats.categoryTotals)
      .filter(([_, total]) => total > 0)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5)
      .map(([cat, total]) => `${cat}: ${formatCurrency(total)}`)
      .join(", ");

    return `Total Income: ${formatCurrency(stats.totalIncome)}, Total Expenses: ${formatCurrency(stats.totalExpenses)}, Net Balance: ${formatCurrency(stats.netBalance)}. Top categories by spending: ${topCategories || "None"}.`;
  };

  const handleAnalyze = async () => {
    if (!config.enabled || !config.apiKey) {
      setError("AI is not configured. Please check your settings.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const summary = getSummaryString();
      const response = await callAI(config, [
        {
          role: "system",
          content: "You are a professional financial advisor. Analyze the user's spending data and provide 2-3 concise, actionable insights or alerts. Use a professional but friendly tone. Use markdown for formatting. Use emojis sparingly. If there is no data, say so.",
        },
        {
          role: "user",
          content: `Data: ${summary}`,
        },
      ]);
      setInsights(response.content);
    } catch (err: any) {
      setError(err.message || "Failed to generate insights");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-primary-900">AI Insights</h3>
        </div>
        <Button
          onClick={handleAnalyze}
          disabled={isLoading}
          size="sm"
          variant="secondary"
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Analyze Spending
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-700 bg-red-50 rounded-md border border-red-200">
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}

      {insights ? (
        <ul className="space-y-2 list-disc list-outside ml-4 text-sm text-primary-700">
          {insights
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .map((line) => line.replace(/^[*+-]\s*/, "").replace(/^\d+\.\s*/, ""))
            .map((insight, index) => (
              <li key={index} className="pl-1">
                {insight}
              </li>
            ))}
        </ul>
      ) : (
        !isLoading && (
          <p className="text-sm text-primary-600 italic">
            Click the button to get AI-powered insights about your spending habits.
          </p>
        )
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-8 text-primary-500">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p className="text-sm">Analyzing your data...</p>
        </div>
      )}
    </Card>
  );
}
