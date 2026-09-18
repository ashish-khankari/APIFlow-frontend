"use client";

import React, { FormEvent } from "react";
import { X, HelpCircle, RefreshCw, Check } from "lucide-react";
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
}: NodeInspectorProps) {
  // Handlers for custom fields inside draftNode
  const handleAddField = () => {
    const newField: CustomField = {
      id: `field-${Date.now()}`,
      label: "",
      value: "",
      type: "text",
    };
    onDraftNodeChange({
      ...draftNode,
      customFields: [...draftNode.customFields, newField],
    });
  };

  const handleRemoveField = (fieldId: string) => {
    onDraftNodeChange({
      ...draftNode,
      customFields: draftNode.customFields.filter((f) => f.id !== fieldId),
    });
  };

  const handleUpdateField = (
    fieldId: string,
    key: "label" | "value",
    val: string
  ) => {
    onDraftNodeChange({
      ...draftNode,
      customFields: draftNode.customFields.map((f) =>
        f.id === fieldId ? { ...f, [key]: val } : f
      ),
    });
  };

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
            <h3>Configure API</h3>
            <p>
              {draftNode.nodeNumber && `API Node ${draftNode.nodeNumber}`}
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

        <form className="flex-1 flex flex-col overflow-hidden" onSubmit={onSave}>
          <div className="inspector-panel__body">
            {/* API Name */}
            <div className="form-group">
              <label>API Name *</label>
              <input
                className="form-input"
                value={draftNode.label}
                onChange={(e) =>
                  onDraftNodeChange({ ...draftNode, label: e.target.value })
                }
                placeholder="e.g. Login API"
                required
              />
            </div>

            {/* Method & Expected Status Code */}
            <div className="form-row-2">
              <div className="form-group">
                <label>HTTP Method *</label>
                <select
                  className="form-select"
                  value={draftNode.method || "POST"}
                  onChange={(e) =>
                    onDraftNodeChange({
                      ...draftNode,
                      method: e.target.value as HttpMethod,
                    })
                  }
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>

              <div className="form-group">
                <label>Expected Status</label>
                <input
                  type="number"
                  className="form-input font-mono"
                  value={draftNode.expectedStatus || 200}
                  onChange={(e) =>
                    onDraftNodeChange({
                      ...draftNode,
                      expectedStatus: Number(e.target.value),
                    })
                  }
                  placeholder="200"
                />
              </div>
            </div>

            {/* Base URL */}
            <div className="form-group">
              <label>Base URL *</label>
              <input
                className="form-input font-mono text-xs"
                value={draftNode.baseUrl || ""}
                onChange={(e) =>
                  onDraftNodeChange({ ...draftNode, baseUrl: e.target.value })
                }
                placeholder="https://api.example.com"
              />
            </div>

            {/* Endpoint */}
            <div className="form-group">
              <label>Endpoint *</label>
              <input
                className="form-input font-mono text-xs"
                value={draftNode.endpoint || ""}
                onChange={(e) =>
                  onDraftNodeChange({ ...draftNode, endpoint: e.target.value })
                }
                placeholder="/login"
              />
            </div>

            {/* Auth Token */}
            <div className="form-group">
              <label className="flex items-center justify-between">
                <span>Authentication Token</span>
                <span className="text-[10px] text-slate-400">Optional</span>
              </label>
              <input
                type="password"
                className="form-input font-mono text-xs"
                value={draftNode.authToken || ""}
                onChange={(e) =>
                  onDraftNodeChange({ ...draftNode, authToken: e.target.value })
                }
                placeholder="Bearer token or secret..."
              />
            </div>

            {/* Dynamic Headers & Query Parameters */}
            <CustomFieldsList
              fields={draftNode.customFields || []}
              onAddField={handleAddField}
              onRemoveField={handleRemoveField}
              onUpdateField={handleUpdateField}
            />

            {/* Request Body (JSON) */}
            <div className="form-group">
              <label className="flex items-center justify-between">
                <span>Request Body</span>
                <span className="text-[10px] text-[#BAFF39] font-mono">JSON</span>
              </label>
              {draftNode.method === "GET" ? (
                <div className="p-2.5 rounded bg-[#0B0D11] border border-[#232A37] text-xs text-slate-400 italic flex items-center gap-1.5">
                  <HelpCircle size={13} className="text-slate-500 shrink-0" />
                  <span>GET requests typically omit request body payloads.</span>
                </div>
              ) : (
                <textarea
                  className="form-textarea font-mono text-xs"
                  rows={4}
                  value={draftNode.requestBody || ""}
                  onChange={(e) =>
                    onDraftNodeChange({ ...draftNode, requestBody: e.target.value })
                  }
                  placeholder={`{\n  "email": "test@test.com"\n}`}
                />
              )}
            </div>

            {/* Test API Result Card */}
            {isTestingSingleApi && (
              <div className="p-3 rounded-lg bg-[#0B0D11] border border-sky-500/40 text-xs text-sky-400 flex items-center justify-center gap-2 animate-pulse">
                <RefreshCw size={13} className="animate-spin" />
                <span>Testing API endpoint...</span>
              </div>
            )}

            {testApiResult && (
              <div className="p-3 rounded-lg bg-lime-500/10 border border-lime-500/30 text-xs">
                <div className="flex items-center justify-between mb-1.5 font-bold text-[#BAFF39]">
                  <span>✓ Success ({testApiResult.statusCode})</span>
                  <span className="font-mono text-[11px] text-slate-300">
                    {testApiResult.latencyMs} ms
                  </span>
                </div>
                <pre className="text-[10px] font-mono bg-[#0B0D11] p-2 rounded border border-[#232A37] text-slate-300 overflow-x-auto">
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
              onClick={onTestApi}
              disabled={isTestingSingleApi}
              style={{ flex: 1 }}
            >
              Test API
            </button>

            <button type="submit" className="btn-save-node" style={{ flex: 1 }}>
              <Check size={14} />
              <span>Save API</span>
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}

export default NodeInspector;
