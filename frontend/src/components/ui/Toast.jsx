import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback((msgOrOptions, maybeOptions = {}) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const opts = typeof msgOrOptions === 'string'
      ? { message: msgOrOptions, ...maybeOptions }
      : (msgOrOptions || {});

    const { message, actionLabel, onAction, duration } = opts;
    const effectiveDuration = duration || (actionLabel ? 5000 : 3000);

    setToast({
      id: Date.now(),
      message,
      actionLabel,
      onAction,
    });

    timerRef.current = setTimeout(() => {
      setToast(null);
      timerRef.current = null;
    }, effectiveDuration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center justify-center"
      >
        {toast && (
          <div
            role="status"
            className="pointer-events-auto h-[56px] px-6 rounded-full bg-[var(--color-ink,#201e1d)] text-[var(--color-ground,#f5ead8)] shadow-lg flex items-center gap-4 text-[15px] font-medium transition-all animate-in fade-in slide-in-from-bottom-2"
          >
            <span>{toast.message}</span>
            {toast.actionLabel && (
              <button
                type="button"
                onClick={() => {
                  if (toast.onAction) toast.onAction();
                  hideToast();
                }}
                className="font-bold text-[var(--color-terracotta-400,#f6a06b)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-terracotta-500)] rounded px-1 cursor-pointer"
              >
                {toast.actionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: () => {},
      hideToast: () => {},
    };
  }
  return context;
}

export default ToastProvider;
