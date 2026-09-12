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
  Zap,
  Globe,
  Database,
  Cpu,
  Bell,
} from "lucide-react";
import { FlowNodeData, NodeCategory } from "@/app/types/flow";

interface SingleNodeProps {
  id: string;
  data: FlowNodeData;
  selected?: boolean;
}

export function SingleNode({ id, data, selected }: SingleNodeProps) {
  const getCategoryIcon = (category: NodeCategory) => {
    switch (category) {
      case "trigger":
        return <Zap size={13} className="text-sky-400" />;
      case "api":
        return <Globe size={13} style={{ color: "var(--neon-lime)" }} />;
      case "transform":
        return <Cpu size={13} className="text-purple-400" />;
      case "database":
        return <Database size={13} className="text-amber-400" />;
      case "action":
        return <Bell size={13} className="text-emerald-400" />;
      default:
        return <Globe size={13} />;
    }
  };

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

  return (
    <div
      className={`flow-node-card ${selected ? "is-selected" : ""} ${
        data.executionState === "running" ? "ring-2 ring-sky-400 animate-pulse" : ""
      } ${data.executionState === "failed" ? "border-rose-500" : ""}`}
    >
      {/* Left Input Handle */}
      <Handle type="target" position={Position.Left} />

      {/* Card Header */}
      <div className="flow-node__header">
        <div className={`flow-node__type-pill ${data.category}`}>
          {getCategoryIcon(data.category)}
          <span>{data.nodeNumber ? `API ${data.nodeNumber}` : data.category}</span>
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
        <div className="flow-node__title">{data.label}</div>
        {data.endpoint && <div className="flow-node__url">{data.endpoint}</div>}
        {data.description && <div className="flow-node__desc">{data.description}</div>}

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
            <span className={`node-badge ${getStatusClass(data.status)}`}>
              {isConfigured ? data.status : "Not Configured"}
            </span>
          )}

          <span className="node-badge badge-priority">{data.priority}</span>
          {data.owner && <span className="node-badge badge-priority">{data.owner}</span>}
        </div>
      </div>

      {/* Card Footer */}
      <div className="flow-node__footer nodrag">
        <span className="flow-node__fields-count">
          {data.customFields?.length || 0} {data.customFields?.length === 1 ? "field" : "fields"}
        </span>
        <button
          type="button"
          className="btn-add-next"
          title="Append next connected step"
          onClick={(e) => {
            e.stopPropagation();
            data.onAddNext?.(id);
          }}
        >
          <Plus size={12} />
          <span>Connect Next</span>
        </button>
      </div>

      {/* Right Output Handle */}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default SingleNode;
