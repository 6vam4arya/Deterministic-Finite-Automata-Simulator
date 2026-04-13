import { useState } from "react";
import { useAutomaton } from "@/hooks/useAutomaton";
import { useSimulation } from "@/hooks/useSimulation";
import { ControlPanel } from "@/components/ControlPanel";
import { AutomatonCanvas } from "@/components/AutomatonCanvas";

export default function Index() {
  const automaton = useAutomaton();
  const simulation = useSimulation(
    automaton.states,
    automaton.transitions,
    automaton.mode
  );

  const [transitionMode, setTransitionMode] = useState(false);
  const [transitionFrom, setTransitionFrom] = useState<string | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);

  const isSimulating = simulation.status !== "idle";

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left Panel */}
      <ControlPanel
        states={automaton.states}
        transitions={automaton.transitions}
        mode={automaton.mode}
        setMode={automaton.setMode}
        toggleStart={automaton.toggleStart}
        toggleAccept={automaton.toggleAccept}
        deleteState={automaton.deleteState}
        removeTransition={automaton.removeTransition}
        clearAll={automaton.clearAll}
        loadAutomaton={automaton.loadAutomaton}
        inputString={simulation.inputString}
        setInputString={simulation.setInputString}
        currentStep={simulation.currentStep}
        simStatus={simulation.status}
        accepted={simulation.accepted}
        speed={simulation.speed}
        setSpeed={simulation.setSpeed}
        onPlay={simulation.play}
        onPause={simulation.pause}
        onReset={simulation.reset}
        onStep={simulation.stepOnce}
        onStart={simulation.startSimulation}
        selectedStateId={selectedStateId}
        transitionMode={transitionMode}
        setTransitionMode={setTransitionMode}
        transitionFrom={transitionFrom}
      />

      {/* Canvas Area */}
      <div className="flex-1 relative">
        <AutomatonCanvas
          states={automaton.states}
          transitions={automaton.transitions}
          mode={automaton.mode}
          currentStates={simulation.currentStates}
          activeTransitions={simulation.activeTransitions}
          isSimulating={isSimulating}
          addState={automaton.addState}
          updateStatePosition={automaton.updateStatePosition}
          addTransition={automaton.addTransition}
          transitionMode={transitionMode}
          transitionFrom={transitionFrom}
          setTransitionFrom={setTransitionFrom}
          selectedStateId={selectedStateId}
          setSelectedStateId={setSelectedStateId}
        />

        {/* Mode badge */}
        <div className="absolute top-4 right-4 px-3 py-1.5 bg-indigo-600 text-white text-sm font-bold rounded-full shadow-lg">
          {automaton.mode}
        </div>
      </div>
    </div>
  );
}