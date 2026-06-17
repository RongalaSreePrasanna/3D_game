import React, { useState, useEffect } from 'react';
import { AVATARS, LEVELS, UserProfile, AvatarConfig, LevelConfig } from '../types';
import AvatarCanvas from './AvatarCanvas';
import { 
  Play, BookOpen, Star, Trophy, Palette, Sparkles, 
  Settings2, RefreshCw, KeyRound, CheckCircle, Flame
} from 'lucide-react';

interface LoginDashboardProps {
  onStartLevel: (levelId: number) => void;
  userProfile: UserProfile | null;
  onUpdateProfile: (profile: UserProfile) => void;
}

export default function LoginDashboard({ 
  onStartLevel, 
  userProfile, 
  onUpdateProfile 
}: LoginDashboardProps) {
  const [username, setUsername] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState(AVATARS[0].id);
  const [cheatOverride, setCheatOverride] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Initialize form state
  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username);
      setSelectedAvatarId(userProfile.chosenAvatarId);
    }
  }, [userProfile]);

  const activeAvatar = AVATARS.find(a => a.id === selectedAvatarId) || AVATARS[0];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    const newProfile: UserProfile = {
      username: username.trim(),
      chosenAvatarId: selectedAvatarId,
      currentLevel: 1,
      highestLevelUnlocked: 1,
      scores: {},
      completedAt: {}
    };
    onUpdateProfile(newProfile);
  };

  const handleSaveEditProfile = () => {
    if (!userProfile || !username.trim()) return;
    onUpdateProfile({
      ...userProfile,
      username: username.trim(),
      chosenAvatarId: selectedAvatarId
    });
    setShowEditProfile(false);
  };

  const resetAllProgress = () => {
    if (!window.confirm("Are you sure you want to reset your cute learning progress and achievements?")) return;
    localStorage.removeItem('ai_learning_arena_profile');
    window.location.reload();
  };

  const handleCheatToggle = () => {
    if (!userProfile) return;
    const maxLevel = cheatOverride ? 1 : 10;
    onUpdateProfile({
      ...userProfile,
      highestLevelUnlocked: maxLevel
    });
    setCheatOverride(!cheatOverride);
  };

  // Compute total stars/achievements
  const totalStars = userProfile ? Object.values(userProfile.scores).reduce((a, b) => a + b, 0) : 0;
  const completedCount = userProfile ? Object.keys(userProfile.scores).length : 0;

  // Render Login state (Cute initial setup screen)
  if (!userProfile) {
    return (
      <div 
        id="login-screen"
        className="min-h-screen bg-gradient-to-tr from-[#f3e8ff] via-[#fce7f3] to-[#e0f2fe] flex flex-col justify-center items-center p-4 md:p-8 select-none"
      >
        <div className="w-full max-w-4xl bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-pink-200/50 p-6 md:p-10 flex flex-col lg:flex-row gap-8 items-center transition-all">
          
          {/* 3D Character Customizer Section */}
          <div className="w-full lg:w-1/2 flex flex-col items-center">
            <h2 className="text-xl font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-500 animate-bounce" /> Customize Your Hero
            </h2>
            
            {/* Spinning Character Window */}
            <div className="w-full max-w-[280px] aspect-square bg-gradient-to-b from-indigo-50/50 to-indigo-100/50 rounded-2xl border-2 border-indigo-200 shadow-inner relative overflow-hidden mb-4">
              <AvatarCanvas avatar={activeAvatar} />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 border border-indigo-100 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping" />
                <span className="text-xs font-semibold text-indigo-950 uppercase tracking-wider">
                  Live Preview
                </span>
              </div>
            </div>

            {/* Character Selection Grid */}
            <div className="grid grid-cols-2 gap-2.5 w-full">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedAvatarId(av.id)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all ${
                    selectedAvatarId === av.id
                      ? 'bg-gradient-to-br from-indigo-500/10 to-pink-500/10 border-pink-400 shadow-md transform -translate-y-0.5'
                      : 'bg-white/40 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-bold text-xs text-indigo-950 flex items-center gap-1">
                    <span 
                      className="w-2 h-2 rounded-full inline-block" 
                      style={{ backgroundColor: av.primaryColor }}
                    />
                    {av.name}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight mt-1 line-clamp-2">
                    {av.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Form & Introduction Section */}
          <div className="w-full lg:w-1/2 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-pink-100 text-pink-600 font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-pink-500" /> AAA Real-Time 3D Game
                </span>
                <span className="bg-indigo-100 text-indigo-700 font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-widest">
                  PC/Tablet Controls
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-950 tracking-tight leading-none mb-3">
                3D AI Learning Arena
              </h1>
              <p className="text-sm text-slate-600 mb-6 font-medium leading-relaxed">
                Step into immersive, gorgeous 3D environments to master fundamental artificial intelligence concepts. Solve real-time physics and logic puzzles with your cute customizable character, rather than just reading dry manuals!
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 pl-1">
                  Choose Your Nickname
                </label>
                <input
                  type="text"
                  maxLength={18}
                  placeholder="Coder Hero Name..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none text-indigo-950 font-bold transition-all text-sm shadow-inner"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-extrabold text-sm py-4 rounded-2xl shadow-xl hover:shadow-indigo-200 active:scale-98 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                Enter Learner Arena 
                <Play className="w-4 h-4 fill-current group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-4 text-center">
              <p className="text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-1">
                🎮 Use <kbd className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">W</kbd>
                <kbd className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">A</kbd>
                <kbd className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">S</kbd>
                <kbd className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">D</kbd> or 
                <span className="font-bold">Arrows & Mouse</span> to steer your 3D action character!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Central Game Map & Level Selection
  return (
    <div 
      id="dashboard-screen"
      className="min-h-screen bg-slate-50 flex flex-col select-none"
    >
      {/* Top Header / Profile Ribbon */}
      <header className="bg-white border-b-2 border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-4 items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-6">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-indigo-950 leading-tight">
                AI Learning Arena
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Immersive 3D Edition
              </p>
            </div>
          </div>

          {/* User Profile Info Card */}
          <div className="flex items-center gap-6">
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-4 text-xs font-bold text-slate-700">
              <div className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-amber-100 shadow-sm">
                <Star className="w-4 h-4 fill-amber-400 stroke-amber-500 animate-spin-lazy" />
                <span>{totalStars} / 30 Stars</span>
              </div>
              <div className="bg-green-50 text-green-600 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-green-100 shadow-sm">
                <Trophy className="w-4 h-4 text-green-500" />
                <span>{completedCount} / 10 Finished</span>
              </div>
              <div className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-indigo-100 shadow-sm">
                <Flame className="w-4 h-4 text-indigo-500" />
                <span>Level {userProfile.highestLevelUnlocked} Cap</span>
              </div>
            </div>

            {/* User details */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden ring-2 ring-indigo-300 relative">
                <div className="scale-160 -translate-y-2">
                  <AvatarCanvas avatar={AVATARS.find(a => a.id === userProfile.chosenAvatarId) || AVATARS[0]} />
                </div>
              </div>
              <div>
                <p className="font-bold text-sm text-indigo-950 flex items-center gap-1">
                  {userProfile.username}
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                </p>
                <button 
                  onClick={() => setShowEditProfile(true)}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline block text-left"
                >
                  Edit Avatar
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Panel */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Profile Stats & Options list */}
        <div id="stats-rail" className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="p-2 bg-pink-100 rounded-xl text-pink-500">
                <Palette className="w-5 h-5" />
              </span>
              <h3 className="font-extrabold text-[#111827]">Active Character</h3>
            </div>
            
            <div className="w-full aspect-square bg-[#f8fafc] rounded-2xl border-2 border-[#e2e8f0] flex items-center justify-center overflow-hidden mb-4 relative">
              <AvatarCanvas avatar={AVATARS.find(a => a.id === userProfile.chosenAvatarId) || AVATARS[0]} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none" />
            </div>

            <p className="font-extrabold text-sm text-center text-slate-800 capitalize mb-1">
              {activeAvatar.name}
            </p>
            <p className="text-xs text-slate-500 text-center leading-relaxed mb-4">
              {activeAvatar.description}
            </p>

            <button
              onClick={() => setShowEditProfile(true)}
              className="w-full bg-slate-100 text-slate-700 font-bold text-xs py-2.5 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Palette className="w-4 h-4 text-slate-500" /> Match Avatar
            </button>
          </div>

          {/* Dev/Cheat Settings Box */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 rounded-xl text-indigo-500">
                <Settings2 className="w-5 h-5" />
              </span>
              <h3 className="font-extrabold text-[#111827]">Trainer Utilities</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-normal">
              Need to test or jump straight to Level 10? Toggle the Cheat Key below to unlock all environments instantly!
            </p>

            <button
              onClick={handleCheatToggle}
              className={`w-full font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                userProfile.highestLevelUnlocked >= 10
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200'
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-100'
              } border`}
            >
              <KeyRound className="w-4 h-4" />
              {userProfile.highestLevelUnlocked >= 10 ? 'Disable Cheat Lock' : 'Unlock All Level Arenas'}
            </button>

            <button
              onClick={resetAllProgress}
              className="w-full bg-rose-50 text-rose-600 font-bold text-xs py-3 rounded-xl hover:bg-rose-100 border border-rose-100 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Reset My Progress
            </button>
          </div>
        </div>

        {/* Right column: Levels Map & Concept Cards */}
        <div id="levels-section" className="lg:col-span-9 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-slate-100 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-indigo-950 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-indigo-500 animate-bounce" /> Learning Map
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Select an unlocked 3D environment card below to start playing and master the AI concepts!
                </p>
              </div>
              <div className="bg-indigo-600 text-white font-extrabold text-xs px-4 py-2 rounded-full shadow-lg">
                Campaign Progress: {completedCount} / 10 Clear
              </div>
            </div>

            {/* Level Selector Grid/Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LEVELS.map((lvl) => {
                const isUnlocked = lvl.id <= userProfile.highestLevelUnlocked;
                const score = userProfile.scores[lvl.id] || 0;
                
                return (
                  <div
                    key={lvl.id}
                    className={`rounded-2xl border-2 transition-all p-5 flex flex-col justify-between ${
                      isUnlocked 
                        ? 'bg-white border-indigo-100 hover:border-indigo-400 hover:shadow-lg hover:-translate-y-0.5' 
                        : 'bg-slate-50 border-slate-100 opacity-60'
                    }`}
                  >
                    <div>
                      {/* Badge info */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-extrabold text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                          Level {lvl.id}
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3].map((starIdx) => (
                            <Star 
                              key={starIdx}
                              className={`w-4 h-4 ${
                                score >= starIdx 
                                  ? 'fill-amber-400 text-amber-500' 
                                  : 'text-slate-200 fill-none'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>

                      {/* Title & Concept */}
                      <h3 className="font-extrabold text-slate-800 text-base mb-1">
                        {lvl.title}
                      </h3>
                      <p className="text-[11px] uppercase tracking-wider text-pink-500 font-extrabold mb-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                        AI Concept: {lvl.concept}
                      </p>
                      
                      {/* Subtitle / Objective */}
                      <p className="text-xs text-slate-600 mb-3 leading-relaxed font-normal">
                        {lvl.description}
                      </p>

                      {/* Learning outcome bullet */}
                      <div className="bg-slate-50 border-l-4 border-indigo-400 p-2 text-[11px] text-slate-600 rounded-r-lg mb-4 font-mono leading-none">
                        💡 {lvl.outcome}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        🏟️ {lvl.environmentName}
                      </span>

                      {isUnlocked ? (
                        <button
                          onClick={() => onStartLevel(lvl.id)}
                          className="bg-indigo-600 hover:bg-pink-500 text-white font-extrabold text-xs py-2 px-4 rounded-xl shadow transition-all hover:shadow-[#6366f1]/20 flex items-center gap-1.5 group cursor-pointer"
                        >
                          {score > 0 ? 'Replay Level' : 'Jump In'}
                          <Play className="w-3.5 h-3.5 fill-current group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400 italic bg-slate-100 py-1.5 px-3 rounded-xl border border-slate-200">
                          🔒 Locked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile / Avatar Selector Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 border-4 border-indigo-100 shadow-2xl relative">
            <h2 className="text-xl font-extrabold text-indigo-950 mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-500 animate-bounce" /> Change Character Specs
            </h2>

            <div className="flex flex-col sm:flex-row gap-6 mb-6">
              <div className="w-1/3 mx-auto max-w-[140px] aspect-square bg-[#f8fafc] rounded-2xl border-2 border-[#e2e8f0] overflow-hidden relative">
                <AvatarCanvas avatar={activeAvatar} />
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 pl-1">
                    Your Learner Tag
                  </label>
                  <input
                    type="text"
                    maxLength={18}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-400 text-indigo-950 font-bold outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
                    Toggle Avatar Class
                  </label>
                  <select
                    value={selectedAvatarId}
                    onChange={(e) => setSelectedAvatarId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-100 text-indigo-950 font-bold text-xs"
                  >
                    {AVATARS.map((av) => (
                      <option key={av.id} value={av.id}>
                        {av.name} ({av.accessory})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowEditProfile(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditProfile}
                disabled={!username.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-100 transition-colors"
              >
                Update Avatar!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
