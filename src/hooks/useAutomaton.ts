import { useState, useCallback } from "react";
import {
  AutomatonState,
  Transition,
  AutomatonMode,
  generateId,
} from "@/lib/automaton-utils";

export function useAutomaton() {
  const [states, setStates] = useState<AutomatonState[]>([]);
  const [transitions, setTransitions] = useState<Transition[]>([]);
  const [mode, setMode] = useState<AutomatonMode>("DFA");

  const addState = useCallback(
    (x: number, y: number) => {
      const index = states.length;
      const name = `q${index}`;
      const id = generateId();
      const isStart = states.length === 0;
      const newState: AutomatonState = {
        id,
        name,
        x,
        y,
        isStart: isStart,
        isAccept: false,
      };
      setStates((prev) => [...prev, newState]);
      return newState;
    },
    [states.length]
  );

  const updateStatePosition = useCallback((id: string, x: number, y: number) => {
    setStates((prev) =>
      prev.map((s) => (s.id === id ? { ...s, x, y } : s))
    );
  }, []);

  const toggleStart = useCallback((id: string) => {
    setStates((prev) =>
      prev.map((s) => {
        if (s.id === id) return { ...s, isStart: !s.isStart };
        // For DFA, only one start state
        return s;
      })
    );
  }, []);

  const toggleAccept = useCallback((id: string) => {
    setStates((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isAccept: !s.isAccept } : s))
    );
  }, []);

  const renameState = useCallback((id: string, name: string) => {
    setStates((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name } : s))
    );
  }, []);

  const deleteState = useCallback(
    (id: string) => {
      setStates((prev) => prev.filter((s) => s.id !== id));
      setTransitions((prev) =>
        prev.filter((t) => t.from !== id && t.to !== id)
      );
    },
    []
  );

  const addTransition = useCallback(
    (from: string, to: string, symbols: string[]) => {
      // Check if transition between these states already exists
      const existing = transitions.find(
        (t) => t.from === from && t.to === to
      );
      if (existing) {
        // Merge symbols
        const newSymbols = [...new Set([...existing.symbols, ...symbols])];
        setTransitions((prev) =>
          prev.map((t) =>
            t.id === existing.id ? { ...t, symbols: newSymbols } : t
          )
        );
        return;
      }

      const id = generateId();
      const newTransition: Transition = { id, from, to, symbols };
      setTransitions((prev) => [...prev, newTransition]);
    },
    [transitions]
  );

  const removeTransition = useCallback((id: string) => {
    setTransitions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setStates([]);
    setTransitions([]);
  }, []);

  const loadAutomaton = useCallback(
    (
      newStates: AutomatonState[],
      newTransitions: Transition[],
      newMode: AutomatonMode
    ) => {
      setStates(newStates);
      setTransitions(newTransitions);
      setMode(newMode);
    },
    []
  );

  return {
    states,
    transitions,
    mode,
    setMode,
    addState,
    updateStatePosition,
    toggleStart,
    toggleAccept,
    renameState,
    deleteState,
    addTransition,
    removeTransition,
    clearAll,
    loadAutomaton,
  };
}