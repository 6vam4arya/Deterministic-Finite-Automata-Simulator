import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Trash2,
  Star,
  CircleDot,
  ArrowRight,
  Download,
  RotateCcw,
} from "lucide-react";
import {
  AutomatonState,
  Transition,
  AutomatonMode,
  getDFAExample,
  getNFAExample,
  validateDFA,
  validateNFA,
} from "@/lib/automaton-utils";
import { SimulationControls } from "@/components/SimulationControls";
import { SimulationStatus } from "@/hooks/useSimulation";

interface ControlPanelProps {
  states: AutomatonState[];
  transitions: Transition[];
  mode: AutomatonMode;
  setMode: (m: AutomatonMode) => void;
  toggleStart: (id: string) => void;
  toggleAccept: (id: string) => void;
  deleteState: (id: string) => void;
  removeTransition: (id: string) => void;
  clearAll: () => void;
  loadAutomaton: (
    s: AutomatonState[],
    t: Transition[],
    m: AutomatonMode
  ) => void;
  // Simulation props
  inputString: string;
  setInputString: (s: string) => void;
  currentStep: number;
  simStatus: SimulationStatus;
  accepted: boolean | null;
  speed: number;
  setSpeed: (s: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onStep: () => void;
  onStart: () => void;
  selectedStateId: string | null;
  transitionMode: boolean;
  setTransitionMode: (b: boolean) => void;
  transitionFrom: string | null;
}

export function ControlPanel({
  states,
  transitions,
  mode,
  setMode,
  toggleStart,
  toggleAccept,
  deleteState,
  removeTransition,
  clearAll,
  loadAutomaton,
  inputString,
  setInputString,
  currentStep,
  simStatus,
  accepted,
  speed,
  setSpeed,
  onPlay,
  onPause,
  onReset,
  onStep,
  onStart,
  transitionMode,
  setTransitionMode,
  transitionFrom,
}: ControlPanelProps) {
  const isSimulating = simStatus !== "idle";

  const errors =
    mode === "DFA"
      ? validateDFA(states, transitions)
      : validateNFA(states);

  const handleLoadExample = (type: "DFA" | "NFA") => {
    const example = type === "DFA" ? getDFAExample() : getNFAExample();
    loadAutomaton(example.states, example.transitions, example.mode);
    onReset();
  };

  return (
    <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <CircleDot className="w-5 h-5 text-indigo-400" />
          Automaton Simulator
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Design & simulate DFA/NFA
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          {/* Mode Toggle */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-300">Mode</Label>
            <div className="flex items-center gap-3 p-2 bg-slate-700/50 rounded-lg">
              <span
                className={`text-sm font-medium ${
                  mode === "DFA" ? "text-indigo-400" : "text-slate-400"
                }`}
              >
                DFA
              </span>
              <Switch
                checked={mode === "NFA"}
                onCheckedChange={(checked) => {
                  setMode(checked ? "NFA" : "DFA");
                  onReset();
                }}
                disabled={isSimulating}
              />
              <span
                className={`text-sm font-medium ${
                  mode === "NFA" ? "text-indigo-400" : "text-slate-400"
                }`}
              >
                NFA
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-1 p-3 bg-slate-700/30 rounded-lg">
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">Double-click</strong> canvas to add state
            </p>
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">Drag</strong> states to reposition
            </p>
            <p className="text-xs text-slate-400">
              Enable <strong className="text-slate-300">Transition Mode</strong> then click two states
            </p>
            <p className="text-xs text-slate-400">
              Click <strong className="text-blue-400">→</strong> to toggle <strong className="text-blue-400">start</strong> state
            </p>
            <p className="text-xs text-slate-400">
              Click <strong className="text-emerald-400">★</strong> to toggle <strong className="text-emerald-400">final/accept</strong> state
            </p>
          </div>

          {/* Transition Mode Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-slate-300">
                Transition Mode
              </Label>
              <Switch
                checked={transitionMode}
                onCheckedChange={setTransitionMode}
                disabled={isSimulating}
              />
            </div>
            {transitionMode && (
              <p className="text-xs text-amber-400">
                {transitionFrom
                  ? `Click target state (from: ${
                      states.find((s) => s.id === transitionFrom)?.name
                    })`
                  : "Click source state first"}
              </p>
            )}
          </div>

          <Separator className="bg-slate-700" />

          {/* States List */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-300">
              States ({states.length})
            </Label>
            {states.length === 0 ? (
              <p className="text-xs text-slate-500">
                No states yet. Double-click canvas to add.
              </p>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {states.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2 bg-slate-700/50 rounded-md text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{s.name}</span>
                      {s.isStart && (
                        <Badge className="bg-blue-500/20 text-blue-400 text-[10px] px-1">
                          start
                        </Badge>
                      )}
                      {s.isAccept && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1">
                          final
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-blue-400 hover:text-blue-300 hover:bg-slate-600"
                        onClick={() => toggleStart(s.id)}
                        disabled={isSimulating}
                        title="Toggle start"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-emerald-400 hover:text-emerald-300 hover:bg-slate-600"
                        onClick={() => toggleAccept(s.id)}
                        disabled={isSimulating}
                        title="Toggle final/accept state"
                      >
                        <Star className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-slate-600"
                        onClick={() => deleteState(s.id)}
                        disabled={isSimulating}
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transitions List */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-300">
              Transitions ({transitions.length})
            </Label>
            {transitions.length === 0 ? (
              <p className="text-xs text-slate-500">No transitions yet.</p>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {transitions.map((t) => {
                  const fromState = states.find((s) => s.id === t.from);
                  const toState = states.find((s) => s.id === t.to);
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2 bg-slate-700/50 rounded-md text-sm"
                    >
                      <span className="text-slate-300">
                        {fromState?.name || "?"} →{" "}
                        {toState?.name || "?"} :{" "}
                        <span className="text-indigo-400 font-mono">
                          {t.symbols.join(", ")}
                        </span>
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-slate-600"
                        onClick={() => removeTransition(t.id)}
                        disabled={isSimulating}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Validation Errors */}
          {errors.length > 0 && (
            <div className="space-y-1 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <Label className="text-xs font-semibold text-red-400">
                Validation Issues
              </Label>
              {errors.map((e, i) => (
                <p key={i} className="text-xs text-red-300">
                  • {e}
                </p>
              ))}
            </div>
          )}

          <Separator className="bg-slate-700" />

          {/* Simulation */}
          <SimulationControls
            inputString={inputString}
            setInputString={setInputString}
            currentStep={currentStep}
            status={simStatus}
            accepted={accepted}
            speed={speed}
            setSpeed={setSpeed}
            onPlay={onPlay}
            onPause={onPause}
            onReset={onReset}
            onStep={onStep}
            onStart={onStart}
          />

          <Separator className="bg-slate-700" />

          {/* Examples & Clear */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-300">
              Examples
            </Label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                onClick={() => handleLoadExample("DFA")}
                disabled={isSimulating}
              >
                <Download className="w-3 h-3 mr-1" />
                DFA
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                onClick={() => handleLoadExample("NFA")}
                disabled={isSimulating}
              >
                <Download className="w-3 h-3 mr-1" />
                NFA
              </Button>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={() => {
                clearAll();
                onReset();
              }}
              disabled={isSimulating}
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}