"use client";

import React from "react";
import { Plus, X } from "lucide-react";
import { CustomField } from "@/app/types/flow";

interface CustomFieldsListProps {
  fields: CustomField[];
  onAddField: () => void;
  onRemoveField: (id: string) => void;
  onUpdateField: (id: string, key: "label" | "value", value: string) => void;
}

export function CustomFieldsList({
  fields,
  onAddField,
  onRemoveField,
  onUpdateField,
}: CustomFieldsListProps) {
  return (
    <div className="custom-fields-section">
      <div className="custom-fields-header">
        <h4>Headers & Query Parameters</h4>
        <button
          type="button"
          className="btn-add-field"
          onClick={onAddField}
        >
          <Plus size={12} />
          <span>Add Parameter</span>
        </button>
      </div>

      {fields.length === 0 ? (
        <p style={{ margin: 0, fontSize: "12px", color: "var(--dim-grey)" }}>
          No headers or query parameters added yet.
        </p>
      ) : (
        fields.map((field) => (
          <div className="custom-field-row" key={field.id}>
            <input
              placeholder="Key (e.g. Content-Type)"
              value={field.label}
              onChange={(e) => onUpdateField(field.id, "label", e.target.value)}
            />
            <input
              placeholder="Value (e.g. application/json)"
              value={field.value}
              onChange={(e) => onUpdateField(field.id, "value", e.target.value)}
            />
            <button
              type="button"
              className="action-icon-btn delete"
              onClick={() => onRemoveField(field.id)}
              title="Remove parameter"
            >
              <X size={14} />
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default CustomFieldsList;
