import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Minus, 
  MinusSquare,
  PlusSquare,
  Check, 
  Clock, 
  History, 
  Zap, 
  ShieldCheck,
  XCircle,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { Bet, PastRound } from '../types';
import SpribePlane from './SpribePlane';

interface AviatorGameProps {
  balance: number;
  gameState: 'waiting' | 'flying' | 'crashed';
  multiplier: number;
  countdown: number;
  recentMultipliers: PastRound[];
  activeBets: Bet[];
  liveBetsCount?: number;
  onPlaceBet: (panelId: number, amount: number, autoCash: boolean, autoCashMult: number) => void;
  onCancelBet: (panelId: number) => void;
  onCashOut: (panelId: number) => void;
}

export default function AviatorGame({
  balance,
  gameState,
  multiplier,
  countdown,
  recentMultipliers,
  activeBets,
  liveBetsCount = 0,
  onPlaceBet,
  onCancelBet,
  onCashOut
}: AviatorGameProps) {
  // Dual betting panels
  const [panel1, setPanel1] = useState({ amount: 10, autoCash: false, autoCashMult: 2.0 });
  const [panel2, setPanel2] = useState({ amount: 10, autoCash: false, autoCashMult: 2.0 });
  
  const [panel1Mode, setPanel1Mode] = useState<'bet' | 'auto'>('bet');
  const [panel2Mode, setPanel2Mode] = useState<'bet' | 'auto'>('bet');
  const [panel2Visible, setPanel2Visible] = useState(true);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Visual pulse when new bot/player bet is placed live
  const [isIncrementing, setIsIncrementing] = useState(false);
  const prevBetsCountRef = useRef(liveBetsCount);

  useEffect(() => {
    if (liveBetsCount > prevBetsCountRef.current) {
      setIsIncrementing(true);
      const timer = setTimeout(() => setIsIncrementing(false), 220);
      prevBetsCountRef.current = liveBetsCount;
      return () => clearTimeout(timer);
    }
    prevBetsCountRef.current = liveBetsCount;
  }, [liveBetsCount]);

  // Exponential flight curve
  const simulatedTime = Math.sqrt(Math.max(0, multiplier - 1) / 0.05);
  
  const planeX = gameState === 'waiting' 
    ? 15 
    : gameState === 'crashed'
    ? 98
    : Math.min(12 + simulatedTime * 4.8, 80);

  const planeY = gameState === 'waiting' 
    ? 82 
    : gameState === 'crashed'
    ? -25
    : Math.max(82 - Math.pow(simulatedTime, 1.25) * 2.7, 18);

  // Flight curve trajectory path
  const createPathString = () => {
    if (gameState === 'waiting') return '';
    const startX = 5;
    const startY = 86;
    const controlX = startX + (planeX - startX) * 0.65;
    const controlY = startY;
    return `M ${startX} ${startY} Q ${controlX} ${controlY} ${planeX} ${planeY}`;
  };

  const handleBetClick = (panelId: number) => {
    const panel = panelId === 0 ? panel1 : panel2;
    const activeBet = activeBets[panelId];

    if (activeBet && (activeBet.status === 'placed' || activeBet.status === 'queued')) {
      if (gameState === 'flying' && activeBet.status === 'placed') {
        onCashOut(panelId);
      } else {
        onCancelBet(panelId);
      }
    } else {
      if (balance < panel.amount) {
        setErrorMessage('Insufficient wallet balance to place this stake! Please deposit funds first.');
        setTimeout(() => setErrorMessage(null), 4000);
        return;
      }
      onPlaceBet(panelId, panel.amount, panel.autoCash, panel.autoCashMult);
    }
  };

  const setAmount = (panelId: number, amt: number) => {
    const val = Math.max(10, Math.min(10000, amt));
    if (panelId === 0) {
      setPanel1((prev) => ({ ...prev, amount: val }));
    } else {
      setPanel2((prev) => ({ ...prev, amount: val }));
    }
  };

  const addAmount = (panelId: number, delta: number) => {
    if (panelId === 0) {
      setPanel1((prev) => ({ ...prev, amount: Math.max(10, Math.min(10000, prev.amount + delta)) }));
    } else {
      setPanel2((prev) => ({ ...prev, amount: Math.max(10, Math.min(10000, prev.amount + delta)) }));
    }
  };

  const toggleAutoCash = (panelId: number) => {
    if (panelId === 0) {
      setPanel1((prev) => ({ ...prev, autoCash: !prev.autoCash }));
    } else {
      setPanel2((prev) => ({ ...prev, autoCash: !prev.autoCash }));
    }
  };

  const stepAutoCashMult = (panelId: number, delta: number) => {
    if (panelId === 0) {
      setPanel1((prev) => ({
        ...prev,
        autoCashMult: Math.max(1.01, Math.min(100, parseFloat((prev.autoCashMult + delta).toFixed(2))))
      }));
    } else {
      setPanel2((prev) => ({
        ...prev,
        autoCashMult: Math.max(1.01, Math.min(100, parseFloat((prev.autoCashMult + delta).toFixed(2))))
      }));
    }
  };

  // Helper for past multiplier styling (Spribe color coding)
  const getMultiplierStyle = (mult: number) => {
    if (mult >= 10.0) {
      // Magenta / High win
      return 'text-[#c01bf0] bg-[#271033] border-[#581c87]';
    } else if (mult >= 2.0) {
      // Purple / Violet
      return 'text-[#913ef8] bg-[#1d122e] border-[#3b1d60]';
    } else {
      // Cyan / Blue (< 2.00x)
      return 'text-[#34b4e3] bg-[#0c1b2c] border-[#163854]';
    }
  };

  const presets = [10, 100, 500, 1000];

  return (
    <div className="space-y-2.5 sm:space-y-3 w-full max-w-lg mx-auto" id="spribe_aviator_container">
      
      {/* 1. Authentic Spribe Past Multipliers History Bar */}
      <div 
        className="flex items-center justify-between gap-1 py-1 px-1 bg-black rounded-lg select-none" 
        id="spribe_history_bar"
      >
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-grow pr-1">
          {recentMultipliers.length === 0 ? (
            <span className="text-[11px] text-zinc-500 italic pl-1">Connecting to round server...</span>
          ) : (
            recentMultipliers.slice(0, 14).map((r, idx) => (
              <div
                key={`${r.id}-${idx}`}
                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 transition-transform active:scale-95 ${getMultiplierStyle(r.multiplier)}`}
              >
                {r.multiplier.toFixed(2)}x
              </div>
            ))
          )}
        </div>

        {/* History Dropdown button (···) */}
        <button
          type="button"
          onClick={() => setShowHistoryModal(true)}
          className="w-7 h-7 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center shrink-0 border border-zinc-800 transition active:scale-90 cursor-pointer"
          title="Past Rounds History"
          id="history_menu_dots_btn"
        >
          <span className="text-sm font-black tracking-widest leading-none">···</span>
        </button>
      </div>

      {/* 2. Authentic Spribe Flight Arena / Stage */}
      <div
        className="relative h-[220px] xs:h-[250px] sm:h-[290px] w-full rounded-2xl bg-black border border-zinc-700/80 overflow-hidden select-none shadow-2xl ring-1 ring-white/5"
        id="spribe_flight_stage"
      >
        {/* Radial Sunburst Rays Background (Identical to official game screen) */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-35"
          style={{
            background: 'repeating-conic-gradient(from 0deg, #18181b 0deg 15deg, #09090b 15deg 30deg)',
          }}
        />

        {/* Coordinate Grid Lines (Subtle horizontal & vertical aviation grid lines) */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.12) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.12) 1px, transparent 1px)
            `,
            backgroundSize: '44px 44px',
          }}
        />

        {/* Side & Baseline Coordinate Axis Lines */}
        <div className="absolute left-2.5 top-3 bottom-3 w-[1.5px] bg-gradient-to-b from-zinc-700/20 via-zinc-600/60 to-zinc-600/90 pointer-events-none z-10 flex flex-col justify-between py-2">
          <div className="w-1.5 h-[1px] bg-zinc-500/80" />
          <div className="w-1.5 h-[1px] bg-zinc-500/80" />
          <div className="w-1.5 h-[1px] bg-zinc-500/80" />
          <div className="w-1.5 h-[1px] bg-zinc-500/80" />
          <div className="w-1.5 h-[1px] bg-zinc-500/80" />
        </div>
        <div className="absolute left-2.5 right-3 bottom-2.5 h-[1.5px] bg-gradient-to-r from-zinc-600/90 via-zinc-700/50 to-zinc-800/20 pointer-events-none z-10 flex justify-between px-2">
          <div className="w-[1px] h-1.5 bg-zinc-500/80" />
          <div className="w-[1px] h-1.5 bg-zinc-500/80" />
          <div className="w-[1px] h-1.5 bg-zinc-500/80" />
          <div className="w-[1px] h-1.5 bg-zinc-500/80" />
          <div className="w-[1px] h-1.5 bg-zinc-500/80" />
        </div>

        {/* Subtle circular vignette overlay */}
        <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black pointer-events-none" />

        {/* State A: WAITING / LOBBY (100% IDENTICAL TO USER PHOTO) */}
        {gameState === 'waiting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-between p-3 sm:p-4 z-10" id="waiting_lobby_screen">
            {/* Top: UFC | Aviator OFFICIAL PARTNERS */}
            <div className="flex flex-col items-center pt-1 animate-fade-in">
              <div className="flex items-center gap-3">
                {/* UFC Red Logo */}
                <span className="font-sans font-black text-xl sm:text-2xl text-red-600 tracking-tighter italic">
                  UFC
                </span>
                <span className="w-px h-5 bg-zinc-700" />
                {/* Aviator script logo with tiny propeller plane */}
                <div className="flex items-center gap-1.5">
                  <svg className="w-6 h-5 fill-red-600" viewBox="0 0 160 100">
                    <path d="M 22 55 C 38 58, 70 63, 115 62 C 128 61, 136 56, 138 52 C 136 46, 128 41, 115 40 C 72 38, 40 45, 22 51 Z" />
                    <line x1="102" y1="64" x2="96" y2="86" stroke="red" strokeWidth="4" />
                    <circle cx="94" cy="88" r="7" fill="#333" />
                  </svg>
                  <span className="font-serif italic font-black text-red-600 text-lg sm:text-xl tracking-tight font-['Brush_Script_MT',cursive,sans-serif]">
                    Aviator
                  </span>
                </div>
              </div>

              {/* OFFICIAL PARTNERS */}
              <p className="text-[10px] sm:text-[11px] font-black tracking-widest text-white uppercase mt-0.5">
                OFFICIAL PARTNERS
              </p>

              {/* Red Progress Bar */}
              <div className="w-36 sm:w-44 h-1 bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className="h-full bg-red-600 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${Math.min(100, Math.max(10, (countdown / 5) * 100))}%` }}
                />
              </div>
            </div>

            {/* Middle: SPRIBE Official Game Badge (Exact replica from photo!) */}
            <div className="my-auto">
              <div className="px-4 py-2 bg-black/60 border-2 border-emerald-700/80 rounded-2xl shadow-lg backdrop-blur-sm text-center flex flex-col items-center">
                <div className="flex items-center gap-1.5 mb-1">
                  {/* Spribe textured dot icon */}
                  <div className="w-4 h-4 rounded-full border border-zinc-500/50 flex items-center justify-center text-[9px] font-black text-zinc-300">
                    S
                  </div>
                  <span className="text-xs sm:text-sm font-black tracking-widest text-white uppercase">
                    SPRIBE
                  </span>
                </div>
                
                {/* Official Game tag */}
                <div className="px-2.5 py-0.5 bg-emerald-950/70 border border-emerald-500/70 rounded-full flex items-center gap-1">
                  <span className="text-[10px] text-emerald-400 font-bold">Official Game</span>
                  <div className="w-3 h-3 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[8px] font-black">
                    ✓
                  </div>
                </div>

                <span className="text-[9px] text-zinc-500 font-mono mt-1">Since 2019</span>
              </div>
            </div>

            {/* Bottom: Parked Red Stunt Plane (Left) & Active Players Avatar Pill (Right) */}
            <div className="w-full flex items-end justify-between">
              {/* Parked Spribe Plane in the bottom-left */}
              <div className="w-24 h-16 sm:w-28 sm:h-20 transform rotate-[-6deg] drop-shadow-[0_4px_12px_rgba(229,25,55,0.4)]">
                <SpribePlane flying={false} />
              </div>

              {/* 3 User avatars with dynamic live bets count */}
              <div 
                className={`flex items-center gap-1.5 bg-black/80 border rounded-full px-2.5 py-1 shadow-md mb-1 transition-all duration-200 ${
                  isIncrementing
                    ? 'border-emerald-500/80 bg-emerald-950/40 scale-105 shadow-[0_0_10px_rgba(16,185,129,0.35)]'
                    : 'border-zinc-800'
                }`}
                id="waiting_lobby_live_bets_pill"
              >
                <div className="flex -space-x-2">
                  <div className="w-5 h-5 rounded-full border border-zinc-900 bg-amber-600 flex items-center justify-center text-[9px] font-bold text-white">
                    🐶
                  </div>
                  <div className="w-5 h-5 rounded-full border border-zinc-900 bg-blue-600 flex items-center justify-center text-[9px] font-bold text-white">
                    🐺
                  </div>
                  <div className="w-5 h-5 rounded-full border border-zinc-900 bg-emerald-600 flex items-center justify-center text-[9px] font-bold text-white">
                    🐱
                  </div>
                </div>
                <span className="text-[11px] font-mono font-black text-emerald-400 ml-0.5 tabular-nums transition-transform">
                  {liveBetsCount}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
              </div>
            </div>
          </div>
        )}

        {/* State B: IN FLIGHT or CRASHED */}
        {gameState !== 'waiting' && (
          <>
            {/* SVG Flight Trajectory Curved Path */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
            >
              <defs>
                {/* Red Under-curve Translucent Glow Gradient */}
                <linearGradient id="spribeCurveGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e51937" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#e51937" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#e51937" stopOpacity="0.0" />
                </linearGradient>

                <filter id="spribeRedFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Shaded Area under trajectory curve */}
              <path
                d={`${createPathString()} L ${planeX} 86 L 5 86 Z`}
                fill="url(#spribeCurveGlow)"
              />

              {/* Glowing Red Trajectory Line */}
              <path
                d={createPathString()}
                fill="none"
                stroke="#e51937"
                strokeWidth="2.5"
                strokeLinecap="round"
                filter="url(#spribeRedFilter)"
              />
              <path
                d={createPathString()}
                fill="none"
                stroke="#ffffff"
                strokeWidth="0.8"
                strokeLinecap="round"
                opacity="0.8"
              />
            </svg>

            {/* Flying Red Aerobatic Propeller Plane */}
            {gameState !== 'crashed' && (
              <div
                className="absolute pointer-events-none select-none transition-all duration-75"
                style={{
                  left: `${planeX}%`,
                  top: `${planeY}%`,
                  transform: 'translate(-50%, -50%) rotate(-12deg)',
                  width: '95px',
                  height: '65px',
                  zIndex: 20,
                }}
              >
                <SpribePlane flying={true} />
              </div>
            )}

            {/* Huge Multiplier / Crashed Text HUD */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30">
              {gameState === 'crashed' ? (
                <div className="text-center space-y-1 animate-fade-in select-none">
                  <p className="text-red-600 font-black text-3xl sm:text-4xl tracking-wider uppercase italic drop-shadow-[0_2px_12px_rgba(229,25,55,0.7)] font-sans">
                    FLEW AWAY!
                  </p>
                  <p className="text-zinc-200 text-xl sm:text-2xl font-mono font-black py-0.5 px-3 bg-black/80 rounded-full border border-zinc-800 inline-block shadow-lg">
                    {multiplier.toFixed(2)}x
                  </p>
                </div>
              ) : (
                <div className="text-center select-none" id="flying_multiplier_display">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl sm:text-6xl md:text-7xl font-sans font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
                      {multiplier.toFixed(2)}
                    </span>
                    <span className="text-3xl sm:text-4xl font-extrabold text-white ml-1">
                      x
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Non-blocking error alerts */}
      {errorMessage && (
        <div className="p-3 bg-red-950/90 border border-red-500/50 rounded-xl text-xs font-bold text-red-300 flex items-center justify-between gap-2 shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button 
            type="button"
            onClick={() => setErrorMessage(null)} 
            className="text-[10px] font-black text-zinc-400 hover:text-white uppercase"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* 3. Authentic Spribe Dual Betting Panels (Stacked Exactly like in user photo) */}
      <div className="space-y-2" id="spribe_betting_panels">
        
        {/* PANEL 1 */}
        <div 
          className="p-2.5 sm:p-3 bg-[#141416] border border-zinc-800/60 rounded-2xl shadow-xl select-none"
          id="spribe_panel_0"
        >
          {/* Top Segment Switch: [ Bet ] [ Auto ] */}
          <div className="flex items-center justify-center mb-1.5">
            <div className="inline-flex p-0.5 bg-[#0e0e10] border border-zinc-850 rounded-full">
              <button
                type="button"
                onClick={() => setPanel1Mode('bet')}
                className={`py-0.5 px-4 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  panel1Mode === 'bet'
                    ? 'bg-[#2c2c2e] text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Bet
              </button>
              <button
                type="button"
                onClick={() => setPanel1Mode('auto')}
                className={`py-0.5 px-4 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  panel1Mode === 'auto'
                    ? 'bg-[#2c2c2e] text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Auto
              </button>
            </div>
          </div>

          {/* Controls: Left Stepper & Presets + Right Huge Bet Button */}
          <div className="grid grid-cols-2 gap-2 items-stretch">
            {/* Left Side: Stepper & 2x2 Preset Grid */}
            <div className="flex flex-col justify-between py-0.5">
              {/* Stepper Row: (-) 10.00 (+) */}
              <div className="flex items-center justify-between px-0.5">
                <button
                  type="button"
                  disabled={activeBets[0]?.status === 'placed'}
                  onClick={() => addAmount(0, -10)}
                  className="w-7 h-7 rounded-full bg-[#202024] hover:bg-[#28282e] text-zinc-300 disabled:opacity-30 flex items-center justify-center font-bold transition active:scale-95 cursor-pointer"
                  aria-label="Decrease stake"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="font-sans font-bold text-base sm:text-lg text-white text-center tracking-tight">
                  {panel1.amount.toFixed(2)}
                </div>
                <button
                  type="button"
                  disabled={activeBets[0]?.status === 'placed'}
                  onClick={() => addAmount(0, 10)}
                  className="w-7 h-7 rounded-full bg-[#202024] hover:bg-[#28282e] text-zinc-300 disabled:opacity-30 flex items-center justify-center font-bold transition active:scale-95 cursor-pointer"
                  aria-label="Increase stake"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 2x2 Preset Grid: 10, 100, 500, 1,000 */}
              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                {presets.map((amt) => (
                  <button
                    key={`p1-${amt}`}
                    type="button"
                    disabled={activeBets[0]?.status === 'placed'}
                    onClick={() => setAmount(0, amt)}
                    className={`py-1 rounded-full text-xs font-medium transition active:scale-95 cursor-pointer text-center ${
                      panel1.amount === amt
                        ? 'bg-[#2c2c2e] text-white border border-zinc-600'
                        : 'bg-[#202024] hover:bg-[#28282e] text-zinc-300'
                    }`}
                  >
                    {amt === 1000 ? '1,000' : amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side: ICONIC VIBRANT GREEN "Bet" BUTTON (Compact Proportion) */}
            <div>
              {activeBets[0]?.status === 'placed' && gameState === 'flying' ? (
                /* Cash Out in Flight (Orange/Gold) */
                <button
                  type="button"
                  onClick={() => handleBetClick(0)}
                  className="w-full h-full min-h-[74px] bg-[#e65100] hover:bg-[#f57c00] active:scale-[0.98] text-white rounded-2xl flex flex-col items-center justify-center leading-tight shadow-lg shadow-orange-950/50 transition cursor-pointer border border-amber-400"
                  id="cashout_btn_panel_0"
                >
                  <span className="text-xs uppercase tracking-wider font-bold text-amber-200">
                    Cash Out
                  </span>
                  <span className="text-base sm:text-lg font-black font-sans text-white mt-0.5">
                    {(activeBets[0].amount * multiplier).toFixed(2)} INR
                  </span>
                </button>
              ) : (activeBets[0]?.status === 'placed' || activeBets[0]?.status === 'queued') ? (
                /* Cancel Bet while waiting or queued (Red/Dark) */
                <button
                  type="button"
                  onClick={() => handleBetClick(0)}
                  className="w-full h-full min-h-[74px] bg-[#991b1b] hover:bg-[#b91c1c] active:scale-[0.98] text-white rounded-2xl flex flex-col items-center justify-center leading-tight shadow-md shadow-red-950/50 transition cursor-pointer border border-red-500/50"
                  id="cancel_btn_panel_0"
                >
                  <span className="text-xs uppercase tracking-wider font-bold text-red-200">
                    Cancel
                  </span>
                  <span className="text-[10px] text-red-300 font-medium">
                    {activeBets[0]?.status === 'queued' ? 'Wait Next Round' : 'Waiting...'}
                  </span>
                  <span className="text-sm sm:text-base font-bold font-sans text-white mt-0.5">
                    {activeBets[0].amount.toFixed(2)} INR
                  </span>
                </button>
              ) : (
                /* Standard Green "Bet" Button */
                <button
                  type="button"
                  onClick={() => handleBetClick(0)}
                  disabled={balance < panel1.amount}
                  className="w-full h-full min-h-[74px] bg-[#28a745] hover:bg-[#2cb742] active:bg-[#23923d] active:scale-[0.98] disabled:opacity-40 text-white rounded-2xl flex flex-col items-center justify-center leading-tight shadow-md transition-all border border-[#4ade80]/30 cursor-pointer"
                  id="bet_btn_panel_0"
                >
                  <span className="text-lg sm:text-xl font-bold font-sans tracking-normal text-white">
                    {gameState === 'flying' ? 'Wait Next' : 'Bet'}
                  </span>
                  <span className="text-base sm:text-lg font-black font-sans tracking-tight text-white mt-0.5">
                    {panel1.amount.toFixed(2)} INR
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Auto Cashout Controls when "Auto" tab selected */}
          {panel1Mode === 'auto' && (
            <div className="mt-2 pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleAutoCash(0)}
                  className={`w-7 h-3.5 rounded-full p-0.5 transition duration-200 cursor-pointer ${
                    panel1.autoCash ? 'bg-emerald-500' : 'bg-zinc-700'
                  }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform ${panel1.autoCash ? 'translate-x-3.5' : 'translate-x-0'}`} />
                </button>
                <span className="text-[10px] font-bold text-zinc-300">Auto Cash Out</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={!panel1.autoCash}
                  onClick={() => stepAutoCashMult(0, -0.1)}
                  className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center font-mono font-bold text-xs"
                >
                  -
                </button>
                <span className="font-mono font-bold text-white px-1.5 py-0.5 bg-zinc-900 rounded border border-zinc-800 text-[10px]">
                  {panel1.autoCashMult.toFixed(2)}x
                </span>
                <button
                  type="button"
                  disabled={!panel1.autoCash}
                  onClick={() => stepAutoCashMult(0, 0.1)}
                  className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center font-mono font-bold text-xs"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PANEL 2 */}
        {panel2Visible && (
          <div 
            className="p-2.5 sm:p-3 bg-[#141416] border border-zinc-800/60 rounded-2xl shadow-xl select-none relative"
            id="spribe_panel_1"
          >
            {/* Top Segment Switch: [ Bet ] [ Auto ] */}
            <div className="flex items-center justify-center mb-1.5">
              <div className="inline-flex p-0.5 bg-[#0e0e10] border border-zinc-850 rounded-full">
                <button
                  type="button"
                  onClick={() => setPanel2Mode('bet')}
                  className={`py-0.5 px-4 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    panel2Mode === 'bet'
                      ? 'bg-[#2c2c2e] text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Bet
                </button>
                <button
                  type="button"
                  onClick={() => setPanel2Mode('auto')}
                  className={`py-0.5 px-4 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    panel2Mode === 'auto'
                      ? 'bg-[#2c2c2e] text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Auto
                </button>
              </div>
            </div>

            {/* Controls: Left Stepper & Presets + Right Huge Bet Button */}
            <div className="grid grid-cols-2 gap-2 items-stretch">
              {/* Left Side: Stepper & 2x2 Preset Grid */}
              <div className="flex flex-col justify-between py-0.5">
                {/* Stepper Row: (-) 10.00 (+) */}
                <div className="flex items-center justify-between px-0.5">
                  <button
                    type="button"
                    disabled={activeBets[1]?.status === 'placed'}
                    onClick={() => addAmount(1, -10)}
                    className="w-7 h-7 rounded-full bg-[#202024] hover:bg-[#28282e] text-zinc-300 disabled:opacity-30 flex items-center justify-center font-bold transition active:scale-95 cursor-pointer"
                    aria-label="Decrease stake"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <div className="font-sans font-bold text-base sm:text-lg text-white text-center tracking-tight">
                    {panel2.amount.toFixed(2)}
                  </div>
                  <button
                    type="button"
                    disabled={activeBets[1]?.status === 'placed'}
                    onClick={() => addAmount(1, 10)}
                    className="w-7 h-7 rounded-full bg-[#202024] hover:bg-[#28282e] text-zinc-300 disabled:opacity-30 flex items-center justify-center font-bold transition active:scale-95 cursor-pointer"
                    aria-label="Increase stake"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 2x2 Preset Grid: 10, 100, 500, 1,000 */}
                <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                  {presets.map((amt) => (
                    <button
                      key={`p2-${amt}`}
                      type="button"
                      disabled={activeBets[1]?.status === 'placed'}
                      onClick={() => setAmount(1, amt)}
                      className={`py-1 rounded-full text-xs font-medium transition active:scale-95 cursor-pointer text-center ${
                        panel2.amount === amt
                          ? 'bg-[#2c2c2e] text-white border border-zinc-600'
                          : 'bg-[#202024] hover:bg-[#28282e] text-zinc-300'
                      }`}
                    >
                      {amt === 1000 ? '1,000' : amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Side: ICONIC VIBRANT GREEN "Bet" BUTTON (Compact Proportion) */}
              <div>
                {activeBets[1]?.status === 'placed' && gameState === 'flying' ? (
                  /* Cash Out in Flight (Orange/Gold) */
                  <button
                    type="button"
                    onClick={() => handleBetClick(1)}
                    className="w-full h-full min-h-[74px] bg-[#e65100] hover:bg-[#f57c00] active:scale-[0.98] text-white rounded-2xl flex flex-col items-center justify-center leading-tight shadow-lg shadow-orange-950/50 transition cursor-pointer border border-amber-400"
                    id="cashout_btn_panel_1"
                  >
                    <span className="text-xs uppercase tracking-wider font-bold text-amber-200">
                      Cash Out
                    </span>
                    <span className="text-base sm:text-lg font-black font-sans text-white mt-0.5">
                      {(activeBets[1].amount * multiplier).toFixed(2)} INR
                    </span>
                  </button>
                ) : (activeBets[1]?.status === 'placed' || activeBets[1]?.status === 'queued') ? (
                  /* Cancel Bet while waiting or queued (Red/Dark) */
                  <button
                    type="button"
                    onClick={() => handleBetClick(1)}
                    className="w-full h-full min-h-[74px] bg-[#991b1b] hover:bg-[#b91c1c] active:scale-[0.98] text-white rounded-2xl flex flex-col items-center justify-center leading-tight shadow-md shadow-red-950/50 transition cursor-pointer border border-red-500/50"
                    id="cancel_btn_panel_1"
                  >
                    <span className="text-xs uppercase tracking-wider font-bold text-red-200">
                      Cancel
                    </span>
                    <span className="text-[10px] text-red-300 font-medium">
                      {activeBets[1]?.status === 'queued' ? 'Wait Next Round' : 'Waiting...'}
                    </span>
                    <span className="text-sm sm:text-base font-bold font-sans text-white mt-0.5">
                      {activeBets[1].amount.toFixed(2)} INR
                    </span>
                  </button>
                ) : (
                  /* Standard Green "Bet" Button */
                  <button
                    type="button"
                    onClick={() => handleBetClick(1)}
                    disabled={balance < panel2.amount}
                    className="w-full h-full min-h-[74px] bg-[#28a745] hover:bg-[#2cb742] active:bg-[#23923d] active:scale-[0.98] disabled:opacity-40 text-white rounded-2xl flex flex-col items-center justify-center leading-tight shadow-md transition-all border border-[#4ade80]/30 cursor-pointer"
                    id="bet_btn_panel_1"
                  >
                    <span className="text-lg sm:text-xl font-bold font-sans tracking-normal text-white">
                      {gameState === 'flying' ? 'Wait Next' : 'Bet'}
                    </span>
                    <span className="text-base sm:text-lg font-black font-sans tracking-tight text-white mt-0.5">
                      {panel2.amount.toFixed(2)} INR
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Auto Cashout Controls when "Auto" tab selected */}
            {panel2Mode === 'auto' && (
              <div className="mt-2 pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleAutoCash(1)}
                    className={`w-7 h-3.5 rounded-full p-0.5 transition duration-200 cursor-pointer ${
                      panel2.autoCash ? 'bg-emerald-500' : 'bg-zinc-700'
                    }`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform ${panel2.autoCash ? 'translate-x-3.5' : 'translate-x-0'}`} />
                  </button>
                  <span className="text-[10px] font-bold text-zinc-300">Auto Cash Out</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={!panel2.autoCash}
                    onClick={() => stepAutoCashMult(1, -0.1)}
                    className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center font-mono font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-white px-1.5 py-0.5 bg-zinc-900 rounded border border-zinc-800 text-[10px]">
                    {panel2.autoCashMult.toFixed(2)}x
                  </span>
                  <button
                    type="button"
                    disabled={!panel2.autoCash}
                    onClick={() => stepAutoCashMult(1, 0.1)}
                    className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center font-mono font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* If Panel 2 is hidden, show a button to add it back */}
        {!panel2Visible && (
          <button
            type="button"
            onClick={() => setPanel2Visible(true)}
            className="w-full py-2 px-3 bg-zinc-900/60 hover:bg-zinc-850 border border-dashed border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <PlusSquare className="w-3.5 h-3.5 text-red-500" />
            <span>Add Second Bet Panel</span>
          </button>
        )}
      </div>

      {/* History Modal when clicking the (···) button */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Round Multipliers
              </h4>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center font-black"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto pr-1">
              {recentMultipliers.map((r, idx) => (
                <div
                  key={`hist-${idx}`}
                  className={`text-center py-1.5 rounded-lg border font-mono font-bold text-xs ${getMultiplierStyle(r.multiplier)}`}
                >
                  {r.multiplier.toFixed(2)}x
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
