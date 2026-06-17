/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { UserProfile } from './types';
import LoginDashboard from './components/LoginDashboard';
import GameCanvas from './components/GameCanvas';
import LevelInstructionsModal from './components/LevelInstructionsModal';
import { Sparkles, Trophy, Star, BookOpen, RotateCcw } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeScreen, setActiveScreen] = useState<'DASHBOARD' | 'PLAYING'>('DASHBOARD');
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null);
  const [showInstructionsMap, setShowInstructionsMap] = useState<Record<number, boolean>>({});

  // 1. Initial State Persistence
  useEffect(() => {
    const raw = localStorage.getItem('ai_learning_arena_profile');
    if (raw) {
      try {
        setProfile(JSON.parse(raw));
      } catch (err) {
        console.error("Failed to parse user session profile", err);
      }
    }
  }, []);

  // Sync profile edits to persistence
  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('ai_learning_arena_profile', JSON.stringify(newProfile));
  };

  // 2. Navigation Routing Actions
  const handleSelectStartLevelNode = (levelId: number) => {
    setActiveLevelId(levelId);
    setShowInstructionsMap({ [levelId]: true });
  };

  const handleLaunchLevelSimulation = (levelId: number) => {
    setShowInstructionsMap({});
    setActiveScreen('PLAYING');
  };

  const handleCompleteActiveLevel = (levelId: number, stars: number, playNext: boolean = false) => {
    if (!profile) return;

    // Update level highscores
    const currentScores = { ...profile.scores };
    const bestScore = Math.max(currentScores[levelId] || 0, stars);
    currentScores[levelId] = bestScore;

    // Sequential level unlock calculations
    const updatedHighestUnlocked = Math.max(
      profile.highestLevelUnlocked,
      Math.min(10, levelId + 1)
    );

    const updatedProfile: UserProfile = {
      ...profile,
      highestLevelUnlocked: updatedHighestUnlocked,
      currentLevel: levelId,
      scores: currentScores,
      completedAt: {
        ...profile.completedAt,
        [levelId]: new Date().toISOString()
      }
    };

    handleUpdateProfile(updatedProfile);

    if (playNext && levelId < 10) {
      setActiveLevelId(levelId + 1);
      setShowInstructionsMap({ [levelId + 1]: true });
    }
    setActiveScreen('DASHBOARD');
  };

  // Check if player has cleared all levels for beautiful victory state
  const isVanguardChampion = profile && Object.keys(profile.scores).length >= 10;

  return (
    <main className="w-full min-h-screen bg-slate-50 font-sans" id="main-coordinator-app">
      
      {/* Active screen routing switch */}
      {activeScreen === 'DASHBOARD' ? (
        <div className="relative">
          <LoginDashboard 
            onStartLevel={handleSelectStartLevelNode}
            userProfile={profile}
            onUpdateProfile={handleUpdateProfile}
          />
          
          {/* Vanguard Campaign Completion Banner */}
          {isVanguardChampion && (
            <div className="bg-gradient-to-r from-indigo-900 via-rose-900 to-amber-950 p-6 text-white text-center rounded-t-3xl border-t-4 border-amber-400 mt-2">
              <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-left">
                  <h4 className="text-lg font-extrabold flex items-center gap-2 text-amber-300">
                    <Trophy className="w-5 h-5 text-amber-400 animate-bounce" /> Congratulations, Vanguard AI Coder!
                  </h4>
                  <p className="text-xs text-slate-300 font-medium">
                    You have successfully completed all 10 real-time 3D environments, mastering Decision Trees, Q-learning updates, genetic crossovers, mAP bounding labels, and adaptive adversarial defenses!
                  </p>
                </div>
                <div className="bg-amber-400/20 text-amber-300 font-bold text-xs px-4 py-2 border border-amber-300/50 rounded-full flex items-center gap-1">
                  <Sparkles className="w-4 h-4" /> 10 / 10 Fully Certified
                </div>
              </div>
            </div>
          )}

          {/* Render Active Instructions Modals before starting */}
          {activeLevelId && showInstructionsMap[activeLevelId] && (
            <LevelInstructionsModal 
              levelId={activeLevelId}
              onClose={() => {
                setActiveLevelId(null);
                setShowInstructionsMap({});
              }}
              onPlay={() => handleLaunchLevelSimulation(activeLevelId)}
            />
          )}
        </div>
      ) : (
        activeLevelId && profile && (
          <GameCanvas 
            levelId={activeLevelId}
            avatar={profile.chosenAvatarId ? (profile.chosenAvatarId === 'cyber_bot' ? {
              id: 'cyber_bot',
              name: 'Cyber Robo-Bot',
              primaryColor: '#ff007f',
              secondaryColor: '#00f0ff',
              glowColor: '#ff007f',
              description: 'A cute futuristic robot helper who emits cozy neon sparks.',
              shape: 'box',
              accessory: 'antenna'
            } : profile.chosenAvatarId === 'bouncy_slime' ? {
              id: 'bouncy_slime',
              name: 'Gloop Slime',
              primaryColor: '#4eec24',
              secondaryColor: '#0c8200',
              glowColor: '#4eec24',
              description: 'An adorable jelly slime with giant round glossy eyes that bounces with joy.',
              shape: 'sphere',
              accessory: 'headphones'
            } : profile.chosenAvatarId === 'magic_chibi' ? {
              id: 'magic_chibi',
              name: 'Astral Mage',
              primaryColor: '#7a22ff',
              secondaryColor: '#ffaa00',
              glowColor: '#7a22ff',
              description: 'A miniature star-wanderer with an ancient cybernetic wizard cone.',
              shape: 'cylinder',
              accessory: 'hat'
            } : {
              id: 'cosmic_donut',
              name: 'Glitz Torus',
              primaryColor: '#ff9000',
              secondaryColor: '#ff0055',
              glowColor: '#ff9000',
              description: 'A high-energy hovering toroidal pet spinning with learning parameters.',
              shape: 'torus',
              accessory: 'halo'
            }) : {
              id: 'cyber_bot',
              name: 'Cyber Robo-Bot',
              primaryColor: '#ff007f',
              secondaryColor: '#00f0ff',
              glowColor: '#ff007f',
              description: 'A cute futuristic robot helper who emits cozy neon sparks.',
              shape: 'box',
              accessory: 'antenna'
            }}
            onExit={() => setActiveScreen('DASHBOARD')}
            onCompleteLevel={handleCompleteActiveLevel}
          />
        )
      )}

    </main>
  );
}
