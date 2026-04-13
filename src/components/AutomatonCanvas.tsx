import { useRef, useState, useCallback, useEffect } from "react";
import {
  AutomatonState,
  Transition,
  AutomatonMode,
} from "@/lib/automaton-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AutomatonCanvasProps {
  states: AutomatonState[];
  transitions: Transition[];
  mode: AutomatonMode;
  currentStates: Set<string>;
  activeTransitions: string[];
  isSimulating: boolean;
  addState: (x: number, y: number) => AutomatonState;
  updateStatePosition: (id: string, x: number, y: number) => void;
  addTransition: (from: string, to: string, symbols: string[]) => void;
  transitionMode: boolean;
  transitionFrom: string | null;
  setTransitionFrom: (id: string | null) => void;
  selectedStateId: string | null;
  setSelectedStateId: (id: string | null) => void;
}

const STATE_RADIUS = 30;

function getTransitionPath(
  from: AutomatonState,
  to: AutomatonState,
  isSelfLoop: boolean,
  offset: number = 0
): { path: string; labelX: number; labelY: number; angle: number } {
  if (isSelfLoop) {
    const cx = from.x;
    const cy = from.y - STATE_RADIUS;
    const r = 20;
    return {
      path: `M ${cx - 10} ${cy - 10} A ${r} ${r} 0 1 1 ${cx + 10} ${cy - 10}`,
      labelX: cx,
      labelY: cy - r - 12,
      angle: 0,
    };
  }

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / dist;
  const ny = dy / dist;

  // Perpendicular offset for curved paths
  const perpX = -ny * (20 + offset * 15);
  const perpY = nx * (20 + offset * 15);

  const midX = (from.x + to.x) / 2 + perpX;
  const midY = (from.y + to.y) / 2 + perpY;

  const startX = from.x + nx * STATE_RADIUS;
  const startY = from.y + ny * STATE_RADIUS;
  const endX = to.x - nx * STATE_RADIUS;
  const endY = to.y - ny * STATE_RADIUS;

  const path = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;

  // Label position at the midpoint of the quadratic curve
  const labelX = (startX + 2 * midX + endX) / 4;
  const labelY = (startY + 2 * midY + endY) / 4;

  const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);

  return { path, labelX, labelY, angle };
}

