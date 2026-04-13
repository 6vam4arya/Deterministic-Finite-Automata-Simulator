import { useState, useCallback, useRef, useEffect } from "react";
import {
  AutomatonState,
  Transition,
  AutomatonMode,
  simulateStep,
  isAccepted,
  epsilonClosure,
} from "@/lib/automaton-utils";

export type SimulationStatus = "idle" | "running" | "paused" | "finished";

export function useSimulation(
  states: AutomatonState[],
  transitions: Transition[],
  mode: AutomatonMode
) {
  const [inputString, setInputString] = useState("");
  const [currentStep, setCurrentStep] = useState(-1);
  const [currentStates, setCurrentStates] = useState<Set<string>>(new Set());
  const [activeTransitions, setActiveTransitions] = useState<string[]>([]);
  const [status, setStatus] = useState<SimulationStatus>("idle");
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [speed, setSpeed] = useState(1000); // ms per step
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback(() => {
    setCurrentStep(-1);
    setCurrentStates(new Set());
    setActiveTransitions([]);
    setStatus("idle");
    setAccepted(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const initialize = useCallback(() => {
    const startStates = states.filter((s) => s.isStart).map((s) => s.id);
    let initial = new Set(startStates);
    if (mode === "NFA") {
      initial = epsilonClosure(initial, transitions);
    }
    setCurrentStates(initial);
    setCurrentStep(0);
    setActiveTransitions([]);
    setAccepted(null);
    setStatus("paused");
  }, [states, transitions, mode]);

  const stepForward = useCallback(() => {
    if (currentStep < 0) return;
    if (currentStep >= inputString.length) {
      // Simulation complete
      const result = isAccepted(currentStates, states);
      setAccepted(result);
      setStatus("finished");
      setActiveTransitions([]);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const symbol = inputString[currentStep];
    const { nextStates, activeTransitions: activeTrans } = simulateStep(
      currentStates,
      symbol,
      transitions,
      mode
    );

    setActiveTransitions(activeTrans);
    setCurrentStates(nextStates);
    setCurrentStep((prev) => prev + 1);

    // Check if this was the last symbol
    if (currentStep + 1 >= inputString.length) {
      const result = isAccepted(nextStates, states);
      setAccepted(result);
      setStatus("finished");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [currentStep, inputString, currentStates, transitions, mode, states]);

  const play = useCallback(() => {
    if (status === "idle") {
      initialize();
      setStatus("running");
    } else {
      setStatus("running");
    }
  }, [status, initialize]);

  const pause = useCallback(() => {
    setStatus("paused");
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Auto-step when running
  useEffect(() => {
    if (status === "running") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        stepForward();
      }, speed);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, speed, stepForward]);

  const startSimulation = useCallback(() => {
    initialize();
    setStatus("running");
  }, [initialize]);

  const stepOnce = useCallback(() => {
    if (status === "idle") {
      initialize();
      // After initialize, we need to wait for state to update
      // So we set a flag to step on next render
      setStatus("paused");
      return;
    }
    stepForward();
  }, [status, initialize, stepForward]);

  return {
    inputString,
    setInputString,
    currentStep,
    currentStates,
    activeTransitions,
    status,
    accepted,
    speed,
    setSpeed,
    play,
    pause,
    reset,
    stepOnce,
    startSimulation,
    stepForward,
    initialize,
  };
}