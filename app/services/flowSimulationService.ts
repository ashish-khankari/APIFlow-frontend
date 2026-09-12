import { NodeChange } from "@xyflow/react";
import { ApiTestResult, FlowNode, NodeDetails, NodeExecutionState, SavedFlow } from "@/app/types/flow";

/**
 * Simulates executing a single API node configuration in the inspector.
 */
export async function simulateSingleApiTest(
  draftNode: NodeDetails,
  signal?: AbortSignal
): Promise<ApiTestResult> {
  // Simulating network round-trip latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (signal?.aborted) {
    throw new Error("API test aborted");
  }

  const statusCode = draftNode.expectedStatus || 200;
  const isSuccess = statusCode >= 200 && statusCode < 400;

  return {
    status: isSuccess ? "success" : "failed",
    statusCode,
    latencyMs: 180 + Math.floor(Math.random() * 90),
    body: JSON.stringify(
      {
        success: isSuccess,
        endpoint: draftNode.endpoint || "/api",
        method: draftNode.method || "POST",
        message: `${draftNode.label} passed test assertions`,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    ),
  };
}

/**
 * Simulates a sequential end-to-end execution of a workflow pipeline.
 */
export async function simulateWorkflowExecution(
  nodes: FlowNode[],
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
export function exportFlowAsJson(flow: SavedFlow): void {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(flow, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute(
    "download",
    `${flow.name.toLowerCase().replace(/\s+/g, "-")}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Computes an organized horizontal step-by-step auto layout for nodes.
 */
export function calculateAutoLayout(nodes: FlowNode[]): NodeChange<FlowNode>[] {
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
