export interface AutomatonState {
  id: string;
  name: string;
  x: number;
  y: number;
  isStart: boolean;
  isAccept: boolean;
}

export interface Transition {
  id: string;
  from: string;
  to: string;
  symbols: string[];
}

export type AutomatonMode = "DFA" | "NFA";

export interface AutomatonData {
  states: AutomatonState[];
  transitions: Transition[];
  mode: AutomatonMode;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function epsilonClosure(
  stateIds: Set<string>,
  transitions: Transition[]
): Set<string> {
  const closure = new Set(stateIds);
  const stack = [...stateIds];

  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const t of transitions) {
      if (t.from === current && t.symbols.includes("ε") && !closure.has(t.to)) {
        closure.add(t.to);
        stack.push(t.to);
      }
    }
  }

  return closure;
}

export function getNextStates(
  currentStates: Set<string>,
  symbol: string,
  transitions: Transition[],
  mode: AutomatonMode
): Set<string> {
  const nextStates = new Set<string>();

  for (const stateId of currentStates) {
    for (const t of transitions) {
      if (t.from === stateId && t.symbols.includes(symbol)) {
        nextStates.add(t.to);
      }
    }
  }

  if (mode === "NFA") {
    return epsilonClosure(nextStates, transitions);
  }

  return nextStates;
}

export function simulateStep(
  currentStates: Set<string>,
  symbol: string,
  transitions: Transition[],
  mode: AutomatonMode
): { nextStates: Set<string>; activeTransitions: string[] } {
  const activeTransitions: string[] = [];
  const nextStates = new Set<string>();

  for (const stateId of currentStates) {
    for (const t of transitions) {
      if (t.from === stateId && t.symbols.includes(symbol)) {
        nextStates.add(t.to);
        activeTransitions.push(t.id);
      }
    }
  }

  if (mode === "NFA") {
    const closedStates = epsilonClosure(nextStates, transitions);
    for (const s of closedStates) {
      if (!nextStates.has(s)) {
        // find epsilon transitions that led here
        for (const t of transitions) {
          if (t.symbols.includes("ε") && closedStates.has(t.from) && t.to === s) {
            activeTransitions.push(t.id);
          }
        }
      }
    }
    return { nextStates: closedStates, activeTransitions };
  }

  return { nextStates, activeTransitions };
}

export function isAccepted(
  currentStates: Set<string>,
  states: AutomatonState[]
): boolean {
  for (const stateId of currentStates) {
    const state = states.find((s) => s.id === stateId);
    if (state?.isAccept) return true;
  }
  return false;
}

export function validateDFA(
  states: AutomatonState[],
  transitions: Transition[]
): string[] {
  const errors: string[] = [];
  const startStates = states.filter((s) => s.isStart);

  if (startStates.length !== 1) {
    errors.push("DFA must have exactly one start state.");
  }

  // Check for epsilon transitions
  const epsilonTransitions = transitions.filter((t) =>
    t.symbols.includes("ε")
  );
  if (epsilonTransitions.length > 0) {
    errors.push("DFA cannot have epsilon (ε) transitions.");
  }

  // Check for determinism: each state should have at most one transition per symbol
  for (const state of states) {
    const symbolMap = new Map<string, number>();
    for (const t of transitions) {
      if (t.from === state.id) {
        for (const sym of t.symbols) {
          symbolMap.set(sym, (symbolMap.get(sym) || 0) + 1);
        }
      }
    }
    for (const [sym, count] of symbolMap) {
      if (count > 1) {
        errors.push(
          `State "${state.name}" has ${count} transitions on symbol "${sym}". DFA allows only one.`
        );
      }
    }
  }

  return errors;
}

export function validateNFA(
  states: AutomatonState[]
): string[] {
  const errors: string[] = [];
  const startStates = states.filter((s) => s.isStart);

  if (startStates.length < 1) {
    errors.push("NFA must have at least one start state.");
  }

  return errors;
}

// Preloaded examples
export function getDFAExample(): AutomatonData {
  // DFA that accepts strings ending with "01"
  const q0: AutomatonState = { id: "q0", name: "q0", x: 150, y: 250, isStart: true, isAccept: false };
  const q1: AutomatonState = { id: "q1", name: "q1", x: 400, y: 250, isStart: false, isAccept: false };
  const q2: AutomatonState = { id: "q2", name: "q2", x: 650, y: 250, isStart: false, isAccept: true };

  return {
    states: [q0, q1, q2],
    transitions: [
      { id: "t1", from: "q0", to: "q0", symbols: ["1"] },
      { id: "t2", from: "q0", to: "q1", symbols: ["0"] },
      { id: "t3", from: "q1", to: "q1", symbols: ["0"] },
      { id: "t4", from: "q1", to: "q2", symbols: ["1"] },
      { id: "t5", from: "q2", to: "q0", symbols: ["1"] },
      { id: "t6", from: "q2", to: "q1", symbols: ["0"] },
    ],
    mode: "DFA",
  };
}

export function getNFAExample(): AutomatonData {
  // NFA that accepts strings containing "01"
  const q0: AutomatonState = { id: "q0", name: "q0", x: 150, y: 250, isStart: true, isAccept: false };
  const q1: AutomatonState = { id: "q1", name: "q1", x: 400, y: 250, isStart: false, isAccept: false };
  const q2: AutomatonState = { id: "q2", name: "q2", x: 650, y: 250, isStart: false, isAccept: true };

  return {
    states: [q0, q1, q2],
    transitions: [
      { id: "t1", from: "q0", to: "q0", symbols: ["0", "1"] },
      { id: "t2", from: "q0", to: "q1", symbols: ["0"] },
      { id: "t3", from: "q1", to: "q2", symbols: ["1"] },
      { id: "t4", from: "q2", to: "q2", symbols: ["0", "1"] },
    ],
    mode: "NFA",
  };
}