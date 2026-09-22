import React, { useState } from 'react';
import { X, Lock, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';

interface AdminAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminAccessModal({
  isOpen,
  onClose,
  onSuccess
}: AdminAccessModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPin = pin.trim();
    // Default Operator PINs: 8765 or 1234
    if (cleanPin === '8765' || cleanPin === '1234') {
      sessionStorage.setItem('aviator_admin_auth', 'true');
      setPin('');
      onSuccess();
    } else {
      setError('Invalid Operator PIN. Please try again.');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
      id="admin_access_modal_overlay"
    >
      <div 
        className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-6 text-center space-y-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        id="admin_access_modal_card"
      >
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Lock className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Operator Portal</h3>
              <p className="text-[10px] text-zinc-400">Restricted Management Section</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-300 text-left">
          Enter the operator PIN to access the dedicated Aviator management dashboard, payout approvals, and game settings.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div className="space-y-1 text-left">
            <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
              Security PIN
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="password"
                maxLength={6}
                autoFocus
                placeholder="Enter 4-digit PIN (8765)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono tracking-widest outline-none placeholder-zinc-700"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 font-medium bg-red-950/40 p-2 rounded-lg border border-red-500/30 text-left">
              ⚠️ {error}
            </p>
          )}

          <div className="pt-1">
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-purple-950/50 transition active:scale-95 cursor-pointer"
              id="admin_access_submit_btn"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Unlock Operator Panel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-850 text-left">
          <p className="text-[10px] text-zinc-500 font-mono">
            Default Master PIN: <span className="text-purple-400 font-bold">8765</span> or <span className="text-purple-400 font-bold">1234</span>
          </p>
        </div>
      </div>
    </div>
  );
}
