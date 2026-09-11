"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ToastContainer } from "./ToastContainer";
import {
  ToastContextType,
  ToastItemData,
  ToastOptions,
  ToastType,
  parseApiError,
} from "./toastTypes";

// External event dispatcher so toast can be triggered anywhere without hooks
type ToastListener = (toast: ToastItemData) => void;
type RemoveListener = (id: string) => void;
type ClearListener = () => void;

class ToastManager {
  private listeners: Set<ToastListener> = new Set();
  private removeListeners: Set<RemoveListener> = new Set();
  private clearListeners: Set<ClearListener> = new Set();

  subscribe(onAdd: ToastListener, onRemove: RemoveListener, onClear: ClearListener) {
    this.listeners.add(onAdd);
    this.removeListeners.add(onRemove);
    this.clearListeners.add(onClear);

    return () => {
      this.listeners.delete(onAdd);
      this.removeListeners.delete(onRemove);
      this.clearListeners.delete(onClear);
    };
  }

  show(options: ToastOptions): string {
    const id = options.id || Math.random().toString(36).substring(2, 9);
    const toastData: ToastItemData = {
      ...options,
      id,
      createdAt: Date.now(),
    };

    this.listeners.forEach((listener) => listener(toastData));
    return id;
  }

  remove(id: string) {
    this.removeListeners.forEach((listener) => listener(id));
  }

  clear() {
    this.clearListeners.forEach((listener) => listener());
  }
}

export const toastManager = new ToastManager();

// Standalone toast helper for use inside or outside React components
export const toast = {
  show: (options: ToastOptions) => toastManager.show(options),
  remove: (id: string) => toastManager.remove(id),
  clear: () => toastManager.clear(),

  success: (title: string, message?: string, options?: Partial<ToastOptions>) =>
    toastManager.show({
      title,
      message: message || "",
      type: "success",
      ...options,
    }),

  error: (title: string, message?: string, options?: Partial<ToastOptions>) =>
    toastManager.show({
      title,
      message: message || "",
      type: "error",
      ...options,
    }),

  warning: (title: string, message?: string, options?: Partial<ToastOptions>) =>
    toastManager.show({
      title,
      message: message || "",
      type: "warning",
      ...options,
    }),

  info: (title: string, message?: string, options?: Partial<ToastOptions>) =>
    toastManager.show({
      title,
      message: message || "",
      type: "info",
      ...options,
    }),

  apiError: (error: unknown, fallbackMessage?: string, options?: Partial<ToastOptions>) => {
    const parsed = parseApiError(error, fallbackMessage);
    return toastManager.show({
      title: parsed.title,
      message: parsed.message,
      type: parsed.type,
      statusCode: parsed.statusCode,
      details: parsed.details,
      duration: parsed.type === "server-error" ? 7000 : 5000,
      ...options,
    });
  },
};

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItemData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback((options: ToastOptions): string => {
    return toastManager.show(options);
  }, []);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(
      (newToast) => {
        setToasts((prev) => {
          // Limit to max 5 toasts visible at once to avoid screen flooding
          const filtered = prev.filter((t) => t.id !== newToast.id);
          const next = [newToast, ...filtered];
          return next.slice(0, 5);
        });
      },
      (id) => {
        removeToast(id);
      },
      () => {
        clearToasts();
      }
    );

    return unsubscribe;
  }, [removeToast, clearToasts]);

  const value: ToastContextType = {
    toasts,
    showToast,
    removeToast,
    clearToasts,
    success: (title, message, options) => toast.success(title, message, options),
    error: (title, message, options) => toast.error(title, message, options),
    warning: (title, message, options) => toast.warning(title, message, options),
    info: (title, message, options) => toast.info(title, message, options),
    apiError: (error, fallbackMessage, options) => toast.apiError(error, fallbackMessage, options),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} position="top-right" />
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    // If used outside provider, still return singleton methods
    return {
      toasts: [],
      showToast: toast.show,
      removeToast: toast.remove,
      clearToasts: toast.clear,
      success: toast.success,
      error: toast.error,
      warning: toast.warning,
      info: toast.info,
      apiError: toast.apiError,
    };
  }
  return context;
}
