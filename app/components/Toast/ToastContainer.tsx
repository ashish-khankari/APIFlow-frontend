"use client";

import React from "react";
import { ToastItem } from "./ToastItem";
import { ToastItemData } from "./toastTypes";

interface ToastContainerProps {
  toasts: ToastItemData[];
  onRemove: (id: string) => void;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center";
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
  position = "top-right",
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className={`apiflow-toast-container apiflow-toast-container--${position}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
};
