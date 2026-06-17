/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { LevelController } from '../levels/LevelController';
import { AvatarConfig, LEVELS as LEVEL_CONFIGS } from '../types';
import { AI_LEVEL_QUESTIONS } from '../questions';
import { 
  ArrowLeft, RefreshCw, Zap, Heart, Trophy, 
  HelpCircle, Star, Sparkles, Play, CheckCircle, XCircle, ChevronRight, HelpCircle as QuestionIcon
} from 'lucide-react';

interface GameCanvasProps {
  levelId: number;
  avatar: AvatarConfig;
  onExit: () => void;
  onCompleteLevel: (levelId: number, stars: number, playNext?: boolean) => void;
}

export default function GameCanvas({ 
  levelId, 
  avatar, 
  onExit, 
  onCompleteLevel 
}: GameCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<LevelController | null>(null);

  // Core Game State tracking
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [coinsTarget, setCoinsTarget] = useState(5);
  const [health, setHealth] = useState(100);
  const [statusMessage, setStatusMessage] = useState('Booting Forest Platformer...');
  const [showWinScreen, setShowWinScreen] = useState(false);
  const [showLossScreen, setShowLossScreen] = useState(false);
  const [lossReason, setLossReason] = useState('');
  const [starsEarned, setStarsEarned] = useState(3);

  // Quiz Overlay state variables
  const [activeQuizBlockIndex, setActiveQuizBlockIndex] = useState<number | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(false);
  const [solvedBlocks, setSolvedBlocks] = useState<boolean[]>([false, false, false]);

  const levelConfig = LEVEL_CONFIGS.find(l => l.id === levelId) || LEVEL_CONFIGS[0];
  const levelQuestions = AI_LEVEL_QUESTIONS[levelId] || [];

  const showWinScreenRef = useRef(showWinScreen);
  const showLossScreenRef = useRef(showLossScreen);
  const activeQuizBlockIndexRef = useRef(activeQuizBlockIndex);

  // Sync state to refs immediately during render
  showWinScreenRef.current = showWinScreen;
  showLossScreenRef.current = showLossScreen;
  activeQuizBlockIndexRef.current = activeQuizBlockIndex;

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    // SCENE, CAMERA & RENDERER INITIAL SETUP
    const scene = new THREE.Scene();
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 1000);
    camera.position.set(0, 5, -8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Keyboard controls listeners
    const inputs = { forward: false, backward: false, left: false, right: false, space: false };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') inputs.forward = true;
      if (key === 's' || key === 'arrowdown') inputs.backward = true;
      if (key === 'a' || key === 'arrowleft') inputs.left = true;
      if (key === 'd' || key === 'arrowright') inputs.right = true;
      if (key === ' ') {
        inputs.space = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') inputs.forward = false;
      if (key === 's' || key === 'arrowdown') inputs.backward = false;
      if (key === 'a' || key === 'arrowleft') inputs.left = false;
      if (key === 'd' || key === 'arrowright') inputs.right = false;
      if (key === ' ') inputs.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Dynamic callbacks sent to the physical controller
    const callbacks = {
      onScoreChange: (currentCoins: number, targetCoins: number) => {
        setCoinsCollected(currentCoins);
        setCoinsTarget(targetCoins);
      },
      onStatusMessage: (msg: string) => {
        setStatusMessage(msg);
      },
      onComplete: (stars: number) => {
        setStarsEarned(stars);
        setShowWinScreen(true);
      },
      onFail: (reason: string) => {
        setLossReason(reason);
        setShowLossScreen(true);
      },
      onHitQuestionBlock: (blockIndex: number) => {
        // Triggered when character bumps an unsolved (?) block
        setActiveQuizBlockIndex(blockIndex);
        setSelectedOptionIndex(null);
        setQuizSubmitted(false);
        setQuizCorrect(false);
      }
    };

    const controller = new LevelController(levelId, scene, camera, avatar, callbacks);
    controllerRef.current = controller;

    // Standard clock timeline ticks
    const clock = new THREE.Clock();
    let animateId: number;

    const renderTick = () => {
      animateId = requestAnimationFrame(renderTick);
      const delta = Math.min(clock.getDelta(), 0.08); // cap lag drops

      if (!showWinScreenRef.current && !showLossScreenRef.current && activeQuizBlockIndexRef.current === null) {
        controller.isPaused = false;
        controller.update(delta, inputs);
        setHealth(Math.round(controller.health));
      } else {
        controller.isPaused = true;
      }

      renderer.render(scene, camera);
    };

    renderTick();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animateId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      try {
        container.removeChild(renderer.domElement);
      } catch (err) {}
    };
  }, [levelId, avatar]);

  // Restart trigger handler
  const handleRestartLevel = () => {
    setShowWinScreen(false);
    setShowLossScreen(false);
    setCoinsCollected(0);
    setHealth(100);
    setActiveQuizBlockIndex(null);
    setSelectedOptionIndex(null);
    setQuizSubmitted(false);
    setSolvedBlocks([false, false, false]);
    setStatusMessage('Powering up high frequency core buffers...');

    if (controllerRef.current) {
      const scene = controllerRef.current.scene;
      const camera = controllerRef.current.camera;
      const avatarConfig = controllerRef.current.avatar;
      const callbacks = controllerRef.current.callbacks;

      controllerRef.current = new LevelController(levelId, scene, camera, avatarConfig, callbacks);
    }
  };

  // Submit MCQ Choice
  const handleSelectOption = (idx: number) => {
    if (quizSubmitted) return;
    setSelectedOptionIndex(idx);
  };

  const handleSubmitQuizAnswer = () => {
    if (selectedOptionIndex === null || quizSubmitted) return;

    const currentQuestion = levelQuestions[activeQuizBlockIndex ?? 0];
    const isCorrect = selectedOptionIndex === currentQuestion.correctAnswerIndex;

    setQuizSubmitted(true);
    setQuizCorrect(isCorrect);

    if (isCorrect) {
      // Correct Choice! Unlocks block inside 3D simulation
      const blockIdx = activeQuizBlockIndex ?? 0;
      setSolvedBlocks(prev => {
        const next = [...prev];
        next[blockIdx] = true;
        return next;
      });

      if (controllerRef.current) {
        controllerRef.current.markQuestionSolved(blockIdx);
      }

      // Automatically redirect and resume gameplay after 2.5 seconds
      setTimeout(() => {
        handleCloseQuizOverlay();
      }, 2500);
    } else {
      // Incorrect choice! Small friction shield health penalty
      if (controllerRef.current) {
        controllerRef.current.health = Math.max(0, controllerRef.current.health - 15);
        setHealth(Math.round(controllerRef.current.health));
        if (controllerRef.current.health <= 0) {
          setShowLossScreen(true);
          setLossReason("Systems collapsed! Incorrect theoretical settings de-stabilized the neural buffer.");
        }
      }
    }
  };

  // Continue running platformer on correct answer
  const handleCloseQuizOverlay = () => {
    setActiveQuizBlockIndex(null);
    if (controllerRef.current) {
      controllerRef.current.isPaused = false;
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col bg-emerald-950 text-white select-none">
      
      {/* Onscreen Header Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap gap-4 items-center justify-between pointer-events-none">
        
        {/* Left segment: Level Information details */}
        <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-emerald-800/60 shadow-xl pointer-events-auto">
          <button 
            onClick={onExit}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Exit to Arena Map"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="border-l border-slate-800 pl-3">
            <h3 className="font-extrabold text-[13px] text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Stage {levelId}: {levelConfig.title}
            </h3>
            <span className="text-[9px] bg-emerald-900/65 text-emerald-300 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider block mt-0.5">
              🎓 AI Focus: {levelConfig.concept}
            </span>
          </div>
        </div>

        {/* Center: Interactive Forest Platformer Progress Meter */}
        <div className="bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-emerald-800/60 shadow-xl flex items-center gap-6 pointer-events-auto min-w-[280px]">
          
          {/* Tracker 1: Yellow Gold Coins */}
          <div className="flex-1">
            <div className="flex justify-between items-center text-[10px] text-amber-300 font-bold mb-1">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                🪙 Coins Claimed
              </span>
              <span>{coinsCollected} / {coinsTarget}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-400 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (coinsCollected / coinsTarget) * 100)}%` }}
              />
            </div>
          </div>

          {/* Tracker 2: Blue Question Blocks solved */}
          <div className="border-l border-slate-800 pl-4 pr-1">
            <div className="text-[10px] text-indigo-300 font-bold mb-1 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400 fill-indigo-950" />
              <span>? Blocks solved</span>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((idx) => (
                <div 
                  key={idx}
                  className={`w-4 h-4 rounded flex items-center justify-center font-black text-[9px] ${
                    solvedBlocks[idx] 
                      ? 'bg-emerald-500 text-white animate-bounce' 
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                  title={`Question Block #${idx + 1}`}
                >
                  {solvedBlocks[idx] ? '✓' : '?'}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right segment: Action buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={handleRestartLevel}
            className="bg-slate-900/90 backdrop-blur-md border border-emerald-800/55 hover:bg-slate-800 p-3 rounded-2xl text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Restart Forest Level"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Main 3D platform simulator element mount */}
      <div ref={mountRef} className="w-full h-full flex-1" id="3d-simulation-canvas" />

      {/* Lower HUD status indicators */}
      <div className="absolute bottom-4 left-4 right-4 z-20 grid grid-cols-1 md:grid-cols-12 gap-4 items-end pointer-events-none">
        
        {/* Left: Avatar diagnostic health specs */}
        <div className="md:col-span-3 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-800/60 shadow-xl pointer-events-auto space-y-2">
          <p className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest block font-mono">
            🔋 Character Chassis: {avatar.name}
          </p>
          
          <div className="space-y-0.5">
            <div className="flex justify-between text-[11px] font-bold text-slate-300">
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-current animate-pulse" /> Shield buffer
              </span>
              <span>{health}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  health > 60 ? 'bg-emerald-500' : health > 30 ? 'bg-amber-400 animate-pulse' : 'bg-rose-500 animate-ping'
                }`}
                style={{ width: `${health}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Live advisor guidance logs */}
        <div className="md:col-span-6 bg-slate-900/95 backdrop-blur-md p-3 px-6 rounded-2xl border border-emerald-800/60 shadow-xl text-center pointer-events-auto">
          <p className="text-[11px] font-mono font-bold text-emerald-300 tracking-wide">
            🌲 Live Forest Advisor: <span className="text-white">{statusMessage}</span>
          </p>
        </div>

        {/* Right: Quick actions and guidance manual */}
        <div className="md:col-span-3 bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-emerald-800/60 shadow-xl pointer-events-auto flex flex-col gap-1.5 text-center">
          <p className="text-[10px] text-slate-400 font-bold tracking-wide">
            🎮 KEYBOARD CONTROLS
          </p>
          <p className="text-[11px] text-slate-200 font-extrabold font-mono uppercase bg-emerald-950/80 py-1 border border-emerald-800 rounded">
            WASD / Arrows to run • SPACE to Jump!
          </p>
        </div>

      </div>

      {/* MARIO-STYLE AI CONCEPT QUIZ MODAL OVERLAY */}
      {activeQuizBlockIndex !== null && (
        <div className="fixed inset-0 bg-emerald-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-lg w-full p-6 border-4 border-amber-400 shadow-2xl relative space-y-5 animate-in fade-in zoom-in duration-200">
            
            {/* Header block info banner */}
            <div className="flex items-center gap-3 bg-amber-950/40 border border-amber-500/30 p-3 rounded-2xl">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg transform rotate-3">
                ?
              </div>
              <div className="text-left">
                <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest font-mono">
                  Interactive Logic Node hit!
                </span>
                <h3 className="text-sm font-black text-slate-100">
                  Question Mark Block #{activeQuizBlockIndex + 1}
                </h3>
              </div>
            </div>

            {/* AI Concept description */}
            <div className="space-y-2">
              <span className="bg-emerald-900/60 text-emerald-400 font-bold text-[10px] px-2.5 py-1 rounded border border-emerald-800/50 uppercase tracking-widest inline-block">
                Theoretical Focus: {levelConfig.concept}
              </span>
              <p className="text-sm leading-relaxed font-bold text-slate-100">
                {levelQuestions[activeQuizBlockIndex]?.question || "Is AI fun?"}
              </p>
            </div>

            {/* Answer Options listing */}
            <div className="space-y-2.5">
              {levelQuestions[activeQuizBlockIndex]?.options.map((opt, oIdx) => {
                const isSelected = selectedOptionIndex === oIdx;
                let btnStyle = "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700/65";

                if (quizSubmitted) {
                  const isCorrectAnswer = oIdx === levelQuestions[activeQuizBlockIndex].correctAnswerIndex;
                  if (isCorrectAnswer) {
                    btnStyle = "bg-emerald-950 border-emerald-500 text-emerald-300 font-black shadow-lg shadow-emerald-950/30";
                  } else if (isSelected) {
                    btnStyle = "bg-rose-950 border-rose-500 text-rose-300 font-bold opacity-80 z-10";
                  } else {
                    btnStyle = "bg-slate-800/40 border-slate-800 text-slate-500 pointer-events-none";
                  }
                } else if (isSelected) {
                  btnStyle = "bg-amber-950 border-amber-400 text-amber-200 font-bold ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900";
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    disabled={quizSubmitted}
                    className={`w-full text-left p-3.5 rounded-2xl text-xs border transition-all active:scale-[0.99] flex items-start gap-3 cursor-pointer ${btnStyle}`}
                  >
                    <span className="bg-slate-900/80 text-slate-400 w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span className="leading-relaxed leading-normal">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Verification action panel */}
            {!quizSubmitted ? (
              <button
                onClick={handleSubmitQuizAnswer}
                disabled={selectedOptionIndex === null}
                className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs py-3.5 rounded-2xl shadow-xl hover:opacity-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1 hover:scale-[1.01] transition-transform cursor-pointer"
              >
                COMPILE CONFIGURATION SETTINGS
                <ChevronRight className="w-4 h-4 text-slate-950 shrink-0" />
              </button>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Result Feedback note box */}
                <div className={`p-4 rounded-2xl border text-xs leading-relaxed flex gap-3 ${
                  quizCorrect 
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}>
                  <div className="shrink-0 mt-0.5">
                    {quizCorrect ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 fill-rose-950" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-extrabold uppercase tracking-wider text-[10px] font-mono">
                      {quizCorrect ? "✓ Verification Passed" : "✗ Compile Error (HP -15)"}
                    </p>
                    <p className="leading-relaxed font-semibold">
                      {levelQuestions[activeQuizBlockIndex]?.explanation}
                    </p>
                  </div>
                </div>

                {/* Continue Buttons */}
                {quizCorrect ? (
                  <div className="space-y-2">
                    <button
                      onClick={handleCloseQuizOverlay}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black text-xs py-3.5 rounded-2xl shadow-xl hover:opacity-95 transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-4 h-4 fill-current shrink-0" />
                      Disengage Pause State & Resume Platformer Adventure
                    </button>
                    <p className="text-center text-[10px] text-emerald-400 font-bold font-mono animate-pulse">
                      ⚡ Redirecting to continuation of the game in 2.5s...
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedOptionIndex(null);
                      setQuizSubmitted(false);
                    }}
                    className="w-full bg-slate-800 text-slate-300 font-bold text-xs py-3 rounded-2xl hover:bg-slate-700 transition-all text-center cursor-pointer"
                  >
                    Retry Theoretical Compiler
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* SUCCESS / ENTRANCE GATE OPEN CONGRATS */}
      {showWinScreen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 border-4 border-emerald-200 shadow-2xl relative text-center space-y-6 animate-in zoom-in duration-200">
            
            <div className="w-20 h-20 bg-emerald-100 rounded-3xl text-emerald-600 flex items-center justify-center mx-auto shadow-xl transform rotate-6">
              <Trophy className="w-10 h-10 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <span className="bg-emerald-100 text-emerald-700 font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-widest inline-block font-mono">
                ✓ ALL SECTOR CRITERIA SATISFIED
              </span>
              <h2 className="text-2xl font-black text-slate-950 leading-tight">
                Section {levelId} Cleared!
              </h2>
              <p className="text-xs text-slate-500 font-mono tracking-wide">
                Coins Collected: <span className="font-bold text-amber-500">🪙 {coinsCollected}</span> • Concepts mastered: <span className="font-bold text-emerald-600">3/3</span>
              </p>
            </div>

            {/* Stars score rendering */}
            <div className="flex gap-2 justify-center">
              {[1, 2, 3].map((s) => (
                <Star 
                  key={s} 
                  className={`w-9 h-9 ${s <= starsEarned ? 'fill-amber-400 text-amber-500 animate-bounce' : 'text-slate-200 border-none'}`} 
                  style={{ animationDelay: `${s * 150}ms` }}
                />
              ))}
            </div>

            {/* Lesson summary banner */}
            <div className="bg-slate-50 border-l-4 border-emerald-400 p-4 text-left text-xs text-slate-600 rounded-r-xl space-y-1.5">
              <p className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] font-mono">
                📊 AI Concept Outcome:
              </p>
              <p className="leading-relaxed leading-normal font-semibold">
                {levelConfig.outcome}
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {levelId < 10 && (
                <button
                  onClick={() => onCompleteLevel(levelId, starsEarned, true)}
                  className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg hover:shadow-indigo-200 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-95 animate-pulse"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-bounce shrink-0" />
                  Advance to Level {levelId + 1}
                  <Play className="w-3.5 h-3.5 fill-current ml-1 shrink-0" />
                </button>
              )}

              <button
                onClick={() => onCompleteLevel(levelId, starsEarned, false)}
                className={`w-full font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  levelId < 10 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-3 rounded-xl' 
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm py-4 rounded-2xl shadow-lg hover:shadow-emerald-200'
                }`}
              >
                Return to Campaign Board Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OUT OF HP DEFEAT OVERLAY SCREEN */}
      {showLossScreen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 border-4 border-rose-100 shadow-2xl relative text-center space-y-5 animate-in zoom-in duration-200">
            
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-md">
              <Heart className="w-8 h-8 text-rose-500 fill-current" />
            </div>

            <div className="space-y-1">
              <span className="bg-rose-100 text-rose-700 font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-widest inline-block font-mono">
                SYSTEM DE-CALIBRATED
              </span>
              <h2 className="text-2xl font-black text-rose-950">
                Reboot Required
              </h2>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-semibold max-w-xs mx-auto text-center">
              {lossReason || "You took fatal physical damage or answered questions incorrectly, exhausting the protective chassis buffer."}
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onExit}
                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-500 font-extrabold text-xs py-3.5 rounded-xl transition-all cursor-pointer"
              >
                Exit to Map
              </button>
              
              <button
                onClick={handleRestartLevel}
                className="w-2/3 bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-black text-xs py-3.5 rounded-xl shadow-lg hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Reset Stage Parameters
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
