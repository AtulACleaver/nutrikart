import React, { useEffect, useRef } from 'react';
import Button from './Button';

export function ConfirmDialog({
  isOpen = false,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) {
  const cancelBtnRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElementRef.current = document.activeElement;
      // Focus safe Cancel button by default to prevent accidental destructive triggers
      setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else if (previouslyFocusedElementRef.current) {
      previouslyFocusedElementRef.current.focus?.();
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[color-mix(in_srgb,var(--color-neutral-900,#2e2b25)_50%,transparent)] backdrop-blur-xs"
      onClick={onCancel}
    >
      <div
        className="bg-[var(--color-ground,#f5ead8)] rounded-[36px] shadow-lg p-6 md:p-8 max-w-[440px] w-full border border-[var(--color-divider)] flex flex-col gap-4 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="confirm-dialog-title"
          className="font-['Caprasimo',serif] text-[24px] md:text-[26px] text-[var(--color-ink,#201e1d)] leading-tight"
        >
          {title}
        </h3>

        {description && (
          <p
            id="confirm-dialog-desc"
            className="text-[15px] text-[var(--color-neutral-800,#474238)] leading-relaxed"
          >
            {description}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 mt-4">
          <Button
            ref={cancelBtnRef}
            variant="secondary"
            size="md"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>

          <Button
            variant={isDestructive ? 'danger' : 'plan'}
            size="md"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
