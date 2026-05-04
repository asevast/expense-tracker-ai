import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AIInsights } from '@/app/components/Dashboard/AIInsights';
import { useExpenses } from '@/app/context/ExpenseContext';
import { useAIConfig } from '@/app/context/AIContext';
import { callAI } from '@/app/lib/ai-client';
import React from 'react';

// Mock the hooks and functions
vi.mock('@/app/context/ExpenseContext', () => ({
  useExpenses: vi.fn(),
}));

vi.mock('@/app/context/AIContext', () => ({
  useAIConfig: vi.fn(),
}));

vi.mock('@/app/lib/ai-client', () => ({
  callAI: vi.fn(),
}));

describe('AIInsights', () => {
  const mockStats = {
    totalIncome: 5000,
    totalExpenses: 3000,
    netBalance: 2000,
    categoryTotals: {
      Food: 500,
      Transportation: 300,
      Entertainment: 200,
      Shopping: 100,
    },
  };

  const mockConfig = {
    enabled: true,
    apiKey: 'test-api-key',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useExpenses as any).mockReturnValue({
      getDashboardStats: () => mockStats,
    });
    (useAIConfig as any).mockReturnValue({
      config: mockConfig,
    });
  });

  it('renders correctly', () => {
    render(<AIInsights />);
    expect(screen.getByText('AI Insights')).toBeDefined();
    expect(screen.getByText(/Click the button to get AI-powered insights/i)).toBeDefined();
  });

  it('calls callAI with correctly aggregated data when button is clicked', async () => {
    (callAI as any).mockResolvedValue({ content: 'Mocked insight' });

    render(<AIInsights />);
    const button = screen.getByText('Analyze Spending');
    fireEvent.click(button);

    await waitFor(() => {
      expect(callAI).toHaveBeenCalledWith(
        mockConfig,
        expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Total Income: $5,000.00'),
          }),
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Total Expenses: $3,000.00'),
          }),
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Food: $500.00'),
          }),
        ])
      );
    });

    expect(screen.getByText('Mocked insight')).toBeDefined();
  });

  it('shows error message if AI is not configured', async () => {
    (useAIConfig as any).mockReturnValue({
      config: { enabled: false },
    });

    render(<AIInsights />);
    const button = screen.getByText('Analyze Spending');
    fireEvent.click(button);

    expect(screen.getByText(/AI is not configured/i)).toBeDefined();
    expect(callAI).not.toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    (callAI as any).mockRejectedValue(new Error('API error'));

    render(<AIInsights />);
    const button = screen.getByText('Analyze Spending');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('API error')).toBeDefined();
    });
  });
});
