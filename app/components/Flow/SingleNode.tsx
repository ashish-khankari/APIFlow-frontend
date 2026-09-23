"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import {
  Sliders,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Globe,
} from "lucide-react";
import { FlowNodeData } from "@/app/types/flow";

interface SingleNodeProps {
  id: string;
  data: FlowNodeData;
  selected?: boolean;
}

export function SingleNode({ id, data, selected }: SingleNodeProps) {
  const getStatusClass = (status: string) => {
    switch (status) {
      case "Completed":
        return "badge-status-completed";
      case "In progress":
        return "badge-status-in-progress";
      case "Failed":
        return "bg-rose-500/20 text-rose-400 border border-rose-500/30";
      default:
        return "badge-status-not-started";
    }
  };

  const isConfigured = Boolean(data.endpoint || data.method);
  const hasNextNode = Boolean(data.hasNextNode);
  const titleText = data.label ?? data.node_title ?? "Untitled Node";
  const descriptionText = data.description ?? data.node_description ?? "";
  const statusText = data.status ?? "Not started";

  return (
    <div
      className={`flow-node-card ${selected ? "is-selected" : ""} ${data.executionState === "running" ? "ring-2 ring-sky-400 animate-pulse" : ""
        } ${data.executionState === "failed" ? "border-rose-500" : ""}`}
    >
      {/* Left Input Handle */}
      <Handle type="target" position={Position.Left} />

      {/* Card Header */}
      <div className="flow-node__header">
        <div className={`flow-node__type-pill`}>
          <Globe size={13} style={{ color: "var(--neon-lime)" }} />
          <span>{data.nodeNumber && `API ${data.nodeNumber}`}</span>
          {data.method && (
            <span
              style={{
                fontSize: "9px",
                padding: "1px 5px",
                borderRadius: "3px",
                fontWeight: 800,
                background: "rgba(255,255,255,0.08)",
                color:
                  data.method === "GET"
                    ? "var(--color-get)"
                    : data.method === "POST"
                      ? "var(--neon-lime)"
                      : "var(--color-put)",
              }}
            >
              {data.method}
            </span>
          )}
        </div>
        <div className="flow-node__actions nodrag">
          <button
            type="button"
            className="action-icon-btn"
            title="Edit / Configure node"
            onClick={(e) => {
              e.stopPropagation();
              data.onEdit?.(id);
            }}
          >
            <Sliders size={13} />
          </button>
          <button
            type="button"
            className="action-icon-btn delete"
            title="Delete node"
            onClick={(e) => {
              e.stopPropagation();
              data.onDelete?.(id);
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="flow-node__body">
        <div className="flow-node__title">{titleText}</div>
        {data.endpoint && <div className="flow-node__url">{data.endpoint}</div>}
        {descriptionText && <div className="flow-node__desc">{descriptionText}</div>}

        {/* Dynamic Execution Badge or Static Status */}
        <div className="flow-node__meta-row">
          {data.executionState === "running" ? (
            <span className="node-badge badge-status-in-progress flex items-center gap-1">
              <RefreshCw size={10} className="animate-spin" /> Running...
            </span>
          ) : data.executionState === "success" ? (
            <span className="node-badge badge-status-completed flex items-center gap-1">
              <CheckCircle2 size={10} /> ✓ Success {data.actualStatus || 200}
            </span>
          ) : data.executionState === "failed" ? (
            <span className="node-badge bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
              <AlertCircle size={10} /> ✕ Failed {data.actualStatus || 500}
            </span>
          ) : (
            <span className={`node-badge ${getStatusClass(statusText)}`}>
              {isConfigured ? statusText : "Not Configured"}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="flow-node__footer nodrag">
        <button
          type="button"
          className="btn-add-next"
          title={hasNextNode ? "This node already has a next step" : "Append next connected step"}
          onClick={(e) => {
            e.stopPropagation();
            if (!hasNextNode) {
              data.onAddNext?.(id);
            }
          }}
          disabled={hasNextNode}
          style={{
            opacity: hasNextNode ? 0.5 : 1,
            cursor: hasNextNode ? "not-allowed" : "pointer",
          }}
        >
          <Plus size={12} />
          <span>{hasNextNode ? "Linked" : "Connect Next"}</span>
        </button>
      </div>

      {/* Right Output Handle */}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default SingleNode;
