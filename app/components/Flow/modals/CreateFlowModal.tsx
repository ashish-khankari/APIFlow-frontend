"use client";

import React, { FormEvent } from "react";
import { X, Layers, Plus } from "lucide-react";

export interface CreateNewFlowProps {
  isOpen: boolean;
  title: string;
  description: string;
  tokenKey: string;
  isLoading?: boolean;
  onClose: () => void;
  onFlowTitleChange: (val: string) => void;
  onFlowDescriptionChange: (val: string) => void;
  onTokenKeyChange: (val: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export function CreateNewFlow({
  isOpen,
  title,
  description,
  tokenKey,
  isLoading = false,
  onClose,
  onFlowTitleChange,
  onFlowDescriptionChange,
  onTokenKeyChange,
  onSubmit,
}: CreateNewFlowProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                background: "rgba(186, 255, 57, 0.15)",
                color: "var(--neon-lime)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Layers size={16} />
            </div>
            <h3>Create a New Flow</h3>
          </div>
          <button
            type="button"
            className="action-icon-btn"
            onClick={onClose}
            title="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="create-flow-title">
                Flow Name <span style={{ color: "var(--neon-lime)" }}>*</span>
              </label>
              <input
                id="create-flow-title"
                className="form-input"
                value={title}
                onChange={(e) => onFlowTitleChange(e.target.value)}
                placeholder="e.g. Authentication Pipeline, Checkout API"
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="create-flow-description">
                Flow Description <span style={{ color: "var(--neon-lime)" }}>*</span>
              </label>
              <textarea
                id="create-flow-description"
                className="form-textarea"
                rows={3}
                value={description}
                onChange={(e) => onFlowDescriptionChange(e.target.value)}
                placeholder="e.g. Sequential test verifying login, token validation, and session lifecycle..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="create-flow-token-key">
                Token Key <span style={{ color: "var(--neon-lime)" }}>*</span>
              </label>
              <input
                id="create-flow-token-key"
                className="form-input"
                value={tokenKey}
                onChange={(e) => onTokenKeyChange(e.target.value)}
                placeholder="e.g access_token"
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !title.trim() || !description.trim() || !tokenKey.trim()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {isLoading ? (
                "Creating..."
              ) : (
                <>
                  <Plus size={14} />
                  <span>Create Flow</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateNewFlow;
