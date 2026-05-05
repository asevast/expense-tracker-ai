import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCategorySuggestion } from '@/app/hooks/useCategorySuggestion';
import { useAIConfig } from '@/app/context/AIContext';
import { useTranslation } from '@/app/context/LanguageContext';
import { callAI } from '@/app/lib/ai-client';

// Mock the AI Context
vi.mock('@/app/context/AIContext', () => ({
  useAIConfig: vi.fn(),
}));

// Mock the Language Context
vi.mock('@/app/context/LanguageContext', () => ({
  useTranslation: vi.fn(),
}));

// Mock the AI client
vi.mock('@/app/lib/ai-client', () => ({
  callAI: vi.fn(),
}));

describe('useCategorySuggestion', () => {
  const mockConfig = {
    enabled: true,
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: 'test-key',
    modelId: 'gpt-4o-mini',
  };

  beforeEach(() => {
    vi.useFakeTimers();
    (useAIConfig as any).mockReturnValue({ config: mockConfig });
    (useTranslation as any).mockReturnValue({ language: 'en', t: (k: string) => k });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not suggest if AI is disabled', async () => {
    (useAIConfig as any).mockReturnValue({ 
      config: { ...mockConfig, enabled: false } 
    });

    const { result } = renderHook(() => 
      useCategorySuggestion('Lunch at restaurant', 'expense')
    );

    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current.suggestion).toBeNull();
    expect(callAI).not.toHaveBeenCalled();
  });

  it('should not suggest if description is too short', async () => {
    const { result } = renderHook(() => 
      useCategorySuggestion('Lu', 'expense')
    );

    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current.suggestion).toBeNull();
    expect(callAI).not.toHaveBeenCalled();
  });

  it('should suggest category after debounce period', async () => {
    (callAI as any).mockResolvedValue({ content: 'Food' });

    const { result } = renderHook(() => 
      useCategorySuggestion('Lunch at restaurant', 'expense')
    );

    // Should be loading and no suggestion yet
    expect(result.current.suggestion).toBeNull();
    
    // Advance timers
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(callAI).toHaveBeenCalledTimes(1);
    expect(result.current.suggestion).toBe('Food');
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle case-insensitive matches from AI', async () => {
    (callAI as any).mockResolvedValue({ content: 'food' }); // Lowercase

    const { result } = renderHook(() => 
      useCategorySuggestion('Lunch at restaurant', 'expense')
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.suggestion).toBe('Food'); // Normalized to 'Food'
  });

  it('should handle invalid category from AI', async () => {
    (callAI as any).mockResolvedValue({ content: 'UnkownCategory' });

    const { result } = renderHook(() => 
      useCategorySuggestion('Lunch at restaurant', 'expense')
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.suggestion).toBeNull();
  });

  it('should handle AI error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (callAI as any).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => 
      useCategorySuggestion('Lunch at restaurant', 'expense')
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.suggestion).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should skip suggestion if it matches current category', async () => {
    (callAI as any).mockResolvedValue({ content: 'Food' });

    const { result } = renderHook(() => 
      useCategorySuggestion('Lunch at restaurant', 'expense', 'Food')
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.suggestion).toBeNull();
  });

  it('should debounce multiple rapid changes', async () => {
    (callAI as any).mockResolvedValue({ content: 'Food' });

    const { rerender } = renderHook(
      ({ desc }) => useCategorySuggestion(desc, 'expense'),
      { initialProps: { desc: 'Lunch' } }
    );

    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    rerender({ desc: 'Lunch at' });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    rerender({ desc: 'Lunch at restaurant' });
    act(() => {
      vi.advanceTimersByTime(600);
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Should only be called once with the final value
    expect(callAI).toHaveBeenCalledTimes(1);
    expect(callAI).toHaveBeenCalledWith(mockConfig, expect.anything());
  });

  it('should suggest income categories for income type', async () => {
    (callAI as any).mockResolvedValue({ content: 'Salary' });

    const { result } = renderHook(() => 
      useCategorySuggestion('Monthly salary', 'income')
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.suggestion).toBe('Salary');
  });

  it('should clear suggestion immediately if currentCategory changes to match it', async () => {
    (callAI as any).mockResolvedValue({ content: 'Food' });

    const { result, rerender } = renderHook(
      ({ currentCat }) => useCategorySuggestion('Lunch', 'expense', currentCat),
      { initialProps: { currentCat: undefined as any } }
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });
    expect(result.current.suggestion).toBe('Food');

    // Change currentCat to 'Food'
    rerender({ currentCat: 'Food' });

    // Should be cleared immediately without waiting for debounce
    expect(result.current.suggestion).toBeNull();
  });
});
