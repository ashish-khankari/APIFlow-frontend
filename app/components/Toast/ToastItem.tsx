"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ServerCrash,
  AlertOctagon,
  WifiOff,
  Info,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ToastItemData, ToastType } from "./toastTypes";

interface ToastItemProps {
  toast: ToastItemData;
  onRemove: (id: string) => void;
}

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const duration = toast.duration ?? 5000;
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 250);
  };

  useEffect(() => {
    if (duration <= 0) return;

    if (!isPaused) {
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        handleClose();
      }, remainingTimeRef.current);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        const elapsed = Date.now() - startTimeRef.current;
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPaused, duration]);

  // Helper to render appropriate icon
  const getIcon = (type: ToastType, statusCode?: number) => {
    if (type === "server-error" || (statusCode && statusCode >= 500)) {
      return <ServerCrash className="toast-icon toast-icon-server" size={18} />;
    }
    if (type === "network-error") {
      return <WifiOff className="toast-icon toast-icon-network" size={18} />;
    }
    switch (type) {
      case "success":
        return <CheckCircle2 className="toast-icon toast-icon-success" size={18} />;
      case "warning":
        return <AlertTriangle className="toast-icon toast-icon-warning" size={18} />;
      case "info":
        return <Info className="toast-icon toast-icon-info" size={18} />;
      case "error":
      default:
        return <AlertOctagon className="toast-icon toast-icon-error" size={18} />;
    }
  };

  const getStatusBadge = () => {
    if (toast.statusCode) {
      return `HTTP ${toast.statusCode}`;
    }
    if (toast.type === "network-error") {
      return "OFFLINE";
    }
    if (toast.type === "server-error") {
      return "SERVER 500";
    }
    return null;
  };

  const statusBadgeText = getStatusBadge();

  return (
    <div
      className={`apiflow-toast apiflow-toast--${toast.type} ${isClosing ? "apiflow-toast--exit" : "apiflow-toast--enter"}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="alert"
    >
      <div className="apiflow-toast__body">
        <div className="apiflow-toast__icon-wrapper">
          {getIcon(toast.type ?? "info", toast.statusCode)}
        </div>

        <div className="apiflow-toast__content">

          <div className="apiflow-toast__header">{toast.message}</div>

          {toast.action && (
            <div className="apiflow-toast__action">
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  handleClose();
                }}
                className="apiflow-toast__action-btn"
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="apiflow-toast__close-btn"
          aria-label="Close notification"
        >
          <X size={14} />
        </button>
      </div>

      {duration > 0 && (
        <div className="apiflow-toast__progress-track">
          <div
            className={`apiflow-toast__progress-bar apiflow-toast__progress-bar--${toast.type}`}
            style={{
              animationDuration: `${duration}ms`,
              animationPlayState: isPaused ? "paused" : "running",
            }}
          />
        </div>
      )}
    </div>
  );
};
