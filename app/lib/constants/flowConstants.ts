import { MarkerType } from "@xyflow/react";
import { Zap, Globe, Database, Cpu, Bell } from "lucide-react";
import { NodeCategory, NodeDetails, SavedFlow } from "@/app/types/flow";

export const STORAGE_KEY = "apiflow-testing-workflows-v4";

export const NODE_CATEGORY_CONFIGS = [
  { id: "api" as const, name: "API Request", icon: Globe },
  { id: "trigger" as const, name: "Trigger / Webhook", icon: Zap },
  { id: "transform" as const, name: "Data Transform", icon: Cpu },
  { id: "database" as const, name: "Database Query", icon: Database },
  { id: "action" as const, name: "Action / Alert", icon: Bell },
];

export function defaultNodeData(
  label: string,
  category: NodeCategory = "api",
  stepNum?: number
): NodeDetails {
  return {
    nodeNumber: stepNum,
    label,
    category,
    method: category === "api" ? "POST" : undefined,
    baseUrl: "https://api.example.com",
    endpoint: category === "api" ? "/api/v1/step" : undefined,
    owner: "Engineering",
    status: "In progress",
    priority: "High",
    description: "Orchestrates API calls and workflow verification.",
    expectedStatus: 200,
    requestBody: '{\n  "test": true\n}',
    customFields: [
      { id: "f-1", label: "Content-Type", value: "application/json" },
    ],
  };
}

