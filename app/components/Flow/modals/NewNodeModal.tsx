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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || !description.trim()) return;
            onSubmit(e);
          }}
        >
          <div className="modal-body">
            <div className="form-group">
              <label>
                Node Title <span style={{ color: "var(--neon-lime)" }}>*</span>
              </label>
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
              <label>
                Node Description <span style={{ color: "var(--neon-lime)" }}>*</span>
              </label>
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
            <button
              type="submit"
              className="btn-primary"
              disabled={!title.trim() || !description.trim()}
              style={{
                opacity: !title.trim() || !description.trim() ? 0.5 : 1,
                cursor: !title.trim() || !description.trim() ? "not-allowed" : "pointer",
              }}
            >
              Create Node
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewNodeModal;
