"use client";

import { FormEvent } from "react";
import { X } from "lucide-react";

interface NewNodeModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onTitleChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
}

export function NewNodeModal({
  isOpen,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
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
              <label>Node Title</label>
              <input
                className="form-input"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="e.g. Products API, Payment Intent, etc."
                autoFocus
                required
                name="node_title"
              />
            </div>
            <div className="form-group">
              <label>Node Description</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Describe what this node does"
                required
                name="node_description"
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
