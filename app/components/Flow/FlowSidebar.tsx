"use client";

import React from "react";
import { Plus, Download, X } from "lucide-react";
import { SavedFlow } from "@/app/types/flow";
import { WorkflowList } from "./WorkflowList";

interface FlowSidebarProps {
  flows: SavedFlow[];
  activeFlowId: number | null;
  isOpen?: boolean;
  onClose?: () => void;
  onSelectFlow: (flowId: number) => void;
  onCreateFlow: () => void;
  onOpenEditFlow: () => void;
  onOpenDeleteFlow: (flowId: number) => void;
  onExportJson: () => void;
}

export function FlowSidebar({
  flows,
  activeFlowId,
  isOpen,
  onClose,
  onSelectFlow,
  onCreateFlow,
  onOpenEditFlow,
  onOpenDeleteFlow,
  onExportJson,
}: FlowSidebarProps) {
  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? "is-open" : ""}`}>
        <div className="sidebar__header">
          <div className="brand-container">
            <div className="brand-logo">
              <div className="brand-logo__icon">⚡</div>
              <span className="brand-logo__name">API FLOW</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="brand-badge">PRO</span>
              {onClose && (
                <button
                  type="button"
                  className="sidebar-close-btn action-icon-btn"
                  onClick={onClose}
                  title="Close sidebar"
                >
                  <X size={18} />
                </button>
              )}
            </div>
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
          onSelectFlow={(flowId) => {
            onSelectFlow(flowId);
            onClose?.();
          }}
          onOpenEditFlow={onOpenEditFlow}
          onOpenDeleteFlow={onOpenDeleteFlow}
        />

        {/* Sidebar Footer */}
        <div className="sidebar__footer">
          <button
            type="button"
            className="btn-secondary"
            disabled={!activeFlowId || flows.length === 0}
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
    </>
  );
}

export default FlowSidebar;
