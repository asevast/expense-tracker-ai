import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AISettingsModal } from '@/app/components/Settings/AISettingsModal';
import { useAIConfig } from '@/app/context/AIContext';
import { callAI } from '@/app/lib/ai-client';
import React from 'react';

// Mock the hooks and clients
vi.mock('@/app/context/AIContext', () => ({
  useAIConfig: vi.fn(),
}));

vi.mock('@/app/lib/ai-client', () => ({
  callAI: vi.fn(),
}));

describe('AISettingsModal', () => {
  const mockUpdateConfig = vi.fn();
  const mockOnClose = vi.fn();
  const mockConfig = {
    enabled: false,
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    modelId: 'gpt-4o-mini',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAIConfig as any).mockReturnValue({
      config: mockConfig,
      updateConfig: mockUpdateConfig,
    });
  });

  it('renders correctly when open', () => {
    render(<AISettingsModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('AI Settings')).toBeDefined();
    expect(screen.getByLabelText('Enable AI Features')).toBeDefined();
    expect(screen.getByLabelText('AI Provider')).toBeDefined();
    expect(screen.getByLabelText('API Key')).toBeDefined();
    expect(screen.getByLabelText('Model ID')).toBeDefined();
    expect(screen.getByText('Save Changes')).toBeDefined();
  });

  it('updates local state and calls updateConfig on save', () => {
    render(<AISettingsModal isOpen={true} onClose={mockOnClose} />);
    
    const apiKeyInput = screen.getByLabelText('API Key');
    fireEvent.change(apiKeyInput, { target: { value: 'new-api-key' } });
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    expect(mockUpdateConfig).toHaveBeenCalledWith(expect.objectContaining({
      apiKey: 'new-api-key',
    }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('updates provider and defaults when provider changes', () => {
    render(<AISettingsModal isOpen={true} onClose={mockOnClose} />);
    
    const providerSelect = screen.getByLabelText('AI Provider');
    fireEvent.change(providerSelect, { target: { value: 'anthropic' } });
    
    expect(screen.queryByLabelText('API Base URL')).toBeNull(); // Anthropic hides base URL
    
    const modelInput = screen.getByLabelText('Model ID') as HTMLInputElement;
    expect(modelInput.value).toBe('claude-3-haiku-20240307');
  });

  it('tests connection successfully', async () => {
    (callAI as any).mockResolvedValueOnce({
      content: 'Success'
    });

    render(<AISettingsModal isOpen={true} onClose={mockOnClose} />);
    
    const apiKeyInput = screen.getByLabelText('API Key');
    fireEvent.change(apiKeyInput, { target: { value: 'test-key' } });
    
    const testButton = screen.getByText('Test Connection');
    fireEvent.click(testButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Connection successful/)).toBeDefined();
    });
    
    expect(callAI).toHaveBeenCalled();
  });

  it('handles test connection failure', async () => {
    (callAI as any).mockRejectedValueOnce(new Error('Invalid API Key'));

    render(<AISettingsModal isOpen={true} onClose={mockOnClose} />);
    
    const apiKeyInput = screen.getByLabelText('API Key');
    fireEvent.change(apiKeyInput, { target: { value: 'invalid-key' } });
    
    const testButton = screen.getByText('Test Connection');
    fireEvent.click(testButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid API Key/)).toBeDefined();
    });
  });
});
