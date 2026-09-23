"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Connection,
  EdgeChange,
  NodeChange,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Plus, LayoutGrid, Maximize2, Play, Layers } from "lucide-react";
import { FlowNode, SavedFlow } from "@/app/types/flow";
import { SingleNode } from "./SingleNode";
import { calculateAutoLayout } from "@/app/services/flowSimulationService";

const nodeTypes = {
  apiStep: SingleNode,
};

interface FlowCanvasContentProps {
  activeFlow: SavedFlow | null;
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
}

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
}: FlowCanvasContentProps) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const nodeCount = activeFlow?.nodes?.length || 0;

  const canvasNodes = useMemo(() => {
    if (!activeFlow?.nodes || activeFlow.nodes.length === 0) return [];

    return activeFlow.nodes.map((node, index) => ({
      ...node,
      type: node.type ?? "apiStep",
      position: node.position ?? { x: 0, y: 0 },
      data: {
        ...node.data,
        onAddNext: onAddNextNode,
        onDelete: onDeleteNode,
        onEdit: onEditNode,
        stepIndex: index + 1,
        hasNextNode: (activeFlow?.edges || []).some((edge) => edge.source === node.id),
      },
      selected: node.id === selectedNodeId,
    }));
  }, [activeFlow, onAddNextNode, onDeleteNode, onEditNode, selectedNodeId]);

  // Clean auto-layout algorithm for nodes
  const autoLayoutNodes = useCallback(() => {
    if (!activeFlow?.nodes || activeFlow.nodes.length === 0) return;
    const changes = calculateAutoLayout(activeFlow.nodes);
    onNodesChange(changes);
    setTimeout(() => {
      fitView({ padding: 0.25, duration: 400 });
    }, 50);
  }, [activeFlow, onNodesChange, fitView]);

  // Automatically fit nodes into view when flow changes
  useEffect(() => {
    if (nodeCount > 0) {
      const timer = setTimeout(() => {
        fitView({ padding: 0.2, duration: 300 });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeFlow?.id, nodeCount, fitView]);

  return (
    <div className="relative w-full h-full">
      {/* Floating Canvas Toolbar */}
      <div className="floating-toolbar">
        <button
          type="button"
          className="canvas-tool-btn primary"
          onClick={onOpenNewNodeModal}
          disabled={!activeFlow}
          title="Add a new node to the canvas"
        >
          <Plus size={14} />
          <span>Add Node</span>
        </button>

        <div className="toolbar-divider" />

        <button
          type="button"
          className="canvas-tool-btn"
          onClick={autoLayoutNodes}
          disabled={nodeCount === 0}
          title="Auto arrange nodes"
        >
          <LayoutGrid size={14} />
          <span>Auto Layout</span>
        </button>

        <button
          type="button"
          className="canvas-tool-btn"
          onClick={() => fitView({ padding: 0.2, duration: 300 })}
          title="Fit view"
        >
          <Maximize2 size={14} />
          <span>Fit View</span>
        </button>

        <button
          type="button"
          className="canvas-tool-btn"
          onClick={() => zoomIn({ duration: 200 })}
          title="Zoom In"
        >
          +
        </button>

        <button
          type="button"
          className="canvas-tool-btn"
          onClick={() => zoomOut({ duration: 200 })}
          title="Zoom Out"
        >
          -
        </button>

        <div className="toolbar-divider" />

        <button
          type="button"
          className={`canvas-tool-btn ${isTesting ? "opacity-75 cursor-wait" : ""}`}
          onClick={onRunTest}
          disabled={isTesting || nodeCount === 0}
          title="Simulate sequential workflow execution"
          style={{
            background: isTesting
              ? "rgba(186, 255, 57, 0.15)"
              : "var(--neon-lime)",
            color: "var(--neon-lime-dark)",
            fontWeight: 800,
            boxShadow: isTesting ? "none" : "0 0 14px var(--neon-lime-glow)",
            cursor: isTesting || nodeCount === 0 ? "not-allowed" : "pointer",
            opacity: nodeCount === 0 ? 0.45 : 1,
          }}
        >
          <Play size={13} fill={isTesting ? "none" : "var(--neon-lime-dark)"} />
          <span>{isTesting ? "Executing..." : "Run Flow"}</span>
        </button>
      </div>

      {/* Main ReactFlow Graph Canvas */}
      <ReactFlow
        nodes={canvasNodes}
        edges={activeFlow?.edges || []}
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
      {nodeCount === 0 && (
        <div className="empty-canvas-state">
          <div className="empty-canvas-icon">
            <Layers size={28} />
          </div>
          <h3>Canvas is ready</h3>
          <p>
            {activeFlow
              ? "Start building your orchestration pipeline by adding your first trigger or API node."
              : "No workflow selected. Select or create a workflow to begin."}
          </p>
          {activeFlow && (
            <button
              type="button"
              className="btn-primary"
              onClick={onOpenNewNodeModal}
            >
              <Plus size={14} className="inline mr-1" /> Add Starting Node
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function FlowCanvas(props: FlowCanvasContentProps) {
  return (
    <div className="relative flex-1 w-full h-full overflow-hidden">
      <ReactFlowProvider>
        <FlowCanvasContent {...props} />
      </ReactFlowProvider>
    </div>
  );
}

export default FlowCanvas;
