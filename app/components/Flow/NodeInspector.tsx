"use client";

import React, { FormEvent, useState } from "react";
import {
  X,
  HelpCircle,
  RefreshCw,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  AlertTriangle,
  Play,
  Globe,
} from "lucide-react";
import { ApiTestResult, CustomField, HttpMethod, NodeDetails } from "@/app/types/flow";
import { CustomFieldsList } from "./CustomFieldsList";

interface NodeInspectorProps {
  selectedNodeId: string;
  draftNode: NodeDetails;
  onDraftNodeChange: (updated: NodeDetails) => void;
  onClose: () => void;
  onSave: (e: FormEvent) => void;
  onTestApi: () => void;
  isTestingSingleApi: boolean;
  testApiResult: ApiTestResult | null;
  isSaving?: boolean;
}

interface FormErrors {
  title?: string;
  baseUrl?: string;
  endpoint?: string;
  requestBody?: string;
}

export function NodeInspector({
  selectedNodeId,
  draftNode,
  onDraftNodeChange,
  onClose,
  onSave,
  onTestApi,
  isTestingSingleApi,
  testApiResult,
  isSaving = false,
}: NodeInspectorProps) {
  const [showAuthToken, setShowAuthToken] = useState(false);
  const [paramsTab, setParamsTab] = useState<"headers" | "query">("headers");
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  const existingCustomFields = draftNode.customFields ?? [];

  // Separate headers and query fields
  const headerFields = existingCustomFields.filter(
    (f) => !f.type || f.type === "header" || f.type === "text"
  );
  const queryFields = existingCustomFields.filter((f) => f.type === "query");

  const currentTabFields = paramsTab === "headers" ? headerFields : queryFields;

  // Validation function
  const validateForm = (isTesting: boolean = false): boolean => {
    const errors: FormErrors = {};

    if (!isTesting) {
      const title = (draftNode.label || draftNode.node_title || "").trim();
      if (!title) {
        errors.title = "API Name is required";
      }
    }

    const baseUrl = (draftNode.baseUrl || "").trim();
    if (!baseUrl) {
      errors.baseUrl = "Base URL is required";
    } else if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
      errors.baseUrl = "Base URL must begin with http:// or https:// (e.g. https://api.example.com)";
    }

    const endpoint = (draftNode.endpoint || "").trim();
    if (!endpoint) {
      errors.endpoint = "Endpoint path is required (e.g. /v1/users)";
    }

    if (draftNode.method !== "GET" && draftNode.requestBody?.trim()) {
      try {
        JSON.parse(draftNode.requestBody);
      } catch (e: any) {
        errors.requestBody = e.message || "Invalid JSON syntax in request body";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handlers for parameters inside draftNode
  const handleAddField = () => {
    const newField: CustomField = {
      id: `field-${Date.now()}`,
      label: "",
      value: "",
      type: paramsTab === "headers" ? "header" : "query",
    };
    onDraftNodeChange({
      ...draftNode,
      customFields: [...existingCustomFields, newField],
    });
  };

  const handleRemoveField = (fieldId: string) => {
    onDraftNodeChange({
      ...draftNode,
      customFields: existingCustomFields.filter((f) => f.id !== fieldId),
    });
  };

  const handleUpdateField = (
    fieldId: string,
    key: "label" | "value",
    val: string
  ) => {
    onDraftNodeChange({
      ...draftNode,
      customFields: existingCustomFields.map((f) =>
        f.id === fieldId ? { ...f, [key]: val } : f
      ),
    });
  };

  const handleFormatJson = () => {
    if (!draftNode.requestBody) return;
    try {
      const parsed = JSON.parse(draftNode.requestBody);
      const formatted = JSON.stringify(parsed, null, 2);
      onDraftNodeChange({ ...draftNode, requestBody: formatted });
      setFieldErrors((prev) => ({ ...prev, requestBody: undefined }));
    } catch (e: any) {
      setFieldErrors((prev) => ({
        ...prev,
        requestBody: e.message || "Invalid JSON syntax",
      }));
    }
  };

  const handleRequestBodyChange = (val: string) => {
    onDraftNodeChange({ ...draftNode, requestBody: val });
    if (!val.trim()) {
      setFieldErrors((prev) => ({ ...prev, requestBody: undefined }));
      return;
    }
    try {
      JSON.parse(val);
      setFieldErrors((prev) => ({ ...prev, requestBody: undefined }));
    } catch (e: any) {
      setFieldErrors((prev) => ({
        ...prev,
        requestBody: e.message || "Malformed JSON",
      }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) {
      return;
    }
    onSave(e);
  };

  const handleTestClick = () => {
    if (!validateForm(true)) {
      return;
    }
    onTestApi();
  };

  const titleValue = draftNode.label ?? draftNode.node_title ?? "";
  const descriptionValue =
    draftNode.description ?? draftNode.node_description ?? "";

  const isFormEmpty =
    !titleValue.trim() ||
    !draftNode.baseUrl?.trim() ||
    !draftNode.endpoint?.trim() ||
    Boolean(fieldErrors.requestBody);

  return (
    <>
      <div
        className="inspector-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="inspector-panel" aria-label="Node Inspector">
        <div className="inspector-panel__header">
          <div className="inspector-panel__title-wrap">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Globe size={16} style={{ color: "var(--neon-lime)" }} />
              <h3>API Configuration</h3>
            </div>
            <p>
              {draftNode.nodeNumber
                ? `Node Step #${draftNode.nodeNumber} • ID: ${selectedNodeId}`
                : `Node ID: ${selectedNodeId}`}
            </p>
          </div>
          <button
            type="button"
            className="action-icon-btn"
            onClick={onClose}
            title="Close inspector"
          >
            <X size={18} />
          </button>
        </div>

        <form className="flex-1 flex flex-col overflow-hidden" onSubmit={handleSubmit}>
          <div className="inspector-panel__body">
            {/* API Title */}
            <div className="form-group">
              <label>
                API Name <span style={{ color: "var(--neon-lime)" }}>*</span>
              </label>
              <input
                className="form-input"
                value={titleValue}
                onChange={(e) => {
                  onDraftNodeChange({
                    ...draftNode,
                    label: e.target.value,
                    node_title: e.target.value,
                  });
                  if (fieldErrors.title && e.target.value.trim()) {
                    setFieldErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
                placeholder="e.g. User Authentication"
                style={{
                  borderColor: fieldErrors.title ? "#F43F5E" : undefined,
                }}
              />
              {fieldErrors.title && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11px",
                    color: "#F43F5E",
                    marginTop: "4px",
                  }}
                >
                  <AlertTriangle size={12} />
                  <span>{fieldErrors.title}</span>
                </div>
              )}
            </div>

            {/* API Description */}
            <div className="form-group">
              <label>Description</label>
              <input
                className="form-input text-xs"
                value={descriptionValue}
                onChange={(e) =>
                  onDraftNodeChange({
                    ...draftNode,
                    description: e.target.value,
                    node_description: e.target.value,
                  })
                }
                placeholder="e.g. Sends login credentials and retrieves access token"
              />
            </div>

            {/* Method & Protocol */}
            <div className="form-group">
              <label>
                HTTP Method <span style={{ color: "var(--neon-lime)" }}>*</span>
              </label>
              <div style={{ display: "flex", gap: "6px" }}>
                {(["GET", "POST", "PUT", "DELETE", "PATCH"] as HttpMethod[]).map(
                  (m) => {
                    const isSelected = (draftNode.method || "POST") === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() =>
                          onDraftNodeChange({ ...draftNode, method: m })
                        }
                        style={{
                          flex: 1,
                          padding: "6px 0",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 800,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          background: isSelected
                            ? m === "GET"
                              ? "rgba(56, 189, 248, 0.2)"
                              : m === "POST"
                              ? "rgba(186, 255, 57, 0.2)"
                              : m === "DELETE"
                              ? "rgba(244, 63, 94, 0.2)"
                              : "rgba(251, 191, 36, 0.2)"
                            : "#131720",
                          color: isSelected
                            ? m === "GET"
                              ? "#38BDF8"
                              : m === "POST"
                              ? "var(--neon-lime)"
                              : m === "DELETE"
                              ? "#F43F5E"
                              : "#FBBF24"
                            : "#8E9BAE",
                          border: isSelected
                            ? m === "GET"
                              ? "1px solid rgba(56, 189, 248, 0.5)"
                              : m === "POST"
                              ? "1px solid rgba(186, 255, 57, 0.5)"
                              : m === "DELETE"
                              ? "1px solid rgba(244, 63, 94, 0.5)"
                              : "1px solid rgba(251, 191, 36, 0.5)"
                            : "1px solid #1E2533",
                        }}
                      >
                        {m}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Base URL */}
            <div className="form-group">
              <label>
                Base URL <span style={{ color: "var(--neon-lime)" }}>*</span>
              </label>
              <input
                className="form-input font-mono text-xs"
                value={draftNode.baseUrl || ""}
                onChange={(e) => {
                  onDraftNodeChange({ ...draftNode, baseUrl: e.target.value });
                  if (fieldErrors.baseUrl && e.target.value.trim()) {
                    setFieldErrors((prev) => ({ ...prev, baseUrl: undefined }));
                  }
                }}
                placeholder="https://api.example.com"
                style={{
                  borderColor: fieldErrors.baseUrl ? "#F43F5E" : undefined,
                }}
              />
              {fieldErrors.baseUrl && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11px",
                    color: "#F43F5E",
                    marginTop: "4px",
                  }}
                >
                  <AlertTriangle size={12} />
                  <span>{fieldErrors.baseUrl}</span>
                </div>
              )}
            </div>

            {/* Endpoint */}
            <div className="form-group">
              <label>
                Endpoint Path <span style={{ color: "var(--neon-lime)" }}>*</span>
              </label>
              <input
                className="form-input font-mono text-xs"
                value={draftNode.endpoint || ""}
                onChange={(e) => {
                  onDraftNodeChange({ ...draftNode, endpoint: e.target.value });
                  if (fieldErrors.endpoint && e.target.value.trim()) {
                    setFieldErrors((prev) => ({ ...prev, endpoint: undefined }));
                  }
                }}
                placeholder="/v1/auth/login"
                style={{
                  borderColor: fieldErrors.endpoint ? "#F43F5E" : undefined,
                }}
              />
              {fieldErrors.endpoint && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11px",
                    color: "#F43F5E",
                    marginTop: "4px",
                  }}
                >
                  <AlertTriangle size={12} />
                  <span>{fieldErrors.endpoint}</span>
                </div>
              )}
            </div>

            {/* Auth Token */}
            <div className="form-group">
              <label className="flex items-center justify-between">
                <span>Authentication Token</span>
                <span className="text-[10px] text-slate-400">Optional</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showAuthToken ? "text" : "password"}
                  className="form-input font-mono text-xs"
                  value={draftNode.authToken || ""}
                  onChange={(e) =>
                    onDraftNodeChange({
                      ...draftNode,
                      authToken: e.target.value,
                    })
                  }
                  placeholder="Bearer token or leave empty for dynamic tokens..."
                  style={{ paddingRight: "36px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowAuthToken(!showAuthToken)}
                  className="action-icon-btn"
                  title={showAuthToken ? "Hide token" : "Show token"}
                  style={{
                    position: "absolute",
                    right: "6px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    padding: "4px",
                  }}
                >
                  {showAuthToken ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "10px", color: "#6C7A8E" }}>
                Leave empty if a previous step automatically outputs the token.
              </p>
            </div>

            {/* Headers & Query Parameters Tabs */}
            <div className="form-group" style={{ marginTop: "6px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    type="button"
                    onClick={() => setParamsTab("headers")}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      background:
                        paramsTab === "headers"
                          ? "rgba(186, 255, 57, 0.15)"
                          : "transparent",
                      color:
                        paramsTab === "headers"
                          ? "var(--neon-lime)"
                          : "#8E9BAE",
                      border:
                        paramsTab === "headers"
                          ? "1px solid rgba(186, 255, 57, 0.3)"
                          : "1px solid transparent",
                    }}
                  >
                    Headers ({headerFields.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setParamsTab("query")}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      background:
                        paramsTab === "query"
                          ? "rgba(186, 255, 57, 0.15)"
                          : "transparent",
                      color:
                        paramsTab === "query" ? "var(--neon-lime)" : "#8E9BAE",
                      border:
                        paramsTab === "query"
                          ? "1px solid rgba(186, 255, 57, 0.3)"
                          : "1px solid transparent",
                    }}
                  >
                    Query Params ({queryFields.length})
                  </button>
                </div>
              </div>

              <CustomFieldsList
                fields={currentTabFields}
                onAddField={handleAddField}
                onRemoveField={handleRemoveField}
                onUpdateField={handleUpdateField}
              />
            </div>

            {/* Request Body (JSON) */}
            <div className="form-group" style={{ marginTop: "12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <label style={{ margin: 0 }}>Request Body</label>
                  <span className="text-[10px] text-[#BAFF39] font-mono">
                    JSON
                  </span>
                </div>

                {draftNode.method !== "GET" && draftNode.requestBody && (
                  <button
                    type="button"
                    onClick={handleFormatJson}
                    className="action-icon-btn"
                    title="Format & validate JSON"
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      color: "var(--neon-lime)",
                    }}
                  >
                    <Sparkles size={11} />
                    <span>Format</span>
                  </button>
                )}
              </div>

              {draftNode.method === "GET" ? (
                <div className="p-2.5 rounded bg-[#0B0D11] border border-[#232A37] text-xs text-slate-400 italic flex items-center gap-1.5">
                  <HelpCircle size={13} className="text-slate-500 shrink-0" />
                  <span>GET requests typically omit request body payloads.</span>
                </div>
              ) : (
                <>
                  <textarea
                    className="form-textarea font-mono text-xs"
                    rows={4}
                    value={draftNode.requestBody || ""}
                    onChange={(e) => handleRequestBodyChange(e.target.value)}
                    placeholder={`{\n  "email": "user@example.com",\n  "password": "secretPassword"\n}`}
                    style={{
                      borderColor: fieldErrors.requestBody ? "#F43F5E" : undefined,
                    }}
                  />
                  {fieldErrors.requestBody && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "11px",
                        color: "#F43F5E",
                        marginTop: "4px",
                      }}
                    >
                      <AlertTriangle size={12} />
                      <span>{fieldErrors.requestBody}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Test API Result Card */}
            {isTestingSingleApi && (
              <div className="p-3 rounded-lg bg-[#0B0D11] border border-sky-500/40 text-xs text-sky-400 flex items-center justify-center gap-2 animate-pulse">
                <RefreshCw size={13} className="animate-spin" />
                <span>Executing API endpoint test...</span>
              </div>
            )}

            {testApiResult && (
              <div
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  background:
                    testApiResult.status === "success"
                      ? "rgba(186, 255, 57, 0.08)"
                      : "rgba(244, 63, 94, 0.08)",
                  border:
                    testApiResult.status === "success"
                      ? "1px solid rgba(186, 255, 57, 0.3)"
                      : "1px solid rgba(244, 63, 94, 0.3)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: "12px",
                      color:
                        testApiResult.status === "success"
                          ? "var(--neon-lime)"
                          : "#F43F5E",
                    }}
                  >
                    {testApiResult.status === "success" ? "✓" : "✕"}{" "}
                    {testApiResult.statusCode} Response
                  </span>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "11px",
                      color: "#CBD5E1",
                    }}
                  >
                    {testApiResult.latencyMs} ms
                  </span>
                </div>
                <pre
                  style={{
                    margin: 0,
                    fontSize: "10px",
                    fontFamily: "monospace",
                    background: "#080A0E",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #1E2533",
                    color: "#CBD5E1",
                    maxHeight: "140px",
                    overflowX: "auto",
                  }}
                >
                  {testApiResult.body}
                </pre>
              </div>
            )}
          </div>

          {/* Inspector Footer Actions */}
          <div className="inspector-panel__footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleTestClick}
              disabled={isTestingSingleApi || !draftNode.baseUrl?.trim() || !draftNode.endpoint?.trim()}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                opacity: !draftNode.baseUrl?.trim() || !draftNode.endpoint?.trim() ? 0.5 : 1,
                cursor: !draftNode.baseUrl?.trim() || !draftNode.endpoint?.trim() ? "not-allowed" : "pointer",
              }}
              title={
                !draftNode.baseUrl?.trim() || !draftNode.endpoint?.trim()
                  ? "Enter Base URL and Endpoint to test"
                  : "Execute API test"
              }
            >
              <Play size={12} fill="currentColor" />
              <span>{isTestingSingleApi ? "Testing..." : "Test API"}</span>
            </button>

            <button
              type="submit"
              className="btn-save-node"
              disabled={isSaving || isFormEmpty}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                opacity: isFormEmpty ? 0.5 : 1,
                cursor: isFormEmpty ? "not-allowed" : "pointer",
              }}
              title={isFormEmpty ? "Complete required fields to save" : "Save API Configuration"}
            >
              {isSaving ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Save API</span>
                </>
              )}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}

export default NodeInspector;
