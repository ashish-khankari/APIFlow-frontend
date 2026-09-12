"use client";

import React from "react";
import { X } from "lucide-react";

interface DeleteFlowModalProps {
  isOpen: boolean;
  flowName: string;
  onClose: () => void;
  onConfirmDelete: () => void;
}

export function DeleteFlowModal({
  isOpen,
  flowName,
  onClose,
  onConfirmDelete,
}: DeleteFlowModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Delete Workflow</h3>
          <button
            type="button"
            className="action-icon-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
            }}
          >
            Are you sure you want to delete <strong>{flowName}</strong>? All nodes
            and API configurations will be permanently removed.
          </p>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={onConfirmDelete}
          >
            Yes, Delete Flow
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteFlowModal;
