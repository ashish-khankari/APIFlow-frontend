"use client";

import React, { FormEvent } from "react";
import { X } from "lucide-react";

interface EditFlowModalProps {
  isOpen: boolean;
  name: string;
  description: string;
  onNameChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
}

export function EditFlowModal({
  isOpen,
  name,
  description,
  onNameChange,
  onDescriptionChange,
  onClose,
  onSubmit,
}: EditFlowModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Edit Workflow Details</h3>
          <button
            type="button"
            className="action-icon-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Workflow Name</label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="e.g. E-commerce API Test"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Describe what APIs this test sequence executes..."
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Update Workflow
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditFlowModal;
