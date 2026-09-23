import { NodeDetails } from "@/app/types/flow";


export function defaultNodeData(
  node_title: string,
  stepNum?: number
): NodeDetails {
  return {
    nodeNumber: stepNum,
    node_title,
    method: "POST",
    status: "Not started",
    node_description: "Enter description here...",
    expectedStatus: 200,
    requestBody: '{\n  "test": true\n}',
  };
}

