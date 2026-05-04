"use client";

import { useState, useEffect, useRef } from "react";
import { useAIConfig } from "@/app/context/AIContext";
import { callAI } from "@/app/lib/ai-client";
import { CATEGORIES, Category, TransactionType } from "@/app/types";

export function useCategorySuggestion(description: string, type: TransactionType, currentCategory?: Category) {
  const { config } = useAIConfig();
  const [suggestion, setSuggestion] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let active = true;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't suggest if AI is disabled or description is too short
    if (!config.enabled || !description.trim() || description.length < 3) {
      setSuggestion(null);
      return;
    }

    // Immediately clear suggestion if it now matches currentCategory
    setSuggestion(prev => (prev === currentCategory ? null : prev));

    // Debounce AI call
    timeoutRef.current = setTimeout(async () => {
      if (!active) return;
      setIsLoading(true);
      try {
        const availableCategories = CATEGORIES.filter(c => c.type === type).map(c => c.value);
        const categoriesList = availableCategories.join(", ");

        const systemPrompt = `You are a professional financial assistant. Categorize the given description into exactly one of these categories: [${categoriesList}]. Return ONLY the category name.`;
        
        const { content } = await callAI(config, [
          { role: "system", content: systemPrompt },
          { role: "user", content: description }
        ]);

        if (!active) return;

        const cleanedCategory = content.trim() as Category;
        let finalSuggestion: Category | null = null;
        
        // Validate that the returned category is valid for the current type
        if (availableCategories.includes(cleanedCategory)) {
          finalSuggestion = cleanedCategory;
        } else {
          // Fallback: try to find a partial match or case-insensitive match
          const found = availableCategories.find(
            cat => cat.toLowerCase() === cleanedCategory.toLowerCase()
          );
          if (found) {
            finalSuggestion = found as Category;
          }
        }

        // Only suggest if it's different from current category
        if (finalSuggestion && finalSuggestion !== currentCategory) {
          setSuggestion(finalSuggestion);
        } else {
          setSuggestion(null);
        }
      } catch (error) {
        console.error("AI Category Suggestion Error:", error);
        if (active) setSuggestion(null);
      } finally {
        if (active) setIsLoading(false);
      }
    }, 600);

    return () => {
      active = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [description, type, config, currentCategory]);

  return { suggestion, isLoading };
}