export function AutomatonCanvas({
  states,
  transitions,
  currentStates,
  activeTransitions,
  isSimulating,
  addState,
  updateStatePosition,
  addTransition,
  transitionMode,
  transitionFrom,
  setTransitionFrom,
  setSelectedStateId,
}: AutomatonCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showTransitionDialog, setShowTransitionDialog] = useState(false);
  const [pendingTransition, setPendingTransition] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const [transitionSymbols, setTransitionSymbols] = useState("");

  const getSVGPoint = useCallback(
    (e: React.MouseEvent) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    []
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isSimulating || transitionMode) return;
      const target = e.target as SVGElement;
      if (target.closest(".state-group")) return;
      const pt = getSVGPoint(e);
      addState(pt.x, pt.y);
    },
    [isSimulating, transitionMode, getSVGPoint, addState]
  );

  const handleStateMouseDown = useCallback(
    (e: React.MouseEvent, stateId: string) => {
      e.stopPropagation();
      if (isSimulating) return;

      if (transitionMode) {
        if (!transitionFrom) {
          setTransitionFrom(stateId);
        } else {
          setPendingTransition({ from: transitionFrom, to: stateId });
          setTransitionSymbols("");
          setShowTransitionDialog(true);
          setTransitionFrom(null);
        }
        return;
      }

      const state = states.find((s) => s.id === stateId);
      if (!state) return;
      const pt = getSVGPoint(e);
      setDragOffset({ x: pt.x - state.x, y: pt.y - state.y });
      setDragging(stateId);
      setSelectedStateId(stateId);
    },
    [
      isSimulating,
      transitionMode,
      transitionFrom,
      setTransitionFrom,
      states,
      getSVGPoint,
      setSelectedStateId,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      const pt = getSVGPoint(e);
      updateStatePosition(dragging, pt.x - dragOffset.x, pt.y - dragOffset.y);
    },
    [dragging, dragOffset, getSVGPoint, updateStatePosition]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handleAddTransition = useCallback(() => {
    if (!pendingTransition || !transitionSymbols.trim()) return;
    const symbols = transitionSymbols
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (symbols.length === 0) return;
    addTransition(pendingTransition.from, pendingTransition.to, symbols);
    setShowTransitionDialog(false);
    setPendingTransition(null);
    setTransitionSymbols("");
  }, [pendingTransition, transitionSymbols, addTransition]);

  // Track reverse transitions for offset
  const transitionPairCount = useCallback(
    (fromId: string, toId: string) => {
      return transitions.filter(
        (t) =>
          (t.from === toId && t.to === fromId)
      ).length;
    },
    [transitions]
  );

  // Handle keyboard for dialog
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowTransitionDialog(false);
        setPendingTransition(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <svg
        ref={svgRef}
        className="w-full h-full bg-slate-50"
        onDoubleClick={handleDoubleClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#64748B" />
          </marker>
          <marker
            id="arrowhead-active"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#F59E0B" />
          </marker>
        </defs>

        {/* Grid pattern */}
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Transitions */}
        {transitions.map((t) => {
          const from = states.find((s) => s.id === t.from);
          const to = states.find((s) => s.id === t.to);
          if (!from || !to) return null;

          const isSelfLoop = t.from === t.to;
          const hasReverse = transitionPairCount(t.from, t.to);
          const offset = hasReverse > 0 ? 1 : 0;
          const { path, labelX, labelY } = getTransitionPath(
            from,
            to,
            isSelfLoop,
            offset
          );
          const isActive = activeTransitions.includes(t.id);

          return (
            <g key={t.id}>
              <path
                d={path}
                fill="none"
                stroke={isActive ? "#F59E0B" : "#64748B"}
                strokeWidth={isActive ? 3 : 2}
                markerEnd={
                  isActive ? "url(#arrowhead-active)" : "url(#arrowhead)"
                }
                className="transition-all duration-300"
              />
              <rect
                x={labelX - 14}
                y={labelY - 10}
                width={28}
                height={20}
                rx={4}
                fill={isActive ? "#FEF3C7" : "#F1F5F9"}
                stroke={isActive ? "#F59E0B" : "#CBD5E1"}
                strokeWidth={1}
              />
              <text
                x={labelX}
                y={labelY + 4}
                textAnchor="middle"
                className="text-xs font-mono font-bold select-none"
                fill={isActive ? "#92400E" : "#475569"}
              >
                {t.symbols.join(",")}
              </text>
            </g>
          );
        })}

        {/* Start state arrows */}
        {states
          .filter((s) => s.isStart)
          .map((s) => (
            <g key={`start-${s.id}`}>
              <line
                x1={s.x - STATE_RADIUS - 40}
                y1={s.y}
                x2={s.x - STATE_RADIUS - 2}
                y2={s.y}
                stroke="#3B82F6"
                strokeWidth={2}
                markerEnd="url(#arrowhead)"
              />
              <text
                x={s.x - STATE_RADIUS - 50}
                y={s.y - 8}
                textAnchor="middle"
                className="text-[10px] font-semibold select-none"
                fill="#3B82F6"
              >
                start
              </text>
            </g>
          ))}

        {/* States */}
        {states.map((s) => {
          const isCurrent = currentStates.has(s.id);
          const isHighlighted = isCurrent && isSimulating;

          return (
            <g
              key={s.id}
              className="state-group cursor-pointer"
              onMouseDown={(e) => handleStateMouseDown(e, s.id)}
            >
              {/* Glow effect for active state */}
              {isHighlighted && (
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={STATE_RADIUS + 8}
                  fill="none"
                  stroke="#FCD34D"
                  strokeWidth={3}
                  opacity={0.6}
                  className="animate-pulse"
                />
              )}

              {/* Accept state double circle */}
              {s.isAccept && (
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={STATE_RADIUS + 5}
                  fill="none"
                  stroke={isHighlighted ? "#FCD34D" : "#34D399"}
                  strokeWidth={2}
                />
              )}

              {/* Main circle */}
              <circle
                cx={s.x}
                cy={s.y}
                r={STATE_RADIUS}
                fill={
                  isHighlighted
                    ? "#FEF3C7"
                    : s.isAccept
                    ? "#D1FAE5"
                    : "#F1F5F9"
                }
                stroke={
                  isHighlighted
                    ? "#F59E0B"
                    : s.isAccept
                    ? "#34D399"
                    : s.isStart
                    ? "#3B82F6"
                    : "#94A3B8"
                }
                strokeWidth={isHighlighted ? 3 : 2}
                className="transition-all duration-300"
              />

              {/* State label */}
              <text
                x={s.x}
                y={s.y + 5}
                textAnchor="middle"
                className="text-sm font-semibold select-none pointer-events-none"
                fill={isHighlighted ? "#92400E" : "#1E293B"}
              >
                {s.name}
              </text>
            </g>
          );
        })}

        {/* Transition mode indicator line */}
        {transitionMode && transitionFrom && (
          <circle
            cx={states.find((s) => s.id === transitionFrom)?.x || 0}
            cy={states.find((s) => s.id === transitionFrom)?.y || 0}
            r={STATE_RADIUS + 4}
            fill="none"
            stroke="#6366F1"
            strokeWidth={2}
            strokeDasharray="5,5"
            className="animate-pulse"
          />
        )}

        {/* Empty state hint */}
        {states.length === 0 && (
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-lg select-none"
            fill="#94A3B8"
          >
            Double-click to add a state
          </text>
        )}
      </svg>

      {/* Transition Symbol Dialog */}
      <Dialog
        open={showTransitionDialog}
        onOpenChange={setShowTransitionDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Transition</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              From{" "}
              <strong>
                {states.find((s) => s.id === pendingTransition?.from)?.name}
              </strong>{" "}
              to{" "}
              <strong>
                {states.find((s) => s.id === pendingTransition?.to)?.name}
              </strong>
            </div>
            <div className="space-y-1">
              <Label>Symbols (comma-separated)</Label>
              <Input
                value={transitionSymbols}
                onChange={(e) => setTransitionSymbols(e.target.value)}
                placeholder="e.g., 0, 1 or ε"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTransition();
                }}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Use ε for epsilon transitions (NFA only)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTransitionDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddTransition}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}