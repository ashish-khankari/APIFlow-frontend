"use client";

import React from "react";
import { Layers, Edit2, Trash2 } from "lucide-react";
import { SavedFlow } from "@/app/types/flow";

interface WorkflowListProps {
  flows: SavedFlow[];
  activeFlowId: number | null;
  onSelectFlow: (flowId: number) => void;
  onOpenEditFlow: () => void;
  onOpenDeleteFlow: (flowId: number) => void;
}

export function WorkflowList({
  flows,
  activeFlowId,
  onSelectFlow,
  onOpenEditFlow,
  onOpenDeleteFlow,
}: WorkflowListProps) {
  if (!flows || flows.length === 0) {
    return (
      <div
        style={{
          padding: "32px 16px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "13px",
          lineHeight: 1.6,
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "var(--bg-surface-elevated)",
            margin: "0 auto 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--dim-grey)",
          }}
        >
          <Layers size={18} />
        </div>
        No workflows found.
        <br />
        <span style={{ fontSize: "11px", color: "var(--dim-grey-light)" }}>
          Create your first workflow to begin orchestrating APIs.
        </span>
      </div>
    );
  }

  return (
    <div className="sidebar__flow-list">
      {flows.map((flow) => {
        const isActive = flow.id === activeFlowId;
        const nodeCount = flow.nodes?.length || 0;
        const edgeCount = flow.edges?.length || 0;
        const title = flow.flow_name || flow.name || "Untitled Flow";

        return (
          <div
            key={flow.id}
            className={`flow-card ${isActive ? "is-active" : ""}`}
            onClick={() => onSelectFlow(flow.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectFlow(flow.id);
              }
            }}
          >
            <div className="flow-card__content">
              <div className="flow-card__icon">
                <Layers size={14} />
              </div>
              <div className="flow-card__meta">
                <div className="flow-card__title" title={title}>
                  {title}
                </div>
                <div className="flow-card__badge">
                  {nodeCount} {nodeCount === 1 ? "node" : "nodes"} · {edgeCount}{" "}
                  {edgeCount === 1 ? "connection" : "connections"}
                </div>
              </div>
            </div>

            <div className="flow-card__actions">
              {isActive && (
                <button
                  type="button"
                  className="action-icon-btn"
                  title="Rename flow"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEditFlow();
                  }}
                >
                  <Edit2 size={12} />
                </button>
              )}
              <button
                type="button"
                className="action-icon-btn delete"
                title="Delete flow"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDeleteFlow(flow.id);
                }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default WorkflowList;
