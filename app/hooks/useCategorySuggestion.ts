"use client";

import { useState, useEffect, useRef } from "react";
import { useAIConfig } from "@/app/context/AIContext";
import { callAI } from "@/app/lib/ai-client";
import { CATEGORIES, Category, TransactionType } from "@/app/types";

export function useCategorySuggestion(description: string, type: TransactionType) {
  const { config } = useAIConfig();
  const [suggestion, setSuggestion] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't suggest if AI is disabled or description is too short
    if (!config.enabled || !description.trim() || description.length < 3) {
      setSuggestion(null);
      return;
    }

    // Debounce AI call
    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const availableCategories = CATEGORIES.filter(c => c.type === type).map(c => c.value);
        const categoriesList = availableCategories.join(", ");

        const systemPrompt = `You are a professional financial assistant. Categorize the given description into exactly one of these categories: [${categoriesList}]. Return ONLY the category name.`;
        
        const result = await callAI(config, [
          { role: "system", content: systemPrompt },
          { role: "user", content: description }
        ]);

        let categoryText = "";
        if (config.provider === "anthropic") {
          categoryText = result.content[0]?.text || "";
        } else {
          categoryText = result.choices[0]?.message?.content || "";
        }

        const cleanedCategory = categoryText.trim() as Category;
        
        // Validate that the returned category is valid for the current type
        if (availableCategories.includes(cleanedCategory)) {
          setSuggestion(cleanedCategory);
        } else {
          // Fallback: try to find a partial match or case-insensitive match
          const found = availableCategories.find(
            cat => cat.toLowerCase() === cleanedCategory.toLowerCase()
          );
          if (found) {
            setSuggestion(found as Category);
          } else {
            setSuggestion(null);
          }
        }
      } catch (error) {
        console.error("AI Category Suggestion Error:", error);
        setSuggestion(null);
      } finally {
        setIsLoading(false);
      }
    }, 600);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [description, type, config]);

  return { suggestion, isLoading };
}
