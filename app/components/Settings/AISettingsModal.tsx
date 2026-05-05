"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/app/components/ui/Modal";
import { Input } from "@/app/components/ui/Input";
import { Select } from "@/app/components/ui/Select";
import { Button } from "@/app/components/ui/Button";
import { useAIConfig } from "@/app/context/AIContext";
import { AIProviderType, AIConfig } from "@/app/types";
import { callAI } from "@/app/lib/ai-client";
import { Check, Loader2, AlertCircle } from "lucide-react";

import { useTranslation } from "@/app/context/LanguageContext";

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROVIDER_OPTIONS: { value: AIProviderType; label: string }[] = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "openrouter", label: "OpenRouter" },
  { value: "local", label: "Local (Ollama/LM Studio)" },
];

const DEFAULT_URLS: Record<AIProviderType, string> = {
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  openrouter: "https://openrouter.ai/api/v1",
  local: "http://localhost:11434/v1",
};

const DEFAULT_MODELS: Record<AIProviderType, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-haiku-20240307",
  openrouter: "anthropic/claude-3-haiku",
  local: "llama3",
};

export function AISettingsModal({ isOpen, onClose }: AISettingsModalProps) {
  const { config, updateConfig } = useAIConfig();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<AIConfig>(config);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(config);
      setTestResult(null);
    }
  }, [isOpen, config]);

  const handleChange = (field: keyof AIConfig, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      
      // Auto-update base URL and model ID when provider changes if they are defaults
      if (field === "provider") {
        const provider = value as AIProviderType;
        newData.baseUrl = DEFAULT_URLS[provider];
        newData.modelId = DEFAULT_MODELS[provider];
      }
      
      return newData;
    });
    setTestResult(null);
  };

  const handleSave = () => {
    updateConfig(formData);
    onClose();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const response = await callAI(formData, [
        { role: "user", content: "Say 'Success'" },
      ]);
      
      setTestResult({
        success: true,
        message: `${t('connectionSuccess')}: ${response.content}`,
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || t('connectionFailed'),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const showBaseUrl = formData.provider !== "anthropic";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('aiSettings')} size="md">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="ai-enabled"
            checked={formData.enabled}
            onChange={(e) => handleChange("enabled", e.target.checked)}
            className="h-4 w-4 rounded border-primary-300 text-primary-600 focus:ring-primary-600"
          />
          <label htmlFor="ai-enabled" className="text-sm font-medium text-primary-900">
            {t('enableAI')}
          </label>
        </div>

        <Select
          label={t('aiProvider')}
          options={PROVIDER_OPTIONS}
          value={formData.provider}
          onChange={(e) => handleChange("provider", e.target.value as AIProviderType)}
        />

        {showBaseUrl && (
          <Input
            label={t('apiBaseUrl')}
            value={formData.baseUrl}
            onChange={(e) => handleChange("baseUrl", e.target.value)}
            placeholder="https://api.openai.com/v1"
          />
        )}

        <Input
          label={t('apiKey')}
          type="password"
          value={formData.apiKey}
          onChange={(e) => handleChange("apiKey", e.target.value)}
          placeholder="sk-..."
        />

        <Input
          label={t('modelId')}
          value={formData.modelId}
          onChange={(e) => handleChange("modelId", e.target.value)}
          placeholder="gpt-4o-mini"
        />

        {testResult && (
          <div
            className={`flex items-start gap-2 rounded-md p-3 text-sm ${
              testResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {testResult.success ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={handleTestConnection}
            disabled={isTesting || !formData.apiKey}
            className="gap-2"
          >
            {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t('testConnection')}
          </Button>
          <Button onClick={handleSave}>{t('save')}</Button>
        </div>
      </div>
    </Modal>
  );
}
