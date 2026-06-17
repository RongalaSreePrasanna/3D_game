import { LEVELS, LevelConfig } from '../types';
import { 
  X, Compass, Shield, Heart, Zap, Sparkles, AlertCircle, Play
} from 'lucide-react';

interface LevelInstructionsModalProps {
  levelId: number;
  onClose: () => void;
  onPlay: () => void;
}

export default function LevelInstructionsModal({ 
  levelId, 
  onClose, 
  onPlay 
}: LevelInstructionsModalProps) {
  const level: LevelConfig = LEVELS.find(l => l.id === levelId) || LEVELS[0];

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full border-4 border-indigo-100 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cute banner color background */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-full transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <span className="bg-white/20 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-widest mb-1.5 inline-block">
            STAGE LEVEL {level.id} PRE-OP
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight leading-tight">
            {level.title}
          </h2>
          <p className="text-xs text-white/90 font-medium">
            AI Concept: <span className="underline decoration-pink-300 decoration-2 font-bold">{level.concept}</span>
          </p>
        </div>

        {/* Instructions Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Objective summary */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              Mission Directive
            </h4>
            <p className="text-sm font-semibold text-slate-700 leading-relaxed">
              {level.description}
            </p>
          </div>

          {/* Quick interactive bullet depending on level mechanics */}
          <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-500" /> Ground Rules & Gameplay Actions:
            </h4>
            
            <ul className="space-y-2 text-xs text-slate-600 font-medium list-disc pl-4 leading-normal">
              {level.id === 1 && (
                <>
                  <li>Control your cute player in the center of the mossy battle grid.</li>
                  <li>Invasion waves of red training-bots are marching toward your base!</li>
                  <li>Your cute AI helper stands next to you. Touch the drifting <strong className="text-indigo-600 font-bold">Concept Runes</strong> (Attack, Defend, Heal, Retreat) to repair its Decision Tree node logic!</li>
                  <li>Once the helper's condition branches are correctly aligned, it will shoot automatic element flares to guard the perimeter perfectly!</li>
                </>
              )}
              {level.id === 2 && (
                <>
                  <li>Hop into your futuristic learning hovercar and accelerate forward!</li>
                  <li>Steer left & right to run over floating <strong className="text-green-600 font-bold">Valid Data Points</strong> while avoiding corrupted obstacles.</li>
                  <li>The AI tracks your collected points in real time to fit a <strong className="text-pink-600 font-bold">Regression Line</strong> across deep space gaps.</li>
                  <li>High precision creates a solid, comfortable neon bridge. High prediction errors trigger a crash, restarting your engine!</li>
                </>
              )}
              {level.id === 3 && (
                <>
                  <li>Explore the alien range battlefield and find groups of unlabeled gray sphere troopers.</li>
                  <li>Step close and activate your <strong className="text-indigo-600 font-bold">clustering ray</strong> to divide them into Red, Green, or Blue teams!</li>
                  <li>Target the glowing Squad Leader (the centroid of each cluster) to dissolve the entire battalion in a beautiful cascade!</li>
                </>
              )}
              {level.id === 4 && (
                <>
                  <li>A security firewall is blocking neural transmission pulses.</li>
                  <li>Collect hovering <strong className="text-indigo-600 font-bold">Energy Nodes</strong> to trigger correct signals in the Input, Hidden, and Output layers.</li>
                  <li>Match the weights to balance activation triggers and charge your mega laser to destroy the training-bugs!</li>
                </>
              )}
              {level.id === 5 && (
                <>
                  <li>Navigate a blocky sandbox city using your self-driving sensor.</li>
                  <li>Scan moving objects. Pedestrians (green targets), obstacle blocks (orange targets), and traffic signals (cyan targets) spawn around you.</li>
                  <li>Verify and trigger the scanner override when identification is correct. High model validation lets you drive automatically without crashing!</li>
                </>
              )}
              {level.id === 6 && (
                <>
                  <li>A sneaky automated pet wants to reach the magical Star, but runs into random tunnels!</li>
                  <li>Place high-reward treats (+10) or hazard warning logs (-10) on the grid tiles.</li>
                  <li>Watch the pet update its Q-learning table values in real time and evolve its sequence vector to clear the stage effortlessly!</li>
                </>
              )}
              {level.id === 7 && (
                <>
                  <li>Survive consecutive rounds against a swarm of evolving balloons.</li>
                  <li>Each round, survivors reproduce of natural selection with randomized mutations (speed increase, defense scales, microscopic sizes).</li>
                  <li>Learn which mutations are most challenging, and pick effective weapon ranges to adapt your strategy to the evolution!</li>
                </>
              )}
              {level.id === 8 && (
                <>
                  <li>Search the encrypted holographic space. Find language vocabulary blocks of various meanings.</li>
                  <li>Sort the words into the correct Sentiment energy basins: positive concepts (glowing blue vortex) vs negative insults (fiery red vortex).</li>
                  <li>De-tokenize and clear the semantic gate blocker.</li>
                </>
              )}
              {level.id === 9 && (
                <>
                  <li>Access the legendary Generative Forge, a creative voxel workbench.</li>
                  <li>Mix different core parameter keys (Fiery, Draconic, Angelic, Ice, Broadsword, Bulwark) and harvest generative energy particles from floating runes.</li>
                  <li>Generate magical weapons that physically morph in shape and scale based on parameter settings to smash target trial dummies!</li>
                </>
              )}
              {level.id === 10 && (
                <>
                  <li>The ultimate test: Duel the supreme Overlord Neurona!</li>
                  <li>The boss is driven by a deep convolutional adaptive controller that monitors your dodges and blocks, automatically altering strategies to corner you.</li>
                  <li>Collect flying "Adversarial Patch" decodes on the floor to disrupt her neural core, opening a vulnerability window, and use all previous skills to survive!</li>
                </>
              )}
            </ul>
          </div>

          {/* Quick visual instruction details */}
          <div className="flex gap-4 items-start p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs text-indigo-950 font-medium">
            <AlertCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-indigo-900 uppercase tracking-wide mb-0.5">Control Guide</p>
              <p>Move character: keyboard arrow keys or <kbd className="bg-white border rounded px-1 font-bold">W</kbd><kbd className="bg-white border rounded px-1 font-bold">A</kbd><kbd className="bg-white border rounded px-1 font-bold">S</kbd><kbd className="bg-white border rounded px-1 font-bold">D</kbd>.</p>
              <p className="mt-1">Action keys: <kbd className="bg-white border rounded px-1 font-bold">Space</kbd> or <kbd className="bg-white border rounded px-1 font-bold">Click</kbd> on targets in appropriate levels.</p>
            </div>
          </div>

          {/* Learning goal */}
          <div className="border-t border-slate-100 pt-4 font-mono text-[11px] text-slate-500">
            📊 <strong className="font-bold text-slate-700">Educational Outcome:</strong> {level.outcome}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Go Back
          </button>
          
          <button
            onClick={onPlay}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-pink-500 hover:opacity-90 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 group cursor-pointer"
          >
            Start Battle!
            <Play className="w-4 h-4 fill-current group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

      </div>
    </div>
  );
}
