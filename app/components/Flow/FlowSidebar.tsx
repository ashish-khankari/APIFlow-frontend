"use client";

import React from "react";
import { Plus, Download } from "lucide-react";
import { SavedFlow } from "@/app/types/flow";
import { WorkflowList } from "./WorkflowList";

interface FlowSidebarProps {
  flows: SavedFlow[];
  activeFlowId: string;
  onSelectFlow: (flowId: string) => void;
  onCreateFlow: () => void;
  onDuplicateFlow: (e: React.MouseEvent, flow: SavedFlow) => void;
  onOpenEditFlow: () => void;
  onOpenDeleteFlow: (flowId: string) => void;
  onExportJson: () => void;
}

export function FlowSidebar({
  flows,
  activeFlowId,
  onSelectFlow,
  onCreateFlow,
  onDuplicateFlow,
  onOpenEditFlow,
  onOpenDeleteFlow,
  onExportJson,
}: FlowSidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <div className="brand-container">
          <div className="brand-logo">
            <div className="brand-logo__icon">⚡</div>
            <span className="brand-logo__name">API FLOW</span>
          </div>
          <span className="brand-badge">PRO</span>
        </div>

        <div className="flow-section-heading">
          <span>Workflows ({flows.length})</span>
          <button
            type="button"
            className="btn-new-flow"
            onClick={onCreateFlow}
            title="Create a new workflow"
          >
            <Plus size={13} />
            <span>New Flow</span>
          </button>
        </div>
      </div>

      {/* Saved Flows List Component */}
      <WorkflowList
        flows={flows}
        activeFlowId={activeFlowId}
        onSelectFlow={onSelectFlow}
        onDuplicateFlow={onDuplicateFlow}
        onOpenEditFlow={onOpenEditFlow}
        onOpenDeleteFlow={onOpenDeleteFlow}
      />

      {/* Sidebar Footer */}
      <div className="sidebar__footer">
        <button
          type="button"
          className="btn-secondary"
          onClick={onExportJson}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <Download size={13} />
          <span>Export Flow JSON</span>
        </button>
      </div>
    </aside>
  );
}

export default FlowSidebar;
