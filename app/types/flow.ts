import { Node, Edge } from "@xyflow/react";

export type NodeCategory = "trigger" | "api" | "transform" | "database" | "action";
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type CustomField = {
  id: string;
  label: string;
  value: string;
  type?: string;
};

export type NodeExecutionState = "idle" | "running" | "success" | "failed" | "not_executed";

export type NodeDetails = {
  nodeNumber?: number;
  label: string;
  category: NodeCategory;
  method?: HttpMethod;
  baseUrl?: string;
  endpoint?: string;
  owner: string;
  status: "Not started" | "In progress" | "Completed" | "Failed";
  priority: "Low" | "Medium" | "High" | "Critical";
  description: string;
  authToken?: string;
  expectedStatus?: number;
  requestBody?: string;
  customFields: CustomField[];

  // Runtime Execution
  executionState?: NodeExecutionState;
  actualStatus?: number;
  latencyMs?: number;
};

export type FlowNodeData = NodeDetails & {
  onAddNext?: (sourceId: string) => void;
  onDelete?: (nodeId: string) => void;
  onEdit?: (nodeId: string) => void;
  stepIndex?: number;
};

export type FlowNode = Node<FlowNodeData, "apiStep">;

export type SavedFlow = {
  id: string;
  name: string;
  description: string;
  nodes: FlowNode[];
  edges: Edge[];
  updatedAt: number;
};

export type ApiTestResult = {
  status: "success" | "failed";
  statusCode: number;
  latencyMs: number;
  body: string;
};
