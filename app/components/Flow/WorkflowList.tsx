"use client";

import React from "react";
import { Layers, Copy, Edit2, Trash2 } from "lucide-react";
import { SavedFlow } from "@/app/types/flow";

interface WorkflowListProps {
  flows: SavedFlow[];
  activeFlowId: string;
  onSelectFlow: (flowId: string) => void;
  onDuplicateFlow: (e: React.MouseEvent, flow: SavedFlow) => void;
  onOpenEditFlow: () => void;
  onOpenDeleteFlow: (flowId: string) => void;
}

export function WorkflowList({
  flows,
  activeFlowId,
  onSelectFlow,
  onDuplicateFlow,
  onOpenEditFlow,
  onOpenDeleteFlow,
}: WorkflowListProps) {
  return (
    <div className="sidebar__flow-list">
      {flows.map((flow) => {
        const isActive = flow.id === activeFlowId;
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
                <div className="flow-card__title">{flow.name}</div>
                <div className="flow-card__badge">
                  {flow.nodes.length} nodes · {flow.edges.length} connections
                </div>
              </div>
            </div>

            <div className="flow-card__actions">
              <button
                type="button"
                className="action-icon-btn"
                title="Duplicate flow"
                onClick={(e) => onDuplicateFlow(e, flow)}
              >
                <Copy size={12} />
              </button>
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
