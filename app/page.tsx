"use client";

import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  Edge,
  EdgeChange,
  MarkerType,
  NodeChange,
} from "@xyflow/react";
import { Edit2, Play, Menu } from "lucide-react";

import { useAppDispatch, useAppSelector } from "./lib/hooks";
import { SET_LOGOUT } from "./lib/reducer/usersSlice";
import { clearAuth } from "./lib/auth";
import { ProtectedRoute } from "./components/ProtectedRoute";

import {
  ApiTestResult,
  FlowNode,
  NodeDetails,
  NodeSlicesResponseInterface,
  SavedFlow,
  SavedFlowResponse,
} from "./types/flow";
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
import { request } from "./services/request";
import CreateNewFlow from "./components/Flow/modals/CreateFlowModal";
import { NewNodeModal } from "./components/Flow/modals/NewNodeModal";
import { toast } from "./components/Toast";
import { defaultNodeData } from "./lib/constants/flowConstants";

export default function FlowEditorPage() {
  const [flows, setFlows] = useState<SavedFlow[]>([]);

  const [activeFlowId, setActiveFlowId] = useState<number | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draftNode, setDraftNode] = useState<NodeDetails | null>(null);

  // Modals state
  const [isEditingFlowModalOpen, setIsEditingFlowModalOpen] = useState(false);
  const [flowEditName, setFlowEditName] = useState("");
  const [flowEditDesc, setFlowEditDesc] = useState("");

  const [isDeleteFlowModalOpen, setIsDeleteFlowModalOpen] = useState(false);
  const [isNewNodeModalOpen, setIsNewNodeModalOpen] = useState(false);
  const [newNodeTitle, setNewNodeTitle] = useState("");
  const [newNodeDescription, setNewNodeDescription] = useState("");
  const [pendingParentNodeId, setPendingParentNodeId] = useState<string | null>(
    null,
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Create Flow modal state
  const [isNewFlowModalOpen, setIsNewFlowModalOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState("");
  const [newFlowDesc, setNewFlowDesc] = useState("");
  const [newFlowTokenKey, setNewFlowTokenKey] = useState("");
  const [isCreatingFlow, setIsCreatingFlow] = useState(false);

  // Testing & execution state
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingSingleApi, setIsTestingSingleApi] = useState(false);
  const [testApiResult, setTestApiResult] = useState<ApiTestResult | null>(
    null,
  );
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
    if (!flows || flows.length === 0) return null;
    if (activeFlowId === null) return flows[0];
    return flows.find((f) => f.id === activeFlowId) || flows[0];
  }, [flows, activeFlowId]);

  // Helper to mutate active flow
  const updateActiveFlow = useCallback(
    (updater: (prev: SavedFlow) => SavedFlow) => {
      if (activeFlowId === null) return;
      setFlows((currentFlows) =>
        currentFlows.map((flow) =>
          flow.id === activeFlowId
            ? { ...updater(flow), updatedAt: Date.now() }
            : flow,
        ),
      );
    },
    [activeFlowId],
  );

  // Fetch real flows from server
  const fetchFlows = useCallback(
    async (preferredSelectId?: number) => {
      try {
        const res: SavedFlowResponse = await request({
          url: "/flow",
          method: "GET",
        });
        const items: SavedFlow[] = res?.data || [];
        setFlows(items);

        if (items.length > 0) {
          if (
            preferredSelectId &&
            items.some((f) => f.id === preferredSelectId)
          ) {
            setActiveFlowId(preferredSelectId);
          } else if (
            activeFlowId === null ||
            !items.some((f) => f.id === activeFlowId)
          ) {
            setActiveFlowId(items[0].id);
          }
        } else {
          setActiveFlowId(null);
        }
      } catch (error) {
        console.error("fetchFlows error:", error);
      }
    },
    [activeFlowId],
  );

  useEffect(() => {
    fetchFlows();
  }, [fetchFlows]);

  const buildFlowEdges = useCallback((nodes: FlowNode[]): Edge[] => {
    if (nodes.length < 2) return [];

    return nodes.slice(0, -1).map((node, index) => {
      const nextNode = nodes[index + 1];
      return {
        id: `edge-${node.id}-${nextNode.id}`,
        source: node.id,
        target: nextNode.id,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#BAFF39", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#BAFF39" },
      };
    });
  }, []);

  const fetchNodesSlices = useCallback(
    async (targetFlowId?: number) => {
      const flowId = targetFlowId ?? activeFlowId;
      if (!flowId) {
        return;
      }
      try {
        const res: NodeSlicesResponseInterface = await request({
          url: `/node/${flowId}`,
          method: "GET",
        });

        const items = res?.data || [];

        const mappedNodes: FlowNode[] = items.map((slice, index) => ({
          id: String(slice.id),
          type: "apiStep",
          position: { x: 80 + index * 340, y: 180 },
          data: {
            nodeNumber: slice?.node_order,
            node_title: slice?.node_title,
            node_description: slice?.node_description,
            status: "Not started",
            customFields: [],
          },
        }));

        setFlows((prevFlows) =>
          prevFlows.map((flow) =>
            flow.id === flowId
              ? {
                ...flow,
                nodes: mappedNodes,
                edges: buildFlowEdges(mappedNodes),
              }
              : flow,
          ),
        );
      } catch (error) {
        console.error("fetchNodesSlices error:", error);
      }
    },
    [activeFlowId, buildFlowEdges],
  );

  useEffect(() => {
    if (activeFlowId !== null) {
      fetchNodesSlices(activeFlowId);
    }
  }, [activeFlowId, fetchNodesSlices]);

  // Create Flow handler
  const handleCreateFlow = async (e: FormEvent) => {
    e.preventDefault();
    if (!newFlowName.trim() || !newFlowDesc.trim() || !newFlowTokenKey.trim()) {
      showToast("Flow name, description, and token key are required");
      return;
    }

    try {
      setIsCreatingFlow(true);
      await request({
        url: "/flow",
        method: "POST",
        data: {
          flow_name: newFlowName.trim(),
          flow_description: newFlowDesc.trim(),
          token_key: newFlowTokenKey.trim(),
        },
      });

      showToast("Flow created successfully");
      setIsNewFlowModalOpen(false);
      setNewFlowName("");
      setNewFlowDesc("");
      setNewFlowTokenKey("");
      await fetchFlows();
    } catch (error: any) {
      console.error("Create flow error:", error);
      const msg = error?.response?.data?.message || "Failed to create flow";
      showToast(msg);
    } finally {
      setIsCreatingFlow(false);
    }
  };

  const handleOpenEditFlow = () => {
    if (!activeFlow) return;
    setFlowEditName(activeFlow.flow_name || activeFlow.name || "");
    setFlowEditDesc(
      activeFlow.flow_description || activeFlow.description || "",
    );
    setIsEditingFlowModalOpen(true);
  };

  const handleSaveFlowMeta = async (e: FormEvent) => {
    e.preventDefault();
    if (!flowEditName.trim()) return;
    try {
      const response: any = await request({
        url: `/flow/${activeFlowId}`,
        method: "PATCH",
        data: {
          flow_name: flowEditName.trim(),
          flow_description: flowEditDesc.trim(),
        },
      });
      toast.success("Success", response.message);
      await fetchFlows();
      setIsEditingFlowModalOpen(false);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to update flow";
      toast.error(msg);
    }
    setIsEditingFlowModalOpen(false);
    showToast("Workflow updated");
  };

  // Delete Flow
  const handleDeleteFlow = async () => {
    if (activeFlowId === null) return;
    try {
      await request({
        url: `/flow/${activeFlowId}`,
        method: "DELETE",
      });
      showToast("Workflow deleted");
      setIsDeleteFlowModalOpen(false);
      setSelectedNodeId(null);
      setDraftNode(null);
      await fetchFlows();
    } catch (error) {
      console.error("Delete flow error:", error);
      setFlows((prev) => prev.filter((f) => f.id !== activeFlowId));
      setActiveFlowId((prev) => {
        const remaining = flows.filter((f) => f.id !== activeFlowId);
        return remaining.length > 0 ? remaining[0].id : null;
      });
      setIsDeleteFlowModalOpen(false);
      setSelectedNodeId(null);
      setDraftNode(null);
      showToast("Workflow deleted");
    }
  };

  // Node CRUD Handlers
  const handleNodesChange = useCallback(
    (changes: NodeChange<FlowNode>[]) => {
      updateActiveFlow((flow) => ({
        ...flow,
        nodes: applyNodeChanges(changes, flow?.nodes || []),
      }));
    },
    [updateActiveFlow],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      updateActiveFlow((flow) => ({
        ...flow,
        edges: applyEdgeChanges(changes, flow?.edges || []),
      }));
    },
    [updateActiveFlow],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      updateActiveFlow((flow) => {
        const currentEdges = flow?.edges || [];
        const exists = currentEdges.some(
          (e) =>
            e.source === connection.source && e.target === connection.target,
        );
        if (exists) return flow;

        const hasOutgoingEdge = currentEdges.some(
          (e) => e.source === connection.source,
        );
        if (hasOutgoingEdge) {
          return flow;
        }

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
          edges: [...currentEdges, newEdge],
        };
      });
      showToast("Nodes connected");
    },
    [updateActiveFlow, showToast],
  );

  const handleAddNextNode = useCallback(
    (sourceId: string) => {
      if (!activeFlow) return;

      const currentNodes = activeFlow.nodes || [];
      const sourceNode = currentNodes.find((n) => n.id === sourceId);
      if (!sourceNode) return;

      const hasOutgoingEdge = (activeFlow.edges || []).some(
        (edge) => edge.source === sourceId,
      );
      if (hasOutgoingEdge) {
        showToast("This node already has a next step");
        return;
      }

      setPendingParentNodeId(sourceId);
      setIsNewNodeModalOpen(true);
      showToast("Add the next node details");
    },
    [activeFlow, showToast],
  );

  const handleCreateCustomNode = async (e: FormEvent) => {
    e.preventDefault();

    if (!activeFlowId) {
      showToast("Please select or create a workflow first");
      return;
    }

    const trimmedTitle = newNodeTitle.trim();
    const trimmedDescription = newNodeDescription.trim();

    if (!trimmedTitle || !trimmedDescription) {
      showToast("Node title and description are required");
      return;
    }

    try {
      await request({
        method: "POST",
        url: "/node",
        data: {
          node_title: trimmedTitle,
          node_description: trimmedDescription,
          flow_id: activeFlowId,
        },
      });

      const parentId = pendingParentNodeId;

      if (parentId) {
        updateActiveFlow((flow) => {
          const currentNodes = flow?.nodes || [];
          const currentEdges = flow?.edges || [];
          const sourceNode = currentNodes.find((n) => n.id === parentId);
          if (!sourceNode) return flow;

          const newId = `node-${Date.now()}`;
          const nextStepIndex = currentNodes.length + 1;
          const nextNode: FlowNode = {
            id: newId,
            type: "apiStep",
            position: {
              x: sourceNode.position.x + 320,
              y: sourceNode.position.y,
            },
            data: defaultNodeData(`API ${nextStepIndex}`, nextStepIndex),
          };

          const newEdge: Edge = {
            id: `edge-${parentId}-${newId}`,
            source: parentId,
            target: newId,
            type: "smoothstep",
            animated: true,
            style: { stroke: "#BAFF39", strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#BAFF39" },
          };

          return {
            ...flow,
            nodes: [...currentNodes, nextNode],
            edges: [...currentEdges, newEdge],
          };
        });
      }

      setNewNodeTitle("");
      setNewNodeDescription("");
      setPendingParentNodeId(null);
      setIsNewNodeModalOpen(false);
      showToast(
        parentId ? "Node connected successfully" : "Node created successfully",
      );
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to create node";
      showToast(msg);
      setNewNodeTitle("");
      setNewNodeDescription("");
      setPendingParentNodeId(null);
      setIsNewNodeModalOpen(false);
    }
  };

  const handleDeleteNode = useCallback(
    async (nodeId: string) => {
      try {
        await request({
          url: `/node/${activeFlowId}/${nodeId}`,
          method: "DELETE",
        });
        updateActiveFlow((flow) => ({
          ...flow,
          nodes: (flow?.nodes || []).filter((n) => n.id !== nodeId),
          edges: (flow?.edges || []).filter(
            (e) => e.source !== nodeId && e.target !== nodeId,
          ),
        }));

        if (selectedNodeId === nodeId) {
          setSelectedNodeId(null);
          setDraftNode(null);
        }
        toast.success("Success", "Node Deleted");
      } catch (error: any) {
        toast.error("Error", error?.message);
      }
    },
    [updateActiveFlow, selectedNodeId, activeFlowId],
  );

  // Inspector Panel Selection
  const handleSelectNode = useCallback((node: FlowNode) => {
    setSelectedNodeId(node.id);
    setDraftNode({
      ...node.data,
      nodeNumber: node.data?.nodeNumber,
      label: node.data?.label ?? node.data?.node_title ?? "",
      node_title: node.data?.node_title ?? node.data?.label ?? "",
      description: node.data?.description ?? node.data?.node_description ?? "",
      node_description:
        node.data?.node_description ?? node.data?.description ?? "",
      method: node.data?.method,
      baseUrl: node.data?.baseUrl,
      endpoint: node.data?.endpoint,
      status: node.data?.status ?? "Not started",
      customFields: node.data?.customFields ?? [],
    });
    setTestApiResult(null);
  }, []);

  const handleSaveNodeDetails = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedNodeId || !draftNode) return;

    updateActiveFlow((flow) => ({
      ...flow,
      nodes: (flow?.nodes || []).map((n) =>
        n.id === selectedNodeId
          ? {
            ...n,
            data: {
              ...draftNode,
              status: "Completed",
            },
          }
          : n,
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
      showToast(
        `API test executed: ${result.statusCode} ${result.status === "success" ? "OK" : "ERROR"
        }`,
      );
    } catch {
      showToast("API test failed");
    } finally {
      setIsTestingSingleApi(false);
    }
  };

  // Run Sequential Flow Execution
  const handleRunTest = async () => {
    const nodes = activeFlow?.nodes || [];
    if (isTesting || nodes.length === 0) return;
    setIsTesting(true);
    showToast("Executing API workflow sequence...");

    // Reset all nodes to idle
    updateActiveFlow((flow) => ({
      ...flow,
      nodes: (flow?.nodes || []).map((n) => ({
        ...n,
        data: { ...n.data, executionState: "idle" },
      })),
    }));

    // Sequential execution through dummy service
    await simulateWorkflowExecution(
      nodes,
      (nodeId, state, actualStatus, latencyMs) => {
        updateActiveFlow((flow) => ({
          ...flow,
          nodes: (flow?.nodes || []).map((n) =>
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
              : n,
          ),
        }));
      },
    );

    setIsTesting(false);
    showToast(`Flow passed: ${nodes.length}/${nodes.length} APIs verified`);
  };

  const activeNodeCount = activeFlow?.nodes?.length || 0;
  const activeEdgeCount = activeFlow?.edges?.length || 0;

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
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.6), 0 0 12px var(--neon-lime-glow)",
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
          activeFlowId={activeFlow?.id ?? null}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSelectFlow={(flowId) => {
            setActiveFlowId(flowId);
            setSelectedNodeId(null);
            setDraftNode(null);
          }}
          onCreateFlow={() => {
            setNewFlowName("");
            setNewFlowDesc("");
            setIsNewFlowModalOpen(true);
          }}
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
                <span className="flow-title-text">
                  {activeFlow?.flow_name ||
                    activeFlow?.name ||
                    "No Workflow Selected"}
                </span>
                {activeFlow && (
                  <button
                    type="button"
                    className="action-icon-btn"
                    title="Edit flow name & description"
                    onClick={handleOpenEditFlow}
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>

              <div className="topbar-stats">
                <span className="stat-pill">
                  Nodes: <strong>{activeNodeCount}</strong>
                </span>
                <span className="stat-pill">
                  Connections: <strong>{activeEdgeCount}</strong>
                </span>
              </div>
            </div>

            <div className="topbar-actions">
              <button
                type="button"
                className="btn-primary"
                disabled={isTesting || activeNodeCount === 0}
                onClick={handleRunTest}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: 800,
                  opacity: activeNodeCount === 0 ? 0.45 : 1,
                  cursor: activeNodeCount === 0 ? "not-allowed" : "pointer",
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
                  textAlign: "center",
                  fontSize: "11px",
                  padding: "6px 12px",
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
              const node = activeFlow?.nodes?.find((n) => n.id === nodeId);
              if (node) handleSelectNode(node);
            }}
            onOpenNewNodeModal={() => {
              setPendingParentNodeId(null);
              setIsNewNodeModalOpen(true);
            }}
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
          flowName={
            activeFlow?.flow_name || activeFlow?.name || "this workflow"
          }
          onClose={() => setIsDeleteFlowModalOpen(false)}
          onConfirmDelete={handleDeleteFlow}
        />

        <NewNodeModal
          isOpen={isNewNodeModalOpen}
          title={newNodeTitle}
          description={newNodeDescription}
          onTitleChange={setNewNodeTitle}
          onDescriptionChange={setNewNodeDescription}
          onClose={() => {
            setIsNewNodeModalOpen(false);
            setNewNodeTitle("");
            setNewNodeDescription("");
            setPendingParentNodeId(null);
          }}
          onSubmit={handleCreateCustomNode}
        />

        <CreateNewFlow
          isOpen={isNewFlowModalOpen}
          title={newFlowName}
          description={newFlowDesc}
          tokenKey={newFlowTokenKey}
          isLoading={isCreatingFlow}
          onFlowTitleChange={setNewFlowName}
          onFlowDescriptionChange={setNewFlowDesc}
          onTokenKeyChange={setNewFlowTokenKey}
          onClose={() => {
            setIsNewFlowModalOpen(false);
            setNewFlowName("");
            setNewFlowDesc("");
            setNewFlowTokenKey("");
          }}
          onSubmit={handleCreateFlow}
        />
      </div>
    </ProtectedRoute>
  );
}
