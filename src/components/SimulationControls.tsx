import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Zap,
} from "lucide-react";
import { SimulationStatus } from "@/hooks/useSimulation";

interface SimulationControlsProps {
  inputString: string;
  setInputString: (s: string) => void;
  currentStep: number;
  status: SimulationStatus;
  accepted: boolean | null;
  speed: number;
  setSpeed: (s: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onStep: () => void;
  onStart: () => void;
}

export function SimulationControls({
  inputString,
  setInputString,
  currentStep,
  status,
  accepted,
  speed,
  setSpeed,
  onPlay,
  onPause,
  onReset,
  onStep,
  onStart,
}: SimulationControlsProps) {
  const isRunning = status === "running";
  const isFinished = status === "finished";
  const isIdle = status === "idle";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-300">
          Input String
        </Label>
        <div className="flex gap-2">
          <Input
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            placeholder="e.g., 0101"
            disabled={!isIdle}
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          />
          {isIdle && (
            <Button
              onClick={onStart}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
              disabled={inputString.length === 0}
            >
              <Zap className="w-4 h-4 mr-1" />
              Run
            </Button>
          )}
        </div>
      </div>

      {/* Input string visualization */}
      {!isIdle && inputString.length > 0 && (
        <div className="space-y-1">
          <Label className="text-xs text-slate-400">Processing</Label>
          <div className="flex gap-1 flex-wrap p-2 bg-slate-700/50 rounded-md">
            {inputString.split("").map((char, i) => (
              <span
                key={i}
                className={`w-8 h-8 flex items-center justify-center rounded text-sm font-mono font-bold transition-all duration-300 ${
                  i < currentStep
                    ? "bg-slate-600 text-slate-400"
                    : i === currentStep && !isFinished
                    ? "bg-amber-500 text-slate-900 scale-110 shadow-lg shadow-amber-500/30"
                    : "bg-slate-700 text-slate-300"
                }`}
              >
                {char}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Playback controls */}
      {!isIdle && (
        <div className="flex items-center gap-2">
          {isRunning ? (
            <Button
              onClick={onPause}
              size="sm"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <Pause className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={onPlay}
              size="sm"
              disabled={isFinished}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Play className="w-4 h-4" />
            </Button>
          )}
          <Button
            onClick={onStep}
            size="sm"
            variant="outline"
            disabled={isFinished || isRunning}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          <Button
            onClick={onReset}
            size="sm"
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Speed control */}
      {!isIdle && (
        <div className="space-y-1">
          <Label className="text-xs text-slate-400">
            Speed: {speed}ms/step
          </Label>
          <Slider
            value={[speed]}
            onValueChange={([v]) => setSpeed(v)}
            min={200}
            max={2000}
            step={100}
            className="w-full"
          />
        </div>
      )}

      {/* Result */}
      {isFinished && accepted !== null && (
        <div
          className={`p-4 rounded-lg text-center font-bold text-lg animate-in fade-in zoom-in duration-500 ${
            accepted
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {accepted ? "✓ ACCEPTED" : "✗ REJECTED"}
        </div>
      )}

      {/* Step info */}
      {!isIdle && (
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="border-slate-600 text-slate-300">
            Step: {currentStep} / {inputString.length}
          </Badge>
        </div>
      )}
    </div>
  );
}