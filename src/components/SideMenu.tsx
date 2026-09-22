import React, { useState } from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Music, 
  Sparkles, 
  Gift, 
  History, 
  Info, 
  HelpCircle, 
  BookOpen, 
  ShieldCheck, 
  Settings, 
  Check, 
  ExternalLink,
  User,
  LogIn
} from 'lucide-react';
import { GameSettings, Bet, UserAccount } from '../types';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  betHistory: Bet[];
  currentUser?: UserAccount | null;
  onOpenAuth?: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onToggleAnimation: () => void;
  onOpenModal: (modalType: 'how_to_play' | 'rules' | 'limits' | 'free_bets' | 'provably_fair') => void;
  onSwitchView: (view: 'game' | 'admin') => void;
  activeView: 'game' | 'admin';
  onOpenTelegramSupport?: () => void;
  onOpenAdminAccess?: () => void;
}

export default function SideMenu({
  isOpen,
  onClose,
  settings,
  betHistory,
  currentUser,
  onOpenAuth,
  onToggleSound,
  onToggleMusic,
  onToggleAnimation,
  onOpenModal,
  onSwitchView,
  activeView,
  onOpenTelegramSupport,
  onOpenAdminAccess
}: SideMenuProps) {
  const [showHistory, setShowHistory] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end" id="side_menu_overlay" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Slide-out Panel */}
      <div 
        className="relative w-full max-w-[300px] sm:max-w-xs h-full bg-zinc-950 border-l border-zinc-850 flex flex-col shadow-2xl animate-slide-left overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        id="side_menu_container"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-850 bg-zinc-900">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-red-600/10 text-red-500">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5l8 2.5z" />
              </svg>
            </span>
            <span className="font-sans font-black tracking-tight text-white uppercase text-sm">
              Aviator 100x
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Menu Options Scroll Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          
          {/* User Account / Authentication Card */}
          <div className="p-3.5 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-2" id="side_menu_auth_card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white leading-tight">
                    {currentUser ? currentUser.mobileNumber : 'Guest Player'}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {currentUser ? 'Active Gaming Account' : 'Login to save balance'}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onOpenAuth) onOpenAuth();
                onClose();
              }}
              className="w-full py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition shadow shadow-red-950/50 cursor-pointer"
              id="side_menu_login_btn"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{currentUser ? 'Manage Account' : 'Log In / Sign Up'}</span>
            </button>
          </div>

          {/* Live Telegram 24/7 Support Card */}
          <div className="p-3.5 bg-gradient-to-r from-[#0088cc]/20 to-sky-950/30 border border-[#0088cc]/40 rounded-xl space-y-2.5 shadow-lg shadow-[#0088cc]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[#0088cc] flex items-center justify-center text-white">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                </div>
                <span className="text-[11px] font-black text-white uppercase tracking-wider">LIVE TELEGRAM SUPPORT</span>
              </div>
              <span className="flex items-center gap-1 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>

            <div className="flex items-center justify-between bg-black/60 px-3 py-2 rounded-lg border border-zinc-800">
              <span className="text-xs font-mono font-bold text-sky-400">@lottaygent</span>
              <span className="text-[10px] text-zinc-500 font-sans">24/7 Agent</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  if (onOpenTelegramSupport) {
                    onOpenTelegramSupport();
                  } else {
                    window.open('https://t.me/lottaygent', '_blank', 'noopener,noreferrer');
                  }
                  onClose();
                }}
                className="py-1.5 px-2 bg-[#0088cc] hover:bg-[#0077b5] text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 transition cursor-pointer shadow"
              >
                <span>Open Chat</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('@lottaygent');
                  alert('Telegram ID @lottaygent copied to clipboard!');
                }}
                className="py-1.5 px-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-750 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Copy ID</span>
              </button>
            </div>
          </div>

          {/* Quick Access Admin Console */}
          <div className="p-3 bg-gradient-to-r from-purple-950/40 to-pink-950/20 border border-purple-900/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">SYSTEM MANAGEMENT</span>
              <span className="text-[9px] font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 px-1.5 py-0.2 rounded-full">OPERATOR</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Access the payment gateway ledger, force RNG multipliers, and view total margins.
            </p>
            <button
              onClick={() => {
                onSwitchView(activeView === 'admin' ? 'game' : 'admin');
                onClose();
              }}
              className="w-full mt-1.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              {activeView === 'admin' ? 'Back to Game Board' : 'Open Admin Panel'}
            </button>
          </div>

          {/* Quick Settings Group */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-1">Game Configuration</h4>
            
            {/* Sound Toggle */}
            <button 
              onClick={onToggleSound}
              className="w-full flex items-center justify-between p-2.5 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850/60 rounded-xl text-xs text-zinc-300 transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-red-500" /> : <VolumeX className="w-4 h-4 text-zinc-600" />}
                Sound Effects
              </span>
              <span className="text-[10px] font-mono font-bold uppercase text-zinc-500">
                {settings.soundEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Music Toggle */}
            <button 
              onClick={onToggleMusic}
              className="w-full flex items-center justify-between p-2.5 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850/60 rounded-xl text-xs text-zinc-300 transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Music className={`w-4 h-4 ${settings.musicEnabled ? 'text-purple-400 animate-pulse' : 'text-zinc-600'}`} />
                Background Beats
              </span>
              <span className="text-[10px] font-mono font-bold uppercase text-zinc-500">
                {settings.musicEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Particle Animation Toggle */}
            <button 
              onClick={onToggleAnimation}
              className="w-full flex items-center justify-between p-2.5 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850/60 rounded-xl text-xs text-zinc-300 transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Sparkles className={`w-4 h-4 ${settings.animationEnabled ? 'text-amber-400' : 'text-zinc-600'}`} />
                Atmospheric Particles
              </span>
              <span className="text-[10px] font-mono font-bold uppercase text-zinc-500">
                {settings.animationEnabled ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          {/* Core Info Modals */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-1">Resources & Rules</h4>

            <button
              onClick={() => { onOpenModal('how_to_play'); onClose(); }}
              className="w-full flex items-center gap-2.5 p-2.5 bg-zinc-900/30 hover:bg-zinc-900 text-zinc-300 hover:text-white text-xs rounded-xl transition text-left cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-zinc-500 shrink-0" />
              How To Play Guide
            </button>

            <button
              onClick={() => { onOpenModal('rules'); onClose(); }}
              className="w-full flex items-center gap-2.5 p-2.5 bg-zinc-900/30 hover:bg-zinc-900 text-zinc-300 hover:text-white text-xs rounded-xl transition text-left cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-zinc-500 shrink-0" />
              Official Game Rules
            </button>

            <button
              onClick={() => { onOpenModal('limits'); onClose(); }}
              className="w-full flex items-center gap-2.5 p-2.5 bg-zinc-900/30 hover:bg-zinc-900 text-zinc-300 hover:text-white text-xs rounded-xl transition text-left cursor-pointer"
            >
              <Info className="w-4 h-4 text-zinc-500 shrink-0" />
              Wagering Limits
            </button>

            <button
              onClick={() => { onOpenModal('free_bets'); onClose(); }}
              className="w-full flex items-center justify-between p-2.5 bg-zinc-900/30 hover:bg-zinc-900 text-zinc-300 hover:text-white text-xs rounded-xl transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Gift className="w-4 h-4 text-amber-500 shrink-0" />
                Claim Free Bets
              </span>
              {!settings.freeBetClaimed && (
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-amber-500 text-zinc-950 rounded">FREE ₹500</span>
              )}
            </button>

            <button
              onClick={() => { onOpenModal('provably_fair'); onClose(); }}
              className="w-full flex items-center gap-2.5 p-2.5 bg-zinc-900/30 hover:bg-zinc-900 text-zinc-300 hover:text-white text-xs rounded-xl transition text-left cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              Provably Fair Settings
            </button>
          </div>

          {/* Collapsible Bet History Section */}
          <div className="border-t border-zinc-900 pt-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between px-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                My Session Bets ({betHistory.length})
              </span>
              <span>{showHistory ? 'Collapse' : 'Expand'}</span>
            </button>

            {showHistory && (
              <div className="mt-2 space-y-2 overflow-y-auto max-h-56 pr-1" id="side_menu_bets_list">
                {betHistory.length === 0 ? (
                  <p className="text-[11px] text-zinc-600 italic text-center py-4">No bets logged this session</p>
                ) : (
                  betHistory.slice().reverse().map((bet, idx) => (
                    <div 
                      key={`${bet.id}-${idx}`} 
                      className={`p-2.5 rounded-lg border text-[11px] font-mono flex items-center justify-between ${
                        bet.status === 'cashed_out' 
                          ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' 
                          : bet.status === 'crashed' 
                          ? 'bg-red-950/10 border-red-950/20 text-red-400/80' 
                          : 'bg-zinc-900/40 border-zinc-850 text-zinc-500'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-zinc-300 font-bold">₹{bet.amount}</div>
                        <div className="text-[9px] text-zinc-500">
                          {new Date(bet.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                        </div>
                      </div>
                      <div className="text-right space-y-0.5">
                        {bet.status === 'cashed_out' ? (
                          <>
                            <div className="font-bold">+{bet.cashedOutMultiplier?.toFixed(2)}x</div>
                            <div className="text-[10px] text-emerald-500">₹{bet.winAmount?.toFixed(2)}</div>
                          </>
                        ) : bet.status === 'crashed' ? (
                          <>
                            <div>CRASH</div>
                            <div className="text-[9px] text-zinc-600">₹0.00</div>
                          </>
                        ) : (
                          <div>PENDING</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

        </div>

        {/* Footer info */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-850 text-center space-y-1">
          <button
            type="button"
            onClick={() => {
              if (onOpenAdminAccess) onOpenAdminAccess();
              onClose();
            }}
            className="text-[10px] font-mono text-zinc-600 hover:text-zinc-400 transition cursor-pointer"
            title="Operator Management Portal"
            id="sidemenu_operator_portal_link"
          >
            Aviator 100x • Version 1.0.4
          </button>
          <p className="text-[9px] text-zinc-700 leading-tight">
            Certified secure Provably Fair system. Responsible playing only.
          </p>
        </div>
      </div>
    </div>
  );
}
