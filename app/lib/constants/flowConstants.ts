import { NodeCategory, NodeDetails } from "@/app/types/flow";


export function defaultNodeData(
  label: string,
  category: NodeCategory = "api",
  stepNum?: number
): NodeDetails {
  return {
    nodeNumber: stepNum,
    label,
    category,
    method: "POST",
    status: "Not started",
    description: "Enter description here...",
    expectedStatus: 200,
    requestBody: '{\n  "test": true\n}',
    customFields: [
      { id: "f-1", label: "Content-Type", value: "application/json" },
    ],
  };
}

