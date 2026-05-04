"use client";

import { createContext, useContext, useMemo, useCallback } from "react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { AIConfig } from "@/app/types";

interface AIContextType {
  config: AIConfig;
  updateConfig: (updates: Partial<AIConfig>) => void;
  resetConfig: () => void;
}

const DEFAULT_CONFIG: AIConfig = {
  enabled: false,
  provider: "openai",
  baseUrl: "https://api.openai.com/v1",
  apiKey: "",
  modelId: "gpt-4o-mini",
};

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useLocalStorage<AIConfig>("ai-config", DEFAULT_CONFIG);

  const updateConfig = useCallback(
    (updates: Partial<AIConfig>) => {
      setConfig((prev) => ({ ...prev, ...updates }));
    },
    [setConfig]
  );

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, [setConfig]);

  const value = useMemo(
    () => ({
      config,
      updateConfig,
      resetConfig,
    }),
    [config, updateConfig, resetConfig]
  );

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export function useAIConfig() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error("useAIConfig must be used within an AIProvider");
  }
  return context;
}
