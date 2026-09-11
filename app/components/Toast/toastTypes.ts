import React from "react";

export type ToastType = "success" | "error" | "warning" | "info" | "server-error" | "network-error";

export interface ToastOptions {
  id?: string;
  title?: string;
  message: string | React.ReactNode;
  type?: ToastType;
  statusCode?: number;
  duration?: number; // ms, default 5000, 0 for infinite
  action?: {
    label: string;
    onClick: () => void;
  };
  details?: string; // Optional expandable or copyable error details
}

export interface ToastItemData extends ToastOptions {
  id: string;
  createdAt: number;
}

export interface ToastContextType {
  toasts: ToastItemData[];
  showToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  success: (title: string, message?: string, options?: Partial<ToastOptions>) => string;
  error: (title: string, message?: string, options?: Partial<ToastOptions>) => string;
  warning: (title: string, message?: string, options?: Partial<ToastOptions>) => string;
  info: (title: string, message?: string, options?: Partial<ToastOptions>) => string;
  apiError: (error: unknown, fallbackMessage?: string, options?: Partial<ToastOptions>) => string;
}

/**
 * Parses HTTP status code and extracts meaningful message and severity
 */
export function parseApiError(error: unknown, fallbackMessage?: string): {
  statusCode?: number;
  type: ToastType;
  title: string;
  message: string;
  details?: string;
} {
  const err = error as Record<string, any> | undefined;

  const statusCode: number | undefined = err?.response?.status;
  const responseData = err?.response?.data;

  // Extract message from response data if available
  let extractedMessage = "";
  let extractedDetails = "";

  if (typeof responseData === "string") {
    extractedMessage = responseData;
  } else if (responseData && typeof responseData === "object") {
    extractedMessage =
      responseData.message ||
      responseData.error ||
      responseData.msg ||
      (Array.isArray(responseData.errors)
        ? responseData.errors.map((e: any) => (typeof e === "string" ? e : e.message || JSON.stringify(e))).join(", ")
        : "");

    if (responseData.details) {
      extractedDetails = typeof responseData.details === "string" 
        ? responseData.details 
        : JSON.stringify(responseData.details, null, 2);
    }
  }

  // Network / Connection Error
  if (!statusCode) {
    const isNetworkError =
      err?.message === "Network Error" ||
      err?.code === "ERR_NETWORK" ||
      err?.code === "ECONNREFUSED" ||
      (err?.request && !err?.response);

    if (isNetworkError) {
      return {
        type: "network-error",
        title: "Connection Failed",
        message:
          extractedMessage ||
          fallbackMessage ||
          "Unable to connect to the server. Please verify your backend server is running on http://localhost:8080.",
      };
    }

    return {
      type: "error",
      title: "Request Failed",
      message: extractedMessage || err?.message || fallbackMessage || "An unexpected error occurred.",
    };
  }

  // Status code specific mapping
  switch (statusCode) {
    case 400:
      return {
        statusCode: 400,
        type: "warning",
        title: "Bad Request (400)",
        message: extractedMessage || fallbackMessage || "Invalid request payload. Please check the submitted fields.",
        details: extractedDetails,
      };

    case 401:
      return {
        statusCode: 401,
        type: "warning",
        title: "Unauthorized (401)",
        message: extractedMessage || fallbackMessage || "Authentication required. Please sign in to continue.",
        details: extractedDetails,
      };

    case 403:
      return {
        statusCode: 403,
        type: "error",
        title: "Access Forbidden (403)",
        message: extractedMessage || fallbackMessage || "You don't have permission to perform this action.",
        details: extractedDetails,
      };

    case 404:
      return {
        statusCode: 404,
        type: "info",
        title: "Not Found (404)",
        message: extractedMessage || fallbackMessage || "The requested resource could not be found.",
        details: extractedDetails,
      };

    case 409:
      return {
        statusCode: 409,
        type: "warning",
        title: "Conflict (409)",
        message: extractedMessage || fallbackMessage || "A record with this information already exists (e.g. email or workspace).",
        details: extractedDetails,
      };

    case 422:
      return {
        statusCode: 422,
        type: "warning",
        title: "Validation Failed (422)",
        message: extractedMessage || fallbackMessage || "The submitted data failed validation rules.",
        details: extractedDetails,
      };

    case 429:
      return {
        statusCode: 429,
        type: "warning",
        title: "Rate Limited (429)",
        message: extractedMessage || fallbackMessage || "Too many requests. Please wait a moment before trying again.",
        details: extractedDetails,
      };

    case 500:
      return {
        statusCode: 500,
        type: "server-error",
        title: "Internal Server Error (500)",
        message:
          extractedMessage ||
          fallbackMessage ||
          "The backend server crashed or failed to complete this operation. Check your backend console logs for details.",
        details: extractedDetails || (err?.stack ? err.stack.slice(0, 300) : undefined),
      };

    case 502:
    case 503:
    case 504:
      return {
        statusCode,
        type: "server-error",
        title: `Gateway / Service Error (${statusCode})`,
        message: extractedMessage || fallbackMessage || "The server is currently unavailable or timed out.",
        details: extractedDetails,
      };

    default:
      return {
        statusCode,
        type: statusCode >= 500 ? "server-error" : "error",
        title: `Error (${statusCode})`,
        message: extractedMessage || fallbackMessage || `Request failed with status code ${statusCode}.`,
        details: extractedDetails,
      };
  }
}
