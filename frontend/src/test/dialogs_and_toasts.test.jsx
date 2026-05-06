import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast, ConfirmDialog } from '../components/ui';

function TestToastConsumer({ message, actionLabel, onAction }) {
  const { showToast } = useToast();
  return (
    <button
      onClick={() => showToast({ message, actionLabel, onAction })}
    >
      Trigger Toast
    </button>
  );
}

describe('Toast and ConfirmDialog', () => {
  describe('ToastProvider', () => {
    it('shows toast with message and triggers action button', () => {
      const handleAction = vi.fn();
      render(
        <ToastProvider>
          <TestToastConsumer
            message="Item removed"
            actionLabel="Undo"
            onAction={handleAction}
          />
        </ToastProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: /trigger toast/i }));
      expect(screen.getByText('Item removed')).toBeInTheDocument();

      const undoBtn = screen.getByRole('button', { name: /undo/i });
      expect(undoBtn).toBeInTheDocument();
      fireEvent.click(undoBtn);
      expect(handleAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('ConfirmDialog', () => {
    it('renders when open and responds to confirm and cancel', () => {
      const handleConfirm = vi.fn();
      const handleCancel = vi.fn();

      const { rerender } = render(
        <ConfirmDialog
          isOpen={true}
          title="Clear Basket?"
          description="This cannot be undone."
          confirmLabel="Clear"
          cancelLabel="Keep Items"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      );

      expect(screen.getByText('Clear Basket?')).toBeInTheDocument();
      expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();

      const cancelBtn = screen.getByRole('button', { name: /keep items/i });
      const confirmBtn = screen.getByRole('button', { name: /clear/i });

      fireEvent.click(confirmBtn);
      expect(handleConfirm).toHaveBeenCalledTimes(1);

      fireEvent.click(cancelBtn);
      expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it('closes on Escape key press', () => {
      const handleCancel = vi.fn();
      render(
        <ConfirmDialog
          isOpen={true}
          title="Clear Basket?"
          onCancel={handleCancel}
        />
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleCancel).toHaveBeenCalledTimes(1);
    });
  });
});
