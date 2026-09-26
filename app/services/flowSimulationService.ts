import { NodeChange } from "@xyflow/react";
import { ApiTestResult, FlowNode, NodeDetails, NodeExecutionState, SavedFlow } from "@/app/types/flow";

import axios from "axios";

/**
 * Executes a single API node test against the real endpoint.
 */
export async function testSingleApi(
  draftNode: NodeDetails,
  signal?: AbortSignal
): Promise<ApiTestResult> {
  const startTime = Date.now();
  const baseUrl = (draftNode.baseUrl || "").trim().replace(/\/+$/, "");
  const endpoint = (draftNode.endpoint || "").trim().replace(/^\/+/, "");
  const fullUrl = endpoint ? `${baseUrl}/${endpoint}` : baseUrl;

  if (!fullUrl) {
    throw new Error("Base URL or endpoint is missing");
  }

  const headers: Record<string, string> = {};
  const queryParams: Record<string, string> = {};
  (draftNode.customFields || []).forEach((field) => {
    if (field.label && field.value) {
      if (field.type === "query") {
        queryParams[field.label] = field.value;
      } else {
        headers[field.label] = field.value;
      }
    }
  });

  if (draftNode.authToken) {
    headers["Authorization"] = draftNode.authToken.startsWith("Bearer ")
      ? draftNode.authToken
      : `Bearer ${draftNode.authToken}`;
  }

  let requestData: any = undefined;
  if (draftNode.method !== "GET" && draftNode.requestBody) {
    try {
      requestData = JSON.parse(draftNode.requestBody);
    } catch {
      requestData = draftNode.requestBody;
    }
  }

  try {
    const res = await axios({
      url: fullUrl,
      method: draftNode.method || "GET",
      headers,
      params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      data: requestData,
      timeout: 10000,
      signal,
    });

    const latencyMs = Date.now() - startTime;
    return {
      status: "success",
      statusCode: res.status,
      latencyMs,
      body: JSON.stringify(res.data, null, 2),
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    const statusCode = err?.response?.status || 0;
    const responseBody = err?.response?.data || { error: err.message };

    return {
      status: "failed",
      statusCode: statusCode || 500,
      latencyMs,
      body: JSON.stringify(responseBody, null, 2),
    };
  }
}

export const simulateSingleApiTest = testSingleApi;

/**
 * Simulates a sequential end-to-end execution of a workflow pipeline.
 */
export async function simulateWorkflowExecution(
  nodes: FlowNode[] = [],
  onNodeStateChange: (
    nodeId: string,
    state: NodeExecutionState,
    actualStatus?: number,
    latencyMs?: number
  ) => void,
  stepDelayMs: number = 400
): Promise<void> {
  for (let i = 0; i < nodes.length; i++) {
    const targetNode = nodes[i];
    if (!targetNode) continue;

    // Transition to running state
    onNodeStateChange(targetNode.id, "running");
    await new Promise((r) => setTimeout(r, stepDelayMs));

    // Transition to success state
    const latency = 160 + Math.floor(Math.random() * 80);
    const statusCode = targetNode.data?.expectedStatus || 200;
    onNodeStateChange(targetNode.id, "success", statusCode, latency);
  }
}

/**
 * Triggers a client-side download of the active workflow as JSON.
 */
export function exportFlowAsJson(flow: SavedFlow | null): void {
  if (!flow) return;
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(flow, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  const fileName = flow.flow_name || flow.name || "workflow";
  downloadAnchor.setAttribute(
    "download",
    `${fileName.toLowerCase().replace(/\s+/g, "-")}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Computes an organized horizontal step-by-step auto layout for nodes.
 */
export function calculateAutoLayout(nodes?: FlowNode[]): NodeChange<FlowNode>[] {
  if (!nodes || nodes.length === 0) return [];
  const updated = nodes.map((node, idx) => ({
    ...node,
    position: {
      x: 60 + idx * 320,
      y: 180 + (idx % 2 === 1 ? 30 : 0),
    },
  }));

  return updated.map((node) => ({
    type: "position",
    id: node.id,
    position: node.position,
  }));
}
