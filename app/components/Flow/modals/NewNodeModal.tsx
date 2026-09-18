"use client";

import { FormEvent } from "react";
import { X } from "lucide-react";
import { NodeCategory } from "@/app/types/flow";

interface NewNodeModalProps {
  isOpen: boolean;
  title: string;
  category: NodeCategory;
  onTitleChange: (val: string) => void;
  onCategoryChange: (val: NodeCategory) => void;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
}

export function NewNodeModal({
  isOpen,
  title,
  onTitleChange,
  onClose,
  onSubmit,
}: NewNodeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Add API Node to Pipeline</h3>
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
              <label>API Node Title</label>
              <input
                className="form-input"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="e.g. Products API, Payment Intent, etc."
                autoFocus
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
              Create Node
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewNodeModal;
