"use client";

import React, { FormEvent, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { applyNodeChanges, applyEdgeChanges, Connection, Edge, EdgeChange, MarkerType, NodeChange } from "@xyflow/react";
import { Edit2, Play, Menu } from "lucide-react";

import { useAppDispatch, useAppSelector } from "./lib/hooks";
import { SET_LOGOUT } from "./lib/reducer/usersSlice";
import { clearAuth } from "./lib/auth";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { ApiTestResult, FlowNode, HttpMethod, NodeCategory, NodeDetails, SavedFlow } from "./types/flow";
import { defaultNodeData, starterFlows } from "./lib/constants/flowConstants";
import {
  exportFlowAsJson,
  simulateSingleApiTest,
  simulateWorkflowExecution,
} from "./services/flowSimulationService";

import { FlowSidebar } from "./components/Flow/FlowSidebar";
import { FlowCanvas } from "./components/Flow/FlowCanvas";
import { NodeInspector } from "./components/Flow/NodeInspector";
import { EditFlowModal } from "./components/Flow/modals/EditFlowModal";
import { DeleteFlowModal } from "./components/Flow/modals/DeleteFlowModal";
import { NewNodeModal } from "./components/Flow/modals/NewNodeModal";
import useToken from "./hooks/useToken";

export default function FlowEditorPage() {
  const [flows, setFlows] = useState<SavedFlow[]>(starterFlows);
  const [activeFlowId, setActiveFlowId] = useState<string>(starterFlows[0].id);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draftNode, setDraftNode] = useState<NodeDetails | null>(null);

  // Modals state
  const [isEditingFlowModalOpen, setIsEditingFlowModalOpen] = useState(false);
  const [flowEditName, setFlowEditName] = useState("");
  const [flowEditDesc, setFlowEditDesc] = useState("");

  const [isDeleteFlowModalOpen, setIsDeleteFlowModalOpen] = useState(false);
  const [isNewNodeModalOpen, setIsNewNodeModalOpen] = useState(false);
  const [newNodeCategory, setNewNodeCategory] = useState<NodeCategory>("api");
  const [newNodeTitle, setNewNodeTitle] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Testing & execution state
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingSingleApi, setIsTestingSingleApi] = useState(false);
  const [testApiResult, setTestApiResult] = useState<ApiTestResult | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentUser = useAppSelector((state) => state?.auth?.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

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
    [updateActiveFlow, showToast]
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
    [updateActiveFlow, showToast]
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
    [updateActiveFlow, selectedNodeId, showToast]
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
  const handleTestSingleApi = async () => {
    if (!draftNode) return;
    setIsTestingSingleApi(true);
    setTestApiResult(null);

    try {
      const result = await simulateSingleApiTest(draftNode);
      setTestApiResult(result);
      showToast(`API test executed: ${result.statusCode} ${result.status === "success" ? "OK" : "ERROR"}`);
    } catch {
      showToast("API test failed");
    } finally {
      setIsTestingSingleApi(false);
    }
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

    // Sequential execution through dummy service
    await simulateWorkflowExecution(
      activeFlow.nodes,
      (nodeId, state, actualStatus, latencyMs) => {
        updateActiveFlow((flow) => ({
          ...flow,
          nodes: flow.nodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    executionState: state,
                    actualStatus: actualStatus ?? n.data.actualStatus,
                    latencyMs: latencyMs ?? n.data.latencyMs,
                  },
                }
              : n
          ),
        }));
      }
    );

    setIsTesting(false);
    showToast(
      `Flow passed: ${activeFlow.nodes.length}/${activeFlow.nodes.length} APIs verified`
    );
  };

  return (
    <ProtectedRoute>
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

        {/* Modular Sidebar Component */}
        <FlowSidebar
          flows={flows}
          activeFlowId={activeFlow.id}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSelectFlow={(flowId) => {
            setActiveFlowId(flowId);
            setSelectedNodeId(null);
            setDraftNode(null);
          }}
          onCreateFlow={handleCreateFlow}
          onDuplicateFlow={handleDuplicateFlow}
          onOpenEditFlow={handleOpenEditFlow}
          onOpenDeleteFlow={(flowId) => {
            setActiveFlowId(flowId);
            setIsDeleteFlowModalOpen(true);
          }}
          onExportJson={() => {
            exportFlowAsJson(activeFlow);
            showToast("Flow JSON exported");
          }}
        />

        {/* Main Canvas Panel */}
        <main className="canvas-panel">
          {/* Top Header Bar */}
          <header className="canvas-panel__topbar">
            <div className="canvas-panel__flow-info">
              <button
                type="button"
                className="mobile-menu-btn action-icon-btn"
                title="Open workflows menu"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={18} />
              </button>

              <div className="flow-title-display">
                <span className="flow-title-text">{activeFlow.name}</span>
                <button
                  type="button"
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
              <button
                type="button"
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

              {/* Auth status & User Nav */}
              {currentUser && (
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
                    {currentUser.full_name}
                  </span>
                </div>
              )}
              <button
                type="button"
                className="btn-secondary"
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: "11px",
                  padding: "6px 8px",
                }}
                onClick={() => {
                  clearAuth();
                  dispatch(SET_LOGOUT());
                  router.replace("/login");
                  showToast("Signed out");
                }}
              >
                Sign Out
              </button>
            </div>
          </header>

          {/* Modular Flow Canvas Component */}
          <FlowCanvas
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
        </main>

        {/* Dedicated Node Inspector Panel */}
        {draftNode && selectedNodeId && (
          <NodeInspector
            selectedNodeId={selectedNodeId}
            draftNode={draftNode}
            onDraftNodeChange={setDraftNode}
            onClose={() => {
              setSelectedNodeId(null);
              setDraftNode(null);
            }}
            onSave={handleSaveNodeDetails}
            onTestApi={handleTestSingleApi}
            isTestingSingleApi={isTestingSingleApi}
            testApiResult={testApiResult}
          />
        )}

        {/* Modals */}
        <EditFlowModal
          isOpen={isEditingFlowModalOpen}
          name={flowEditName}
          description={flowEditDesc}
          onNameChange={setFlowEditName}
          onDescriptionChange={setFlowEditDesc}
          onClose={() => setIsEditingFlowModalOpen(false)}
          onSubmit={handleSaveFlowMeta}
        />

        <DeleteFlowModal
          isOpen={isDeleteFlowModalOpen}
          flowName={activeFlow.name}
          onClose={() => setIsDeleteFlowModalOpen(false)}
          onConfirmDelete={handleDeleteFlow}
        />

        <NewNodeModal
          isOpen={isNewNodeModalOpen}
          title={newNodeTitle}
          category={newNodeCategory}
          onTitleChange={setNewNodeTitle}
          onCategoryChange={setNewNodeCategory}
          onClose={() => setIsNewNodeModalOpen(false)}
          onSubmit={handleCreateCustomNode}
        />
      </div>
    </ProtectedRoute>
  );
}
