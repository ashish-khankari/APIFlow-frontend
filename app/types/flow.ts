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
  node_method?: HttpMethod,
  node_base_url?: string,
  node_end_point?: string,
  headers?: JSON,
  request_body?: JSON,
  nodeNumber?: number;
  label: string;
  // category: NodeCategory;
  method?: HttpMethod;
  baseUrl?: string;
  endpoint?: string;
  status: "Not started" | "In progress" | "Completed" | "Failed";
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

export type FlowNode = Node<FlowNodeData>;

export type SavedFlow = {
  id: number;
  flow_name: string;
  flow_description: string;
  user_id?: number;
  created_at?: string;
  nodes?: FlowNode[];
  edges?: Edge[];
  updatedAt?: number;
  name?: string;
  description?: string;
};

export type SavedFlowResponse = {
  data: SavedFlow[];
  message: string;
  statusCode?: number;
};

export type ApiTestResult = {
  status: "success" | "failed";
  statusCode: number;
  latencyMs: number;
  body: string;
};

export interface NodeSlicesInterface {
  id: number,
  node_title: string,
  node_description: string,
  flow_id: number,
  user_id: number,
  node_order: number,
}

export interface NodeSlicesResponseInterface {
  message: string;
  data: NodeSlicesInterface[];
}