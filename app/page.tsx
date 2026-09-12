"use client";

import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  Connection,
  Edge,
  Handle,
  MarkerType,
  MiniMap,
  Node,
  NodeChange,
  EdgeChange,
  Position,
  ReactFlow,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  Plus,
  Trash2,
  Edit2,
  Play,
  Download,
  Copy,
  Check,
  X,
  Zap,
  Globe,
  Database,
  Cpu,
  Bell,
  Layers,
  LayoutGrid,
  Maximize2,
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "./lib/hooks";
import { SET_LOGOUT } from "./lib/reducer/usersSlice";
import { useRouter } from "next/navigation";

// Local Storage Key & Version
const STORAGE_KEY = "apiflow-testing-workflows-v4";

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

function defaultNodeData(label: string, category: NodeCategory = "api", stepNum?: number): NodeDetails {
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

// Starter Workflows: 6-Node API Flow Test + Stripe Webhook Flow
const starterFlows: SavedFlow[] = [
  {
    id: "flow-ecommerce-test",
    name: "E-commerce API Test",
    description: "6-step sequential API workflow verification: Auth -> Profile -> Catalog -> Cart -> Checkout -> Logout.",
    updatedAt: Date.now(),
    nodes: [
      {
        id: "node-1",
        type: "apiStep",
        position: { x: 60, y: 180 },
        data: {
          nodeNumber: 1,
          label: "Login API",
          category: "api",
          method: "POST",
          baseUrl: "https://api.ecommerce.com",
          endpoint: "/login",
          owner: "Auth Team",
          status: "Completed",
          priority: "Critical",
          description: "Submits credentials and returns user access token.",
          authToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          expectedStatus: 200,
          requestBody: '{\n  "email": "test@test.com",\n  "password": "secret"\n}',
          customFields: [
            { id: "cf-1", label: "Content-Type", value: "application/json" },
          ],
        },
      },
      {
        id: "node-2",
        type: "apiStep",
        position: { x: 380, y: 180 },
        data: {
          nodeNumber: 2,
          label: "Profile API",
          category: "api",
          method: "GET",
          baseUrl: "https://api.ecommerce.com",
          endpoint: "/profile",
          owner: "User Core",
          status: "Completed",
          priority: "High",
          description: "Fetches user profile, permissions, and tenant metadata.",
          expectedStatus: 200,
          customFields: [
            { id: "cf-2", label: "Authorization", value: "Bearer {{token}}" },
          ],
        },
      },
      {
        id: "node-3",
        type: "apiStep",
        position: { x: 700, y: 180 },
        data: {
          nodeNumber: 3,
          label: "Products API",
          category: "api",
          method: "GET",
          baseUrl: "https://api.ecommerce.com",
          endpoint: "/products",
          owner: "Catalog Team",
          status: "Completed",
          priority: "High",
          description: "Queries active catalog listings with pagination parameters.",
          expectedStatus: 200,
          customFields: [
            { id: "cf-3", label: "Cache-Control", value: "no-cache" },
            { id: "cf-3b", label: "limit", value: "20" },
          ],
        },
      },
      {
        id: "node-4",
        type: "apiStep",
        position: { x: 1020, y: 180 },
        data: {
          nodeNumber: 4,
          label: "Cart API",
          category: "api",
          method: "POST",
          baseUrl: "https://api.ecommerce.com",
          endpoint: "/cart",
          owner: "Checkout Team",
          status: "Not started",
          priority: "Medium",
          description: "Adds featured SKU to customer cart session.",
          expectedStatus: 200,
          requestBody: '{\n  "sku": "PROD-101",\n  "quantity": 1\n}',
          customFields: [
            { id: "cf-4", label: "Content-Type", value: "application/json" },
          ],
        },
      },
      {
        id: "node-5",
        type: "apiStep",
        position: { x: 1340, y: 180 },
        data: {
          nodeNumber: 5,
          label: "Checkout API",
          category: "api",
          method: "POST",
          baseUrl: "https://api.ecommerce.com",
          endpoint: "/checkout",
          owner: "Payment Core",
          status: "Not started",
          priority: "Critical",
          description: "Creates and confirms checkout payment intent.",
          expectedStatus: 200,
          requestBody: '{\n  "paymentMethod": "mock_card",\n  "currency": "USD"\n}',
          customFields: [],
        },
      },
      {
        id: "node-6",
        type: "apiStep",
        position: { x: 1660, y: 180 },
        data: {
          nodeNumber: 6,
          label: "Logout API",
          category: "api",
          method: "POST",
          baseUrl: "https://api.ecommerce.com",
          endpoint: "/logout",
          owner: "Auth Team",
          status: "Not started",
          priority: "Low",
          description: "Invalidates JWT session and writes audit entry.",
          expectedStatus: 200,
          customFields: [],
        },
      },
    ],
    edges: [
      {
        id: "e-1-2",
        source: "node-1",
        target: "node-2",
        type: "smoothstep",
        animated: true,
        style: { stroke: "#BAFF39", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#BAFF39" },
      },
      {
        id: "e-2-3",
        source: "node-2",
        target: "node-3",
        type: "smoothstep",
        animated: true,
        style: { stroke: "#BAFF39", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#BAFF39" },
      },
      {
        id: "e-3-4",
        source: "node-3",
        target: "node-4",
        type: "smoothstep",
        animated: true,
        style: { stroke: "#BAFF39", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#BAFF39" },
      },
      {
        id: "e-4-5",
        source: "node-4",
        target: "node-5",
        type: "smoothstep",
        animated: true,
        style: { stroke: "#BAFF39", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#BAFF39" },
      },
      {
        id: "e-5-6",
        source: "node-5",
        target: "node-6",
        type: "smoothstep",
        animated: true,
        style: { stroke: "#BAFF39", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#BAFF39" },
      },
    ],
  },
  {
    id: "flow-stripe-webhook",
    name: "Stripe Webhook & DB Sync",
    description: "Ingests payment webhooks, parses event data, and synchronizes subscriber tier in PostgreSQL.",
    updatedAt: Date.now() - 3600000,
    nodes: [
      {
        id: "sw-1",
        type: "apiStep",
        position: { x: 80, y: 180 },
        data: {
          nodeNumber: 1,
          label: "Stripe Webhook Listener",
          category: "trigger",
          method: "POST",
          baseUrl: "https://api.stripe.com",
          endpoint: "/webhooks/charge-succeeded",
          owner: "Alex R.",
          status: "Completed",
          priority: "Critical",
          description: "Listens for payment intent succeeded events and verifies cryptographic signature.",
          customFields: [
            { id: "scf-1", label: "WebhookSecret", value: "whsec_live_9a87bf..." },
          ],
        },
      },
      {
        id: "sw-2",
        type: "apiStep",
        position: { x: 420, y: 180 },
        data: {
          nodeNumber: 2,
          label: "Transform & Normalize",
          category: "transform",
          endpoint: "data.customer.tier",
          owner: "Data Team",
          status: "Completed",
          priority: "High",
          description: "Extracts customer UUID and normalizes payload according to unified schema.",
          customFields: [],
        },
      },
      {
        id: "sw-3",
        type: "apiStep",
        position: { x: 760, y: 180 },
        data: {
          nodeNumber: 3,
          label: "Upsert PostgreSQL User",
          category: "database",
          method: "POST",
          endpoint: "db.users.upsert()",
          owner: "Backend",
          status: "In progress",
          priority: "High",
          description: "Updates user subscription record in the transactions ledger.",
          customFields: [],
        },
      },
      {
        id: "sw-4",
        type: "apiStep",
        position: { x: 1100, y: 180 },
        data: {
          nodeNumber: 4,
          label: "Slack Alert & Receipt",
          category: "action",
          method: "POST",
          endpoint: "https://hooks.slack.com/services/...",
          owner: "Growth Team",
          status: "Not started",
          priority: "Medium",
          description: "Notifies #sales-wins channel and sends confirmation receipt.",
          customFields: [],
        },
      },
    ],
    edges: [
      {
        id: "e-sw-1-2",
        source: "sw-1",
        target: "sw-2",
        type: "smoothstep",
        animated: true,
        style: { stroke: "#BAFF39", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#BAFF39" },
      },
      {
        id: "e-sw-2-3",
        source: "sw-2",
        target: "sw-3",
        type: "smoothstep",
        animated: true,
        style: { stroke: "#BAFF39", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#BAFF39" },
      },
      {
        id: "e-sw-3-4",
        source: "sw-3",
        target: "sw-4",
        type: "smoothstep",
        animated: true,
        style: { stroke: "#BAFF39", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#BAFF39" },
      },
    ],
  },
  {
    id: "flow-auth-test",
    name: "Authentication Flow",
    description: "3-step authentication verification: Login -> Token Verify -> Session Profile.",
    updatedAt: Date.now() - 1800000,
    nodes: [
      {
        id: "auth-1",
        type: "apiStep",
        position: { x: 120, y: 180 },
        data: {
          nodeNumber: 1,
          label: "Login API",
          category: "api",
          method: "POST",
          baseUrl: "https://api.ecommerce.com",
          endpoint: "/auth/login",
          owner: "Auth Team",
          status: "Completed",
          priority: "Critical",
          description: "Authenticates credentials and returns JWT bearer token.",
          expectedStatus: 200,
          requestBody: '{\n  "email": "alex@company.com",\n  "password": "••••••••"\n}',
          customFields: [
            { id: "acf-1", label: "Content-Type", value: "application/json" },
          ],
        },
      },
      {
        id: "auth-2",
        type: "apiStep",
        position: { x: 460, y: 180 },
        data: {
          nodeNumber: 2,
          label: "Verify Token",
          category: "api",
          method: "GET",
          baseUrl: "https://api.ecommerce.com",
          endpoint: "/auth/verify",
          owner: "Security Team",
          status: "Completed",
          priority: "High",
          description: "Validates cryptographic signature and claims expiration.",
          expectedStatus: 200,
          customFields: [
            { id: "acf-2", label: "Authorization", value: "Bearer {{token}}" },
          ],
        },
      },
      {
        id: "auth-3",
        type: "apiStep",
        position: { x: 800, y: 180 },
        data: {
          nodeNumber: 3,
          label: "Tenant Profile",
          category: "api",
          method: "GET",
          baseUrl: "https://api.ecommerce.com",
          endpoint: "/users/me",
          owner: "User Core",
          status: "In progress",
          priority: "High",
          description: "Retrieves tenant workspace profile and user permissions.",
          expectedStatus: 200,
          customFields: [
            { id: "acf-3", label: "Authorization", value: "Bearer {{token}}" },
          ],
        },
      },
    ],
    edges: [
      {
        id: "e-auth-1-2",
        source: "auth-1",
        target: "auth-2",
        type: "smoothstep",
        animated: true,
        style: { stroke: "#BAFF39", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#BAFF39" },
      },
      {
        id: "e-auth-2-3",
        source: "auth-2",
        target: "auth-3",
        type: "smoothstep",
        animated: true,
        style: { stroke: "#BAFF39", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#BAFF39" },
      },
    ],
  },
];

// Custom React Flow Node Component with the Original Canvas Design
function CustomApiNode({
  id,
  data,
  selected,
}: {
  id: string;
  data: FlowNodeData;
  selected?: boolean;
}) {
  const getCategoryIcon = (category: NodeCategory) => {
    switch (category) {
      case "trigger":
        return <Zap size={13} className="text-sky-400" />;
      case "api":
        return <Globe size={13} style={{ color: "var(--neon-lime)" }} />;
      case "transform":
        return <Cpu size={13} className="text-purple-400" />;
      case "database":
        return <Database size={13} className="text-amber-400" />;
      case "action":
        return <Bell size={13} className="text-emerald-400" />;
      default:
        return <Globe size={13} />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Completed":
        return "badge-status-completed";
      case "In progress":
        return "badge-status-in-progress";
      case "Failed":
        return "bg-rose-500/20 text-rose-400 border border-rose-500/30";
      default:
        return "badge-status-not-started";
    }
  };

  const isConfigured = Boolean(data.endpoint || data.method);

  return (
    <div
      className={`flow-node-card ${selected ? "is-selected" : ""} ${data.executionState === "running" ? "ring-2 ring-sky-400 animate-pulse" : ""
        } ${data.executionState === "failed" ? "border-rose-500" : ""}`}
    >
      {/* Left Input Handle */}
      <Handle type="target" position={Position.Left} />

      {/* Card Header */}
      <div className="flow-node__header">
        <div className={`flow-node__type-pill ${data.category}`}>
          {getCategoryIcon(data.category)}
          <span>{data.nodeNumber ? `API ${data.nodeNumber}` : data.category}</span>
          {data.method && (
            <span
              style={{
                fontSize: "9px",
                padding: "1px 5px",
                borderRadius: "3px",
                fontWeight: 800,
                background: "rgba(255,255,255,0.08)",
                color:
                  data.method === "GET"
                    ? "var(--color-get)"
                    : data.method === "POST"
                      ? "var(--neon-lime)"
                      : "var(--color-put)",
              }}
            >
              {data.method}
            </span>
          )}
        </div>
        <div className="flow-node__actions nodrag">
          <button
            className="action-icon-btn"
            title="Edit / Configure node"
            onClick={(e) => {
              e.stopPropagation();
              data.onEdit?.(id);
            }}
          >
            <Sliders size={13} />
          </button>
          <button
            className="action-icon-btn delete"
            title="Delete node"
            onClick={(e) => {
              e.stopPropagation();
              data.onDelete?.(id);
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="flow-node__body">
        <div className="flow-node__title">{data.label}</div>
        {data.endpoint && <div className="flow-node__url">{data.endpoint}</div>}
        {data.description && <div className="flow-node__desc">{data.description}</div>}

        {/* Dynamic Execution Badge or Static Status */}
        <div className="flow-node__meta-row">
          {data.executionState === "running" ? (
            <span className="node-badge badge-status-in-progress flex items-center gap-1">
              <RefreshCw size={10} className="animate-spin" /> Running...
            </span>
          ) : data.executionState === "success" ? (
            <span className="node-badge badge-status-completed flex items-center gap-1">
              <CheckCircle2 size={10} /> ✓ Success {data.actualStatus || 200}
            </span>
          ) : data.executionState === "failed" ? (
            <span className="node-badge bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
              <AlertCircle size={10} /> ✕ Failed {data.actualStatus || 500}
            </span>
          ) : (
            <span className={`node-badge ${getStatusClass(data.status)}`}>
              {isConfigured ? data.status : "Not Configured"}
            </span>
          )}

          <span className="node-badge badge-priority">{data.priority}</span>
          {data.owner && <span className="node-badge badge-priority">{data.owner}</span>}
        </div>
      </div>

      {/* Card Footer */}
      <div className="flow-node__footer nodrag">
        <span className="flow-node__fields-count">
          {data.customFields?.length || 0} {data.customFields?.length === 1 ? "field" : "fields"}
        </span>
        <button
          className="btn-add-next"
          title="Append next connected step"
          onClick={(e) => {
            e.stopPropagation();
            data.onAddNext?.(id);
          }}
        >
          <Plus size={12} />
          <span>Connect Next</span>
        </button>
      </div>

      {/* Right Output Handle */}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = {
  apiStep: CustomApiNode,
};

// Inner Canvas Component to leverage ReactFlow Hooks (fitView, zoom, etc.)
function FlowCanvasContent({
  activeFlow,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onAddNextNode,
  onDeleteNode,
  onEditNode,
  onOpenNewNodeModal,
  selectedNodeId,
  isTesting,
  onRunTest,
}: {
  activeFlow: SavedFlow;
  onNodesChange: (changes: NodeChange<FlowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeClick: (node: FlowNode) => void;
  onAddNextNode: (sourceId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onEditNode: (nodeId: string) => void;
  onOpenNewNodeModal: () => void;
  selectedNodeId: string | null;
  isTesting: boolean;
  onRunTest: () => void;
}) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const canvasNodes = useMemo(() => {
    return activeFlow.nodes.map((node, index) => ({
      ...node,
      data: {
        ...node.data,
        onAddNext: onAddNextNode,
        onDelete: onDeleteNode,
        onEdit: onEditNode,
        stepIndex: index + 1,
      },
      selected: node.id === selectedNodeId,
    }));
  }, [activeFlow.nodes, onAddNextNode, onDeleteNode, onEditNode, selectedNodeId]);

  // Clean auto-layout algorithm for nodes
  const autoLayoutNodes = useCallback(() => {
    const updated = activeFlow.nodes.map((node, idx) => ({
      ...node,
      position: {
        x: 60 + idx * 320,
        y: 180 + (idx % 2 === 1 ? 30 : 0),
      },
    }));
    const changes: NodeChange<FlowNode>[] = updated.map((node) => ({
      type: "position",
      id: node.id,
      position: node.position,
    }));
    onNodesChange(changes);
    setTimeout(() => {
      fitView({ padding: 0.25, duration: 400 });
    }, 50);
  }, [activeFlow.nodes, onNodesChange, fitView]);

  // Automatically fit nodes into view when flow changes
  useEffect(() => {
    if (activeFlow.nodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 300 });
      }, 100);
    }
  }, [activeFlow.id, fitView]);

  return (
    <div className="relative w-full h-full">
      {/* Floating Canvas Toolbar */}
      <div className="floating-toolbar">
        <button
          className="canvas-tool-btn primary"
          onClick={onOpenNewNodeModal}
          title="Add a new node to the canvas"
        >
          <Plus size={14} />
          <span>Add Node</span>
        </button>

        <div className="toolbar-divider" />

        <button
          className="canvas-tool-btn"
          onClick={autoLayoutNodes}
          title="Auto arrange nodes"
        >
          <LayoutGrid size={14} />
          <span>Auto Layout</span>
        </button>

        <button
          className="canvas-tool-btn"
          onClick={() => fitView({ padding: 0.2, duration: 300 })}
          title="Fit view"
        >
          <Maximize2 size={14} />
          <span>Fit View</span>
        </button>

        <button
          className="canvas-tool-btn"
          onClick={() => zoomIn({ duration: 200 })}
          title="Zoom In"
        >
          +
        </button>

        <button
          className="canvas-tool-btn"
          onClick={() => zoomOut({ duration: 200 })}
          title="Zoom Out"
        >
          -
        </button>

        <div className="toolbar-divider" />

        <button
          className={`canvas-tool-btn ${isTesting ? "opacity-75 cursor-wait" : ""}`}
          onClick={onRunTest}
          disabled={isTesting || activeFlow.nodes.length === 0}
          title="Simulate sequential workflow execution"
          style={{
            background: isTesting ? "rgba(186, 255, 57, 0.15)" : "var(--neon-lime)",
            color: "var(--neon-lime-dark)",
            fontWeight: 800,
            boxShadow: isTesting ? "none" : "0 0 14px var(--neon-lime-glow)",
          }}
        >
          <Play size={13} fill={isTesting ? "none" : "var(--neon-lime-dark)"} />
          <span>{isTesting ? "Executing..." : "Run Flow"}</span>
        </button>
      </div>

      {/* Main ReactFlow Graph Canvas */}
      <ReactFlow
        nodes={canvasNodes}
        edges={activeFlow.edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => onNodeClick(node as FlowNode)}
        nodesConnectable={true}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.8}
        deleteKeyCode={["Backspace", "Delete"]}
      >
        <Background gap={22} size={1.5} color="#202735" />
        <Controls position="bottom-right" showInteractive={false} />
        <MiniMap
          nodeColor="#BAFF39"
          maskColor="rgba(11, 13, 17, 0.85)"
          position="bottom-left"
          nodeStrokeColor="#ffffff"
          nodeStrokeWidth={2}
        />
      </ReactFlow>

      {/* Empty State if Flow has 0 nodes */}
      {activeFlow.nodes.length === 0 && (
        <div className="empty-canvas-state">
          <div className="empty-canvas-icon">
            <Layers size={28} />
          </div>
          <h3>Canvas is ready</h3>
          <p>Start building your orchestration pipeline by adding your first trigger or API node.</p>
          <button className="btn-primary" onClick={onOpenNewNodeModal}>
            <Plus size={14} className="inline mr-1" /> Add Starting Node
          </button>
        </div>
      )}
    </div>
  );
}

// Main Application Page
export default function FlowEditorPage() {
  const [flows, setFlows] = useState<SavedFlow[]>(starterFlows);
  const [activeFlowId, setActiveFlowId] = useState<string>(starterFlows[0].id);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draftNode, setDraftNode] = useState<NodeDetails | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Modals state
  const [isEditingFlowModalOpen, setIsEditingFlowModalOpen] = useState(false);
  const [flowEditName, setFlowEditName] = useState("");
  const [flowEditDesc, setFlowEditDesc] = useState("");

  const [isDeleteFlowModalOpen, setIsDeleteFlowModalOpen] = useState(false);
  const [isNewNodeModalOpen, setIsNewNodeModalOpen] = useState(false);
  const [newNodeCategory, setNewNodeCategory] = useState<NodeCategory>("api");
  const [newNodeTitle, setNewNodeTitle] = useState("");


  const dispatch = useAppDispatch();
  

  // Testing & execution simulation state
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingSingleApi, setIsTestingSingleApi] = useState(false);
  const [testApiResult, setTestApiResult] = useState<{
    status: "success" | "failed";
    statusCode: number;
    latencyMs: number;
    body: string;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role?: string } | null>(null);

  // 1. LocalStorage Hydration: Ensure nodes are always loaded and never empty!
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          Array.isArray(parsed[0].nodes) &&
          parsed[0].nodes.length > 0
        ) {
          setFlows(parsed);
          setActiveFlowId(parsed[0].id);
        } else {
          // If stored state is empty, initialize with starterFlows
          setFlows(starterFlows);
          setActiveFlowId(starterFlows[0].id);
        }
      } else {
        setFlows(starterFlows);
        setActiveFlowId(starterFlows[0].id);
      }

      const preferredFlowId = window.localStorage.getItem("apiflow_active_flow_id");
      if (preferredFlowId) {
        // Ensure flow exists
        const allKnown = starterFlows;
        setFlows((prev) => {
          const exists = prev.some((f) => f.id === preferredFlowId);
          if (!exists) {
            const foundInStarter = allKnown.find((f) => f.id === preferredFlowId);
            return foundInStarter ? [foundInStarter, ...prev] : prev;
          }
          return prev;
        });
        setActiveFlowId(preferredFlowId);
        window.localStorage.removeItem("apiflow_active_flow_id");
      }

      const storedUser = window.localStorage.getItem("apiflow_user");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch {
      setFlows(starterFlows);
    }
    setIsLoaded(true);
  }, []);

  // 2. LocalStorage Persistence
  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(flows));
    }
  }, [flows, isLoaded]);

  // Active Flow reference
  const activeFlow = useMemo(() => {
    return flows.find((f) => f.id === activeFlowId) || flows[0] || starterFlows[0];
  }, [flows, activeFlowId]);

  // Helper to mutate active flow
  const updateActiveFlow = useCallback(
    (updater: (prev: SavedFlow) => SavedFlow) => {
      setFlows((currentFlows) =>
        currentFlows.map((flow) =>
          flow.id === activeFlowId
            ? { ...updater(flow), updatedAt: Date.now() }
            : flow
        )
      );
    },
    [activeFlowId]
  );

  // Flow CRUD Handlers
  const handleCreateFlow = () => {
    const newId = `flow-${Date.now()}`;
    const newFlow: SavedFlow = {
      id: newId,
      name: `Pipeline #${flows.length + 1}`,
      description: "Custom API workflow testing sequence.",
      updatedAt: Date.now(),
      nodes: [
        {
          id: `node-${Date.now()}-1`,
          type: "apiStep",
          position: { x: 100, y: 180 },
          data: defaultNodeData("API 1", "api", 1),
        },
      ],
      edges: [],
    };
    setFlows((prev) => [newFlow, ...prev]);
    setActiveFlowId(newId);
    setSelectedNodeId(null);
    setDraftNode(null);
    showToast("New workflow created");
  };

  const handleOpenEditFlow = () => {
    setFlowEditName(activeFlow.name);
    setFlowEditDesc(activeFlow.description || "");
    setIsEditingFlowModalOpen(true);
  };

  const handleSaveFlowMeta = (e: FormEvent) => {
    e.preventDefault();
    if (!flowEditName.trim()) return;
    updateActiveFlow((prev) => ({
      ...prev,
      name: flowEditName.trim(),
      description: flowEditDesc.trim(),
    }));
    setIsEditingFlowModalOpen(false);
    showToast("Workflow updated");
  };

  const handleDeleteFlow = () => {
    if (flows.length <= 1) {
      setFlows(starterFlows);
      setActiveFlowId(starterFlows[0].id);
    } else {
      const remaining = flows.filter((f) => f.id !== activeFlowId);
      setFlows(remaining);
      setActiveFlowId(remaining[0].id);
    }
    setIsDeleteFlowModalOpen(false);
    setSelectedNodeId(null);
    setDraftNode(null);
    showToast("Workflow deleted");
  };

  const handleDuplicateFlow = (e: React.MouseEvent, flowToDup: SavedFlow) => {
    e.stopPropagation();
    const newId = `flow-copy-${Date.now()}`;
    const duplicated: SavedFlow = {
      ...flowToDup,
      id: newId,
      name: `${flowToDup.name} (Copy)`,
      updatedAt: Date.now(),
    };
    setFlows((prev) => [...prev, duplicated]);
    setActiveFlowId(newId);
    showToast("Workflow duplicated");
  };

  // Node CRUD Handlers
  const handleNodesChange = useCallback(
    (changes: NodeChange<FlowNode>[]) => {
      updateActiveFlow((flow) => ({
        ...flow,
        nodes: applyNodeChanges(changes, flow.nodes),
      }));
    },
    [updateActiveFlow]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      updateActiveFlow((flow) => ({
        ...flow,
        edges: applyEdgeChanges(changes, flow.edges),
      }));
    },
    [updateActiveFlow]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      updateActiveFlow((flow) => {
        const exists = flow.edges.some(
          (e) => e.source === connection.source && e.target === connection.target
        );
        if (exists) return flow;

        const newEdge: Edge = {
          id: `edge-${connection.source}-${connection.target}`,
          source: connection.source,
          target: connection.target,
          type: "smoothstep",
          animated: true,
          style: { stroke: "#BAFF39", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#BAFF39" },
        };
        return {
          ...flow,
          edges: [...flow.edges, newEdge],
        };
      });
      showToast("Nodes connected");
    },
    [updateActiveFlow]
  );

  const handleAddNextNode = useCallback(
    (sourceId: string) => {
      updateActiveFlow((flow) => {
        const sourceNode = flow.nodes.find((n) => n.id === sourceId);
        if (!sourceNode) return flow;

        const newId = `node-${Date.now()}`;
        const nextStepIndex = flow.nodes.length + 1;
        const nextNode: FlowNode = {
          id: newId,
          type: "apiStep",
          position: {
            x: sourceNode.position.x + 320,
            y: sourceNode.position.y,
          },
          data: defaultNodeData(`API ${nextStepIndex}`, "api", nextStepIndex),
        };

        const newEdge: Edge = {
          id: `edge-${sourceId}-${newId}`,
          source: sourceId,
          target: newId,
          type: "smoothstep",
          animated: true,
          style: { stroke: "#BAFF39", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#BAFF39" },
        };

        return {
          ...flow,
          nodes: [...flow.nodes, nextNode],
          edges: [...flow.edges, newEdge],
        };
      });
      showToast("Connected step created");
    },
    [updateActiveFlow]
  );

  const handleCreateCustomNode = (e: FormEvent) => {
    e.preventDefault();
    const title = newNodeTitle.trim() || `API ${activeFlow.nodes.length + 1}`;
    const newId = `node-${Date.now()}`;
    const lastNode = activeFlow.nodes[activeFlow.nodes.length - 1];
    const posX = lastNode ? lastNode.position.x + 320 : 120;
    const posY = lastNode ? lastNode.position.y : 180;

    const newNode: FlowNode = {
      id: newId,
      type: "apiStep",
      position: { x: posX, y: posY },
      data: defaultNodeData(title, newNodeCategory, activeFlow.nodes.length + 1),
    };

    updateActiveFlow((flow) => ({
      ...flow,
      nodes: [...flow.nodes, newNode],
    }));

    setIsNewNodeModalOpen(false);
    setNewNodeTitle("");
    setSelectedNodeId(newId);
    setDraftNode(newNode.data);
    showToast("Node added");
  };

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      updateActiveFlow((flow) => ({
        ...flow,
        nodes: flow.nodes.filter((n) => n.id !== nodeId),
        edges: flow.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      }));

      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
        setDraftNode(null);
      }
      showToast("Node removed");
    },
    [updateActiveFlow, selectedNodeId]
  );

  // Inspector Panel Selection
  const handleSelectNode = useCallback((node: FlowNode) => {
    setSelectedNodeId(node.id);
    setDraftNode({
      ...node.data,
      customFields: node.data.customFields ? [...node.data.customFields] : [],
    });
    setTestApiResult(null);
  }, []);

  const handleSaveNodeDetails = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedNodeId || !draftNode) return;

    updateActiveFlow((flow) => ({
      ...flow,
      nodes: flow.nodes.map((n) =>
        n.id === selectedNodeId
          ? {
            ...n,
            data: {
              ...draftNode,
              status: "Completed",
            },
          }
          : n
      ),
    }));

    showToast("API configuration saved");
  };

  // Test API in Inspector
  const handleTestSingleApi = () => {
    if (!draftNode) return;
    setIsTestingSingleApi(true);
    setTestApiResult(null);

    setTimeout(() => {
      setIsTestingSingleApi(false);
      setTestApiResult({
        status: "success",
        statusCode: draftNode.expectedStatus || 200,
        latencyMs: 243,
        body: JSON.stringify(
          {
            success: true,
            endpoint: draftNode.endpoint || "/api",
            message: `${draftNode.label} passed test assertions`,
          },
          null,
          2
        ),
      });
      showToast("API test executed: 200 OK");
    }, 600);
  };

  // Dynamic Custom Field Add/Remove Handlers
  const handleAddCustomField = () => {
    if (!draftNode) return;
    const newField: CustomField = {
      id: `field-${Date.now()}`,
      label: "",
      value: "",
      type: "text",
    };
    setDraftNode({
      ...draftNode,
      customFields: [...draftNode.customFields, newField],
    });
  };

  const handleRemoveCustomField = (fieldId: string) => {
    if (!draftNode) return;
    setDraftNode({
      ...draftNode,
      customFields: draftNode.customFields.filter((f) => f.id !== fieldId),
    });
  };

  const handleUpdateCustomField = (
    fieldId: string,
    key: "label" | "value",
    val: string
  ) => {
    if (!draftNode) return;
    setDraftNode({
      ...draftNode,
      customFields: draftNode.customFields.map((f) =>
        f.id === fieldId ? { ...f, [key]: val } : f
      ),
    });
  };

  // Export Flow JSON
  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(activeFlow, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `${activeFlow.name.toLowerCase().replace(/\s+/g, "-")}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Flow JSON exported");
  };

  // Run Sequential Flow Execution
  const handleRunTest = async () => {
    if (isTesting || activeFlow.nodes.length === 0) return;
    setIsTesting(true);
    showToast("Executing API workflow sequence...");

    // Reset all nodes to idle
    updateActiveFlow((flow) => ({
      ...flow,
      nodes: flow.nodes.map((n) => ({
        ...n,
        data: { ...n.data, executionState: "idle" },
      })),
    }));

    // Sequential animation
    for (let i = 0; i < activeFlow.nodes.length; i++) {
      const targetNode = activeFlow.nodes[i];

      // Mark running
      updateActiveFlow((flow) => ({
        ...flow,
        nodes: flow.nodes.map((n) =>
          n.id === targetNode.id
            ? { ...n, data: { ...n.data, executionState: "running" } }
            : n
        ),
      }));

      await new Promise((r) => setTimeout(r, 400));

      // Mark success
      updateActiveFlow((flow) => ({
        ...flow,
        nodes: flow.nodes.map((n) =>
          n.id === targetNode.id
            ? {
              ...n,
              data: {
                ...n.data,
                executionState: "success",
                actualStatus: 200,
                latencyMs: 180 + Math.floor(Math.random() * 80),
              },
            }
            : n
        ),
      }));
    }

    setIsTesting(false);
    showToast(`Flow passed: ${activeFlow.nodes.length}/${activeFlow.nodes.length} APIs verified`);
  };

  return (
    <div className="flow-layout">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 100,
            background: "var(--bg-surface-elevated)",
            border: "1px solid var(--neon-lime)",
            color: "var(--text-white)",
            padding: "10px 18px",
            borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.6), 0 0 12px var(--neon-lime-glow)",
            fontSize: "13px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <span style={{ color: "var(--neon-lime)" }}>●</span>
          {toastMessage}
        </div>
      )}

      {/* Sidebar: Workflows Management */}
      <aside className="sidebar">
        <div className="sidebar__header">
          <div className="brand-container">
            <div className="brand-logo">
              <div className="brand-logo__icon">⚡</div>
              <span className="brand-logo__name">API FLOW</span>
            </div>
            <span className="brand-badge">PRO</span>
          </div>

          <div className="flow-section-heading">
            <span>Workflows ({flows.length})</span>
            <button
              className="btn-new-flow"
              onClick={handleCreateFlow}
              title="Create a new workflow"
            >
              <Plus size={13} />
              <span>New Flow</span>
            </button>
          </div>
        </div>

        {/* Saved Flows List */}
        <div className="sidebar__flow-list">
          {flows.map((flow) => {
            const isActive = flow.id === activeFlow.id;
            return (
              <div
                key={flow.id}
                className={`flow-card ${isActive ? "is-active" : ""}`}
                onClick={() => {
                  setActiveFlowId(flow.id);
                  setSelectedNodeId(null);
                  setDraftNode(null);
                }}
              >
                <div className="flow-card__content">
                  <div className="flow-card__icon">
                    <Layers size={14} />
                  </div>
                  <div className="flow-card__meta">
                    <div className="flow-card__title">{flow.name}</div>
                    <div className="flow-card__badge">
                      {flow.nodes.length} nodes · {flow.edges.length} connections
                    </div>
                  </div>
                </div>

                <div className="flow-card__actions">
                  <button
                    className="action-icon-btn"
                    title="Duplicate flow"
                    onClick={(e) => handleDuplicateFlow(e, flow)}
                  >
                    <Copy size={12} />
                  </button>
                  {isActive && (
                    <button
                      className="action-icon-btn"
                      title="Rename flow"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditFlow();
                      }}
                    >
                      <Edit2 size={12} />
                    </button>
                  )}
                  <button
                    className="action-icon-btn delete"
                    title="Delete flow"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveFlowId(flow.id);
                      setIsDeleteFlowModalOpen(true);
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar__footer">
          <button
            className="btn-secondary"
            onClick={handleExportJSON}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <Download size={13} />
            <span>Export Flow JSON</span>
          </button>

          <div style={{ display: "flex", gap: "6px" }}>
            <Link
              href="/onboarding"
              className="btn-secondary"
              style={{
                flex: 1,
                textAlign: "center",
                textDecoration: "none",
                fontSize: "11px",
                padding: "6px 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              <span>Onboarding</span>
            </Link>

            {currentUser ? (
              <button
                className="btn-secondary"
                style={{ flex: 1, textAlign: "center", fontSize: "11px", padding: "6px 8px" }}
                onClick={() => {
                  window.localStorage.removeItem("apiflow_user");
                  setCurrentUser(null);
                  showToast("Signed out");
                }}
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                className="btn-secondary"
                style={{
                  flex: 1,
                  textAlign: "center",
                  textDecoration: "none",
                  fontSize: "11px",
                  padding: "6px 8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                <span>Login</span>
              </Link>
            )}
          </div>

          <div style={{ fontSize: "11px", color: "var(--dim-grey)", textAlign: "center" }}>
            APIFlow Visual Testing Suite · Local Sandbox
          </div>
        </div>
      </aside>

      {/* Main Canvas Panel */}
      <main className="canvas-panel">
        {/* Top Header Bar */}
        <header className="canvas-panel__topbar">
          <div className="canvas-panel__flow-info">
            <div className="flow-title-display">
              <span className="flow-title-text">{activeFlow.name}</span>
              <button
                className="action-icon-btn"
                title="Edit flow name & description"
                onClick={handleOpenEditFlow}
              >
                <Edit2 size={14} />
              </button>
            </div>

            <div className="topbar-stats">
              <span className="stat-pill">
                Nodes: <strong>{activeFlow.nodes.length}</strong>
              </span>
              <span className="stat-pill">
                Connections: <strong>{activeFlow.edges.length}</strong>
              </span>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="status-indicator">
              <div className="status-dot" />
              <span>Saved locally</span>
            </div>

            <button
              className="btn-primary"
              disabled={isTesting || activeFlow.nodes.length === 0}
              onClick={handleRunTest}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 800,
              }}
            >
              <Play size={13} fill="var(--neon-lime-dark)" />
              <span>{isTesting ? "Testing..." : "Run Flow"}</span>
            </button>

            {/* Auth status & Nav */}
            {currentUser ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border-medium)",
                  padding: "5px 12px",
                  borderRadius: "9999px",
                  fontSize: "12px",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "var(--neon-lime)",
                    boxShadow: "0 0 6px var(--neon-lime)",
                  }}
                />
                <span style={{ color: "var(--text-white)", fontWeight: 700 }}>
                  {currentUser.name}
                </span>
              </div>
            )}
            <button
                  className="btn-secondary"
              style={{ flex: 1, textAlign: "center", fontSize: "11px", padding: "6px 8px" }}
              onClick={() => {
                dispatch(SET_LOGOUT(null));
                router.replace("/login");
                showToast("Signed out");
              }}
                >
              Sign Out
            </button>
          </div>
        </header>

        {/* ReactFlow Canvas Wrap */}
        <div className="relative flex-1 w-full h-full overflow-hidden">
          <ReactFlowProvider>
            <FlowCanvasContent
              activeFlow={activeFlow}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={handleConnect}
              onNodeClick={handleSelectNode}
              onAddNextNode={handleAddNextNode}
              onDeleteNode={handleDeleteNode}
              onEditNode={(nodeId) => {
                const node = activeFlow.nodes.find((n) => n.id === nodeId);
                if (node) handleSelectNode(node);
              }}
              onOpenNewNodeModal={() => setIsNewNodeModalOpen(true)}
              selectedNodeId={selectedNodeId}
              isTesting={isTesting}
              onRunTest={handleRunTest}
            />
          </ReactFlowProvider>
        </div>
      </main>

      {/* Dedicated Node Inspector Panel (Slide-over drawer) */}
      {draftNode && selectedNodeId && (
        <aside className="inspector-panel" aria-label="Node Inspector">
          <div className="inspector-panel__header">
            <div className="inspector-panel__title-wrap">
              <h3>Configure API</h3>
              <p>
                {draftNode.nodeNumber ? `API Node ${draftNode.nodeNumber}` : `${draftNode.category} Step`}
              </p>
            </div>
            <button
              className="action-icon-btn"
              onClick={() => {
                setSelectedNodeId(null);
                setDraftNode(null);
              }}
              title="Close inspector"
            >
              <X size={18} />
            </button>
          </div>

          <form className="flex-1 flex flex-col overflow-hidden" onSubmit={handleSaveNodeDetails}>
            <div className="inspector-panel__body">
              {/* API Name */}
              <div className="form-group">
                <label>API Name *</label>
                <input
                  className="form-input"
                  value={draftNode.label}
                  onChange={(e) => setDraftNode({ ...draftNode, label: e.target.value })}
                  placeholder="e.g. Login API"
                  required
                />
              </div>

              {/* Method & Expected Status Code */}
              <div className="form-row-2">
                <div className="form-group">
                  <label>HTTP Method *</label>
                  <select
                    className="form-select"
                    value={draftNode.method || "POST"}
                    onChange={(e) =>
                      setDraftNode({ ...draftNode, method: e.target.value as HttpMethod })
                    }
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Expected Status</label>
                  <input
                    type="number"
                    className="form-input font-mono"
                    value={draftNode.expectedStatus || 200}
                    onChange={(e) =>
                      setDraftNode({ ...draftNode, expectedStatus: Number(e.target.value) })
                    }
                    placeholder="200"
                  />
                </div>
              </div>

              {/* Base URL */}
              <div className="form-group">
                <label>Base URL *</label>
                <input
                  className="form-input font-mono text-xs"
                  value={draftNode.baseUrl || ""}
                  onChange={(e) => setDraftNode({ ...draftNode, baseUrl: e.target.value })}
                  placeholder="https://api.example.com"
                />
              </div>

              {/* Endpoint */}
              <div className="form-group">
                <label>Endpoint *</label>
                <input
                  className="form-input font-mono text-xs"
                  value={draftNode.endpoint || ""}
                  onChange={(e) => setDraftNode({ ...draftNode, endpoint: e.target.value })}
                  placeholder="/login"
                />
              </div>

              {/* Auth Token */}
              <div className="form-group">
                <label className="flex items-center justify-between">
                  <span>Authentication Token</span>
                  <span className="text-[10px] text-slate-400">Optional</span>
                </label>
                <input
                  type="password"
                  className="form-input font-mono text-xs"
                  value={draftNode.authToken || ""}
                  onChange={(e) => setDraftNode({ ...draftNode, authToken: e.target.value })}
                  placeholder="Bearer token or secret..."
                />
              </div>

              {/* Dynamic Headers & Query Parameters */}
              <div className="custom-fields-section">
                <div className="custom-fields-header">
                  <h4>Headers & Query Parameters</h4>
                  <button
                    type="button"
                    className="btn-add-field"
                    onClick={handleAddCustomField}
                  >
                    <Plus size={12} />
                    <span>Add Parameter</span>
                  </button>
                </div>

                {draftNode.customFields.length === 0 ? (
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--dim-grey)" }}>
                    No headers or query parameters added yet.
                  </p>
                ) : (
                  draftNode.customFields.map((field) => (
                    <div className="custom-field-row" key={field.id}>
                      <input
                        placeholder="Key (e.g. Content-Type)"
                        value={field.label}
                        onChange={(e) =>
                          handleUpdateCustomField(field.id, "label", e.target.value)
                        }
                      />
                      <input
                        placeholder="Value (e.g. application/json)"
                        value={field.value}
                        onChange={(e) =>
                          handleUpdateCustomField(field.id, "value", e.target.value)
                        }
                      />
                      <button
                        type="button"
                        className="action-icon-btn delete"
                        onClick={() => handleRemoveCustomField(field.id)}
                        title="Remove parameter"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Request Body (JSON) */}
              <div className="form-group">
                <label className="flex items-center justify-between">
                  <span>Request Body</span>
                  <span className="text-[10px] text-[#BAFF39] font-mono">JSON</span>
                </label>
                {draftNode.method === "GET" ? (
                  <div className="p-2.5 rounded bg-[#0B0D11] border border-[#232A37] text-xs text-slate-400 italic flex items-center gap-1.5">
                    <HelpCircle size={13} className="text-slate-500 shrink-0" />
                    <span>GET requests typically omit request body payloads.</span>
                  </div>
                ) : (
                  <textarea
                    className="form-textarea font-mono text-xs"
                    rows={4}
                    value={draftNode.requestBody || ""}
                    onChange={(e) => setDraftNode({ ...draftNode, requestBody: e.target.value })}
                    placeholder={`{\n  "email": "test@test.com"\n}`}
                  />
                )}
              </div>

              {/* Test API Result Card */}
              {isTestingSingleApi && (
                <div className="p-3 rounded-lg bg-[#0B0D11] border border-sky-500/40 text-xs text-sky-400 flex items-center justify-center gap-2 animate-pulse">
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Testing API endpoint...</span>
                </div>
              )}

              {testApiResult && (
                <div className="p-3 rounded-lg bg-lime-500/10 border border-lime-500/30 text-xs">
                  <div className="flex items-center justify-between mb-1.5 font-bold text-[#BAFF39]">
                    <span>✓ Success ({testApiResult.statusCode})</span>
                    <span className="font-mono text-[11px] text-slate-300">
                      {testApiResult.latencyMs} ms
                    </span>
                  </div>
                  <pre className="text-[10px] font-mono bg-[#0B0D11] p-2 rounded border border-[#232A37] text-slate-300 overflow-x-auto">
                    {testApiResult.body}
                  </pre>
                </div>
              )}
            </div>

            {/* Inspector Footer Actions */}
            <div className="inspector-panel__footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleTestSingleApi}
                disabled={isTestingSingleApi}
                style={{ flex: 1 }}
              >
                Test API
              </button>

              <button type="submit" className="btn-save-node" style={{ flex: 1 }}>
                <Check size={14} />
                <span>Save API</span>
              </button>
            </div>
          </form>
        </aside>
      )}

      {/* Modal: Edit Flow Name & Description */}
      {isEditingFlowModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Edit Workflow Details</h3>
              <button
                className="action-icon-btn"
                onClick={() => setIsEditingFlowModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveFlowMeta}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Workflow Name</label>
                  <input
                    className="form-input"
                    value={flowEditName}
                    onChange={(e) => setFlowEditName(e.target.value)}
                    placeholder="e.g. E-commerce API Test"
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={flowEditDesc}
                    onChange={(e) => setFlowEditDesc(e.target.value)}
                    placeholder="Describe what APIs this test sequence executes..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsEditingFlowModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Flow Confirmation */}
      {isDeleteFlowModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Delete Workflow</h3>
              <button
                className="action-icon-btn"
                onClick={() => setIsDeleteFlowModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Are you sure you want to delete <strong>{activeFlow.name}</strong>? All nodes and API configurations will be permanently removed.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsDeleteFlowModalOpen(false)}
              >
                Cancel
              </button>
              <button type="button" className="btn-danger" onClick={handleDeleteFlow}>
                Yes, Delete Flow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Node */}
      {isNewNodeModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Add API Node to Pipeline</h3>
              <button
                className="action-icon-btn"
                onClick={() => setIsNewNodeModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCustomNode}>
              <div className="modal-body">
                <div className="form-group">
                  <label>API Node Title</label>
                  <input
                    className="form-input"
                    value={newNodeTitle}
                    onChange={(e) => setNewNodeTitle(e.target.value)}
                    placeholder="e.g. Products API, Payment Intent, etc."
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label>Node Category</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {(
                      [
                        { id: "api", name: "API Request", icon: Globe },
                        { id: "trigger", name: "Trigger / Webhook", icon: Zap },
                        { id: "transform", name: "Data Transform", icon: Cpu },
                        { id: "database", name: "Database Query", icon: Database },
                        { id: "action", name: "Action / Alert", icon: Bell },
                      ] as const
                    ).map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = newNodeCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setNewNodeCategory(cat.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 12px",
                            borderRadius: "7px",
                            background: isSelected ? "rgba(186, 255, 57, 0.12)" : "var(--bg-surface-elevated)",
                            border: `1px solid ${isSelected ? "var(--neon-lime)" : "var(--border-medium)"}`,
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
                  onClick={() => setIsNewNodeModalOpen(false)}
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
      )}
    </div>
  );
}
