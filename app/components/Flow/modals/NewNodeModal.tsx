"use client";

import React, { FormEvent } from "react";
import { X } from "lucide-react";
import { NodeCategory } from "@/app/types/flow";
import { NODE_CATEGORY_CONFIGS } from "@/app/lib/constants/flowConstants";

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
  category,
  onTitleChange,
  onCategoryChange,
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

            <div className="form-group">
              <label>Node Category</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                }}
              >
                {NODE_CATEGORY_CONFIGS.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => onCategoryChange(cat.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 12px",
                        borderRadius: "7px",
                        background: isSelected
                          ? "rgba(186, 255, 57, 0.12)"
                          : "var(--bg-surface-elevated)",
                        border: `1px solid ${
                          isSelected ? "var(--neon-lime)" : "var(--border-medium)"
                        }`,
                        color: isSelected ? "var(--neon-lime)" : "var(--text-white)",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <Icon size={14} />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
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
