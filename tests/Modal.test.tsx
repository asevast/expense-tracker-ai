import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Modal } from '@/app/components/ui/Modal';
import React from 'react';

describe('Modal Accessibility', () => {
  it('has correct accessibility attributes', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Content</div>
      </Modal>
    );
    
    // This will fail initially because role="dialog" is missing
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBe('modal-title');
    
    const title = screen.getByText('Test Modal');
    expect(title.id).toBe('modal-title');
    
    const closeButton = screen.getByLabelText('Close modal');
    expect(closeButton).toBeDefined();
  });
});
