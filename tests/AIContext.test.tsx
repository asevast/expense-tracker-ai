import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AIProvider, useAIConfig } from '@/app/context/AIContext';
import React from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AIProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('provides default configuration', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AIProvider>{children}</AIProvider>
    );
    const { result } = renderHook(() => useAIConfig(), { wrapper });

    expect(result.current.config).toEqual({
      enabled: false,
      provider: "openai",
      baseUrl: "https://api.openai.com/v1",
      apiKey: "",
      modelId: "gpt-4o-mini",
    });
  });

  it('updates configuration', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AIProvider>{children}</AIProvider>
    );
    const { result } = renderHook(() => useAIConfig(), { wrapper });

    act(() => {
      result.current.updateConfig({ enabled: true, apiKey: 'test-key' });
    });

    expect(result.current.config.enabled).toBe(true);
    expect(result.current.config.apiKey).toBe('test-key');
    expect(result.current.config.provider).toBe('openai'); // preserved
  });

  it('resets configuration', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AIProvider>{children}</AIProvider>
    );
    const { result } = renderHook(() => useAIConfig(), { wrapper });

    act(() => {
      result.current.updateConfig({ enabled: true, apiKey: 'test-key' });
    });

    expect(result.current.config.enabled).toBe(true);

    act(() => {
      result.current.resetConfig();
    });

    expect(result.current.config).toEqual({
      enabled: false,
      provider: "openai",
      baseUrl: "https://api.openai.com/v1",
      apiKey: "",
      modelId: "gpt-4o-mini",
    });
  });
});
