"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  X,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  Check,
  ChevronRight,
  Layers,
  Code2,
} from "lucide-react";
import { request } from "@/app/services/request";
import { ExecutionRunDetail, ExecutionRunSummary } from "@/app/types/flow";

interface ExecutionHistoryModalProps {
  isOpen: boolean;
  flowId: number | null;
  flowName: string;
  onClose: () => void;
  onRunFlow?: () => void;
}

export function ExecutionHistoryModal({
  isOpen,
  flowId,
  flowName,
  onClose,
  onRunFlow,
}: ExecutionHistoryModalProps) {
  const [history, setHistory] = useState<ExecutionRunSummary[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [selectedRunDetail, setSelectedRunDetail] =
    useState<ExecutionRunDetail | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [filter, setFilter] = useState<"all" | "completed" | "failed">("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(0);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fetchHistory = useCallback(async () => {
    if (!flowId) return;
    setIsLoadingHistory(true);
    try {
      const res: any = await request({
        url: `/execute/${flowId}/history`,
        method: "GET",
      });
      const items: ExecutionRunSummary[] = res?.data || [];
      setHistory(items);
      if (items.length > 0 && !selectedRunId) {
        setSelectedRunId(items[0].run_id);
      }
    } catch (err) {
      console.error("fetchHistory error:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [flowId, selectedRunId]);

  const fetchRunDetail = useCallback(async (runId: string) => {
    setIsLoadingDetail(true);
    try {
      const res: any = await request({
        url: `/execute/run/${runId}`,
        method: "GET",
      });
      setSelectedRunDetail(res?.data || null);
    } catch (err) {
      console.error("fetchRunDetail error:", err);
      setSelectedRunDetail(null);
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && flowId) {
      fetchHistory();
    }
  }, [isOpen, flowId, fetchHistory]);

  useEffect(() => {
    if (selectedRunId) {
      fetchRunDetail(selectedRunId);
      setExpandedStepIndex(0);
    } else {
      setSelectedRunDetail(null);
    }
  }, [selectedRunId, fetchRunDetail]);

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    if (filter === "completed") return item.status === "completed";
    if (filter === "failed") return item.status === "failed";
    return true;
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1150px",
          height: "85vh",
          maxHeight: "850px",
          background: "#0F1218",
          border: "1px solid #232A37",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8), 0 0 20px rgba(186, 255, 57, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #232A37",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#131720",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(186, 255, 57, 0.12)",
                border: "1px solid rgba(186, 255, 57, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--neon-lime)",
              }}
            >
              <Layers size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
                Execution History
              </h2>
              <p style={{ fontSize: "12px", color: "#8E9BAE", margin: "2px 0 0" }}>
                Workflow: <strong style={{ color: "#E1E7EF" }}>{flowName}</strong> •{" "}
                {history.length} {history.length === 1 ? "run" : "runs"} recorded
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {onRunFlow && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRunFlow();
                }}
                className="btn-primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  padding: "6px 14px",
                  fontWeight: 700,
                }}
              >
                <Play size={13} fill="currentColor" />
                <span>Run Flow</span>
              </button>
            )}

            <button
              type="button"
              onClick={fetchHistory}
              disabled={isLoadingHistory}
              className="action-icon-btn"
              title="Refresh runs"
              style={{ padding: "8px" }}
            >
              <RefreshCw
                size={16}
                style={{
                  animation: isLoadingHistory ? "spin 1s linear infinite" : "none",
                }}
              />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="action-icon-btn"
              title="Close history"
              style={{ padding: "8px" }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body: Split Layout */}
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          {/* Left Panel: Run List */}
          <div
            style={{
              width: "380px",
              borderRight: "1px solid #232A37",
              display: "flex",
              flexDirection: "column",
              background: "#0D1016",
            }}
          >
            {/* Filter bar */}
            <div
              style={{
                padding: "10px 14px",
                borderBottom: "1px solid #232A37",
                display: "flex",
                gap: "6px",
              }}
            >
              {(["all", "completed", "failed"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFilter(mode)}
                  style={{
                    flex: 1,
                    padding: "5px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "capitalize",
                    background: filter === mode ? "rgba(186, 255, 57, 0.12)" : "transparent",
                    color: filter === mode ? "var(--neon-lime)" : "#8E9BAE",
                    border: filter === mode ? "1px solid rgba(186, 255, 57, 0.3)" : "1px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Run List Items */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
              {isLoadingHistory && history.length === 0 ? (
                <div
                  style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    color: "#8E9BAE",
                    fontSize: "13px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <RefreshCw size={20} className="animate-spin text-lime-400" />
                  <span>Loading execution history...</span>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div
                  style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    color: "#8E9BAE",
                    fontSize: "13px",
                  }}
                >
                  <Clock size={28} style={{ margin: "0 auto 10px", opacity: 0.4 }} />
                  <p style={{ margin: "0 0 6px", fontWeight: 600, color: "#E1E7EF" }}>
                    No execution runs found
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#6C7A8E" }}>
                    {filter !== "all"
                      ? `No ${filter} executions recorded.`
                      : "Execute this workflow using 'Run Flow' to see execution records."}
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {filteredHistory.map((run) => {
                    const isSelected = run.run_id === selectedRunId;
                    const isSuccess = run.status === "completed";

                    return (
                      <div
                        key={run.run_id}
                        onClick={() => setSelectedRunId(run.run_id)}
                        style={{
                          padding: "12px 14px",
                          borderRadius: "10px",
                          border: isSelected
                            ? "1px solid rgba(186, 255, 57, 0.5)"
                            : "1px solid #1E2533",
                          background: isSelected
                            ? "rgba(186, 255, 57, 0.05)"
                            : "#131720",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "2px 8px",
                                borderRadius: "9999px",
                                fontSize: "10px",
                                fontWeight: 800,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                background: isSuccess
                                  ? "rgba(186, 255, 57, 0.15)"
                                  : "rgba(244, 63, 94, 0.15)",
                                color: isSuccess ? "var(--neon-lime)" : "#F43F5E",
                                border: isSuccess
                                  ? "1px solid rgba(186, 255, 57, 0.3)"
                                  : "1px solid rgba(244, 63, 94, 0.3)",
                              }}
                            >
                              {isSuccess ? (
                                <CheckCircle2 size={11} />
                              ) : (
                                <AlertCircle size={11} />
                              )}
                              {run.status}
                            </span>
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#8E9BAE",
                                fontWeight: 600,
                              }}
                            >
                              {getRelativeTime(run.started_at)}
                            </span>
                          </div>

                          <ChevronRight
                            size={14}
                            style={{
                              color: isSelected ? "var(--neon-lime)" : "#6C7A8E",
                              transition: "transform 0.15s ease",
                              transform: isSelected ? "translateX(2px)" : "none",
                            }}
                          />
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: "11px",
                            color: "#8E9BAE",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: "11px",
                              color: "#CBD5E1",
                            }}
                          >
                            Run #{run.run_id.slice(0, 8)}...
                          </span>
                          <span>{formatDate(run.started_at)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Run Details & Steps */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              background: "#0F1218",
              overflowY: "auto",
            }}
          >
            {isLoadingDetail ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#8E9BAE",
                  gap: "12px",
                }}
              >
                <RefreshCw size={24} className="animate-spin text-lime-400" />
                <span style={{ fontSize: "13px" }}>Loading step logs...</span>
              </div>
            ) : !selectedRunDetail ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6C7A8E",
                  gap: "8px",
                  padding: "40px",
                  textAlign: "center",
                }}
              >
                <Layers size={36} style={{ opacity: 0.4 }} />
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#E1E7EF", margin: 0 }}>
                  Select an execution run
                </p>
                <p style={{ fontSize: "12px", margin: 0 }}>
                  Choose a run from the left panel to inspect step-by-step API responses.
                </p>
              </div>
            ) : (
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Run Summary Banner */}
                <div
                  style={{
                    padding: "16px 20px",
                    borderRadius: "12px",
                    background: "#131720",
                    border: "1px solid #232A37",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "4px 12px",
                          borderRadius: "9999px",
                          fontSize: "12px",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          background:
                            selectedRunDetail.status === "completed"
                              ? "rgba(186, 255, 57, 0.15)"
                              : "rgba(244, 63, 94, 0.15)",
                          color:
                            selectedRunDetail.status === "completed"
                              ? "var(--neon-lime)"
                              : "#F43F5E",
                          border:
                            selectedRunDetail.status === "completed"
                              ? "1px solid rgba(186, 255, 57, 0.3)"
                              : "1px solid rgba(244, 63, 94, 0.3)",
                        }}
                      >
                        {selectedRunDetail.status === "completed" ? (
                          <CheckCircle2 size={13} />
                        ) : (
                          <AlertCircle size={13} />
                        )}
                        {selectedRunDetail.status}
                      </span>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: "12px",
                            color: "#E1E7EF",
                            background: "#0B0D11",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            border: "1px solid #1E2533",
                          }}
                        >
                          {selectedRunDetail.run_id}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(selectedRunDetail.run_id, "run_id")
                          }
                          className="action-icon-btn"
                          title="Copy Run ID"
                          style={{ padding: "4px" }}
                        >
                          {copiedKey === "run_id" ? (
                            <Check size={13} style={{ color: "var(--neon-lime)" }} />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div style={{ fontSize: "12px", color: "#8E9BAE" }}>
                      Executed: <strong>{formatDate(selectedRunDetail.started_at)}</strong>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                      gap: "10px",
                      paddingTop: "8px",
                      borderTop: "1px solid #1E2533",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "11px", color: "#8E9BAE" }}>Total Steps</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
                        {selectedRunDetail.steps?.length || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#8E9BAE" }}>Passed Steps</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--neon-lime)" }}>
                        {selectedRunDetail.steps?.filter((s) => s.status === "success").length || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#8E9BAE" }}>Failed Steps</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#F43F5E" }}>
                        {selectedRunDetail.steps?.filter((s) => s.status === "failed").length || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#8E9BAE" }}>Total Latency</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#CBD5E1" }}>
                        {selectedRunDetail.steps?.reduce((acc, s) => acc + (s.duration_ms || 0), 0)} ms
                      </div>
                    </div>
                  </div>
                </div>

                {/* Steps Timeline */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <h3
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#FFFFFF",
                      margin: "0 0 4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>Step Execution Details</span>
                    <span
                      style={{
                        fontSize: "11px",
                        background: "#1E2533",
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        color: "#CBD5E1",
                      }}
                    >
                      {selectedRunDetail.steps?.length || 0} steps
                    </span>
                  </h3>

                  {(!selectedRunDetail.steps || selectedRunDetail.steps.length === 0) ? (
                    <div
                      style={{
                        padding: "24px",
                        borderRadius: "10px",
                        background: "#131720",
                        border: "1px solid #232A37",
                        textAlign: "center",
                        color: "#8E9BAE",
                        fontSize: "13px",
                      }}
                    >
                      No step details recorded for this run.
                    </div>
                  ) : (
                    selectedRunDetail.steps.map((step, idx) => {
                      const isSuccess = step.status === "success";
                      const isExpanded = expandedStepIndex === idx;

                      let parsedBody = step.response_body;
                      if (typeof parsedBody === "string") {
                        try {
                          parsedBody = JSON.parse(parsedBody);
                        } catch {
                          // keep string
                        }
                      }

                      const bodyStr =
                        parsedBody !== null && parsedBody !== undefined
                          ? JSON.stringify(parsedBody, null, 2)
                          : "null";

                      return (
                        <div
                          key={step.id ?? idx}
                          style={{
                            borderRadius: "12px",
                            background: "#131720",
                            border: isExpanded
                              ? isSuccess
                                ? "1px solid rgba(186, 255, 57, 0.4)"
                                : "1px solid rgba(244, 63, 94, 0.4)"
                              : "1px solid #232A37",
                            overflow: "hidden",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {/* Step Header */}
                          <div
                            onClick={() =>
                              setExpandedStepIndex(isExpanded ? null : idx)
                            }
                            style={{
                              padding: "14px 18px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              cursor: "pointer",
                              background: isExpanded
                                ? "rgba(255, 255, 255, 0.02)"
                                : "transparent",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                              }}
                            >
                              <div
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "8px",
                                  background: isSuccess
                                    ? "rgba(186, 255, 57, 0.15)"
                                    : "rgba(244, 63, 94, 0.15)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: isSuccess ? "var(--neon-lime)" : "#F43F5E",
                                  fontWeight: 800,
                                  fontSize: "12px",
                                }}
                              >
                                {step.node_order}
                              </div>

                              <div>
                                <div
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: 700,
                                    color: "#FFFFFF",
                                  }}
                                >
                                  {step.node_title || `Step ${step.node_order}`}
                                </div>
                                <div
                                  style={{
                                    fontSize: "11px",
                                    color: "#8E9BAE",
                                    marginTop: "2px",
                                  }}
                                >
                                  {formatDate(step.executed_at)}
                                </div>
                              </div>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              {/* HTTP Status Code */}
                              <span
                                style={{
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  fontSize: "11px",
                                  fontWeight: 800,
                                  fontFamily: "monospace",
                                  background:
                                    step.status_code >= 200 && step.status_code < 300
                                      ? "rgba(186, 255, 57, 0.15)"
                                      : "rgba(244, 63, 94, 0.15)",
                                  color:
                                    step.status_code >= 200 && step.status_code < 300
                                      ? "var(--neon-lime)"
                                      : "#F43F5E",
                                  border:
                                    step.status_code >= 200 && step.status_code < 300
                                      ? "1px solid rgba(186, 255, 57, 0.3)"
                                      : "1px solid rgba(244, 63, 94, 0.3)",
                                }}
                              >
                                {step.status_code ? `${step.status_code}` : "NO CODE"}
                              </span>

                              {/* Latency */}
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontFamily: "monospace",
                                  color: "#8E9BAE",
                                  background: "#0B0D11",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  border: "1px solid #1E2533",
                                }}
                              >
                                {step.duration_ms} ms
                              </span>

                              <ChevronRight
                                size={16}
                                style={{
                                  color: "#8E9BAE",
                                  transition: "transform 0.2s ease",
                                  transform: isExpanded ? "rotate(90deg)" : "none",
                                }}
                              />
                            </div>
                          </div>

                          {/* Expanded Step Body */}
                          {isExpanded && (
                            <div
                              style={{
                                padding: "14px 18px",
                                borderTop: "1px solid #1E2533",
                                background: "#0B0D11",
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px",
                              }}
                            >
                              {/* Error message if failed */}
                              {step.error_message && (
                                <div
                                  style={{
                                    padding: "10px 14px",
                                    borderRadius: "8px",
                                    background: "rgba(244, 63, 94, 0.1)",
                                    border: "1px solid rgba(244, 63, 94, 0.3)",
                                    color: "#F43F5E",
                                    fontSize: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  <AlertCircle size={15} className="shrink-0" />
                                  <span>{step.error_message}</span>
                                </div>
                              )}

                              {/* Response Body Header */}
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    color: "#8E9BAE",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <Code2 size={13} />
                                  <span>Response Body (JSON)</span>
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    copyToClipboard(bodyStr, `step_${idx}`)
                                  }
                                  className="action-icon-btn"
                                  style={{
                                    fontSize: "11px",
                                    padding: "3px 8px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  {copiedKey === `step_${idx}` ? (
                                    <>
                                      <Check size={12} style={{ color: "var(--neon-lime)" }} />
                                      <span style={{ color: "var(--neon-lime)" }}>Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={12} />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Preformatted JSON */}
                              <pre
                                style={{
                                  margin: 0,
                                  padding: "12px",
                                  borderRadius: "8px",
                                  background: "#080A0E",
                                  border: "1px solid #1E2533",
                                  color: "#A6ACCD",
                                  fontFamily: "monospace",
                                  fontSize: "11px",
                                  lineHeight: 1.5,
                                  overflowX: "auto",
                                  maxHeight: "260px",
                                }}
                              >
                                {bodyStr}
                              </pre>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExecutionHistoryModal;
