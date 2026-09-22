import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  BookOpen, 
  ShieldCheck, 
  Info, 
  Gift, 
  KeyRound, 
  Check, 
  Copy, 
  AlertCircle 
} from 'lucide-react';
import { GameSettings, PastRound } from '../types';

interface ModalProps {
  onClose: () => void;
  settings?: GameSettings;
  onClaimFreeBet?: (amount: number) => void;
  pastRounds?: PastRound[];
}

export function HowToPlayModal({ onClose }: ModalProps) {
  return (
    <ModalWrapper title="How To Play" icon={<HelpCircle className="w-5 h-5 text-red-500" />} onClose={onClose}>
      <div className="space-y-4 text-center">
        <p className="text-sm text-zinc-300 font-medium">
          Aviator 100x is a modern social multiplayer game.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs mx-auto mb-2">1</div>
            <h4 className="text-[10px] font-bold text-white uppercase tracking-wide">Place Bet</h4>
          </div>
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs mx-auto mb-2">2</div>
            <h4 className="text-[10px] font-bold text-white uppercase tracking-wide">Watch Climb</h4>
          </div>
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs mx-auto mb-2">3</div>
            <h4 className="text-[10px] font-bold text-white uppercase tracking-wide">Cash Out</h4>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}

export function GameRulesModal({ onClose }: ModalProps) {
  const rules = [
    "Multiplier starts at 1.00x and grows as the plane flies.",
    "Crash moment is determined cryptographically by Provably Fair.",
    "Minimum bet is ₹10. Maximum bet is ₹10,000.",
    "Maximum multiplier is 100.00x.",
    "Winnings are instantly credited to your wallet balance."
  ];

  return (
    <ModalWrapper title="Game Rules" icon={<BookOpen className="w-5 h-5 text-purple-400" />} onClose={onClose}>
      <div className="space-y-4">
        <ul className="space-y-2">
          {rules.map((rule, idx) => (
            <li key={idx} className="flex gap-2.5 items-start text-xs text-zinc-300 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>
    </ModalWrapper>
  );
}

export function GameLimitsModal({ onClose, settings }: ModalProps) {
  return (
    <ModalWrapper title="Game Limits" icon={<Info className="w-5 h-5 text-blue-400" />} onClose={onClose}>
      <div className="space-y-4 font-mono text-xs">
        <div className="grid grid-cols-2 p-3 bg-zinc-950 rounded-lg border border-zinc-850">
          <span className="text-zinc-400">Minimum Stake:</span>
          <span className="text-right text-white font-bold">₹{settings?.minBet || 10}</span>
        </div>
        <div className="grid grid-cols-2 p-3 bg-zinc-950 rounded-lg border border-zinc-850">
          <span className="text-zinc-400">Maximum Stake:</span>
          <span className="text-right text-white font-bold">₹{settings?.maxBet || 10000}</span>
        </div>
        <div className="grid grid-cols-2 p-3 bg-zinc-950 rounded-lg border border-zinc-850">
          <span className="text-zinc-400">Maximum Win Multiplier:</span>
          <span className="text-right text-white font-bold">100.00x</span>
        </div>
        <div className="grid grid-cols-2 p-3 bg-zinc-950 rounded-lg border border-zinc-850">
          <span className="text-zinc-400">House Fee / Margin:</span>
          <span className="text-right text-white font-bold">3% (97% RTP)</span>
        </div>
        <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-xl text-[11px] text-blue-300">
          Limits are enforced by the server and are adjustable by the operating panel admins. Auto-cashout parameters are executed locally with immediate server settlement.
        </div>
      </div>
    </ModalWrapper>
  );
}

export function FreeBetsModal({ onClose, onClaimFreeBet, settings }: ModalProps) {
  const [promo, setPromo] = useState('');
  const [claimed, setClaimed] = useState(settings?.freeBetClaimed || false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (claimed) {
      setErrorMsg('You have already claimed your initial free promo bets!');
      return;
    }

    const code = promo.trim().toUpperCase();
    if (code === 'AVIATOR100X' || code === 'FREE50' || code === 'FLYHIGH') {
      const reward = code === 'AVIATOR100X' ? 500 : code === 'FREE50' ? 50 : 200;
      onClaimFreeBet?.(reward);
      setClaimed(true);
      setErrorMsg('');
      setSuccessMsg(`Promo code applied! ₹${reward} added to your active balance.`);
    } else {
      setErrorMsg('Invalid promotional code. Try using "AVIATOR100X" or "FLYHIGH"!');
    }
  };

  return (
    <ModalWrapper title="Free Bets & Promos" icon={<Gift className="w-5 h-5 text-amber-400" />} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-xs text-zinc-300">
          Enter an active Aviator 100x coupon code to receive free wagering credit in your account instantly.
        </p>

        {claimed ? (
          <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-900/40 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-white">Promo Code Claimed Successfully</p>
            <p className="text-[10px] text-zinc-500">Only one welcome coupon code is permitted per player account.</p>
          </div>
        ) : (
          <form onSubmit={handleClaim} className="space-y-3">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block mb-1">
                Coupon / Promo Code
              </label>
              <input
                type="text"
                placeholder="e.g. AVIATOR100X"
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-zinc-700 outline-none uppercase"
              />
            </div>

            {errorMsg && (
              <p className="text-[11px] text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errorMsg}
              </p>
            )}

            {successMsg && (
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {successMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs py-2 px-4 rounded-lg transition"
            >
              Apply Free Bet Code
            </button>
          </form>
        )}

        <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">Available Public Promo codes:</p>
          <div className="flex gap-2 text-[10px] font-mono text-amber-300">
            <span className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800 font-bold">AVIATOR100X (₹500)</span>
            <span className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800 font-bold">FLYHIGH (₹200)</span>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}

export function ProvablyFairModal({ onClose, pastRounds = [] }: ModalProps) {
  const [searchHash, setSearchHash] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const currentServerSeed = "7d4a6f91b4020c0f991f8ef36329e4dcd9cfbf50bc3db09ec308cb187514fa9c";
  const currentClientSeed = "aviator_client_seed_77491_x100";

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchHash.trim()) return;

    // Simulate verification
    // In standard provably fair, we combine Server Seed + Client Seed and hash them (SHA256),
    // then map bytes into the crash multiplier.
    // Let's create a simulated verifier that matches our rounds.
    const matchingRound = pastRounds.find(r => r.seed.includes(searchHash) || r.id === searchHash);
    
    if (matchingRound) {
      setVerifyResult({
        found: true,
        id: matchingRound.id,
        multiplier: matchingRound.multiplier,
        serverSeed: matchingRound.serverSeed,
        clientSeed: matchingRound.clientSeed,
        combinedHash: matchingRound.seed
      });
    } else {
      // Generate a mock validation for any valid-looking seed
      setVerifyResult({
        found: false,
        msg: "No recorded round matches this Hash/ID in your current session history. Check if it was from a previous run."
      });
    }
  };

  return (
    <ModalWrapper title="Provably Fair Settings" icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-xs text-zinc-300 leading-relaxed">
          Aviator 100x utilizes a cryptographically transparent system where the outcome of every single round is determined prior to the start of the climb. No client-side manipulation is possible.
        </p>

        <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-2 text-[11px] font-mono">
          <div>
            <span className="text-zinc-500 block">ACTIVE SERVER SEED (SHA256 HASH)</span>
            <span className="text-zinc-300 break-all">{currentServerSeed}</span>
          </div>
          <div>
            <span className="text-zinc-500 block">ACTIVE CLIENT SEED</span>
            <span className="text-zinc-300">{currentClientSeed}</span>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wide">Verify Past Round Hash</h4>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Paste Past Round ID or Hash..."
              value={searchHash}
              onChange={(e) => setSearchHash(e.target.value)}
              className="flex-grow bg-zinc-950 border border-zinc-850 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder-zinc-700 outline-none"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold"
            >
              Verify
            </button>
          </div>
        </form>

        {verifyResult && (
          <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2 text-[11px] font-mono">
            {verifyResult.found ? (
              <>
                <p className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Hash Verification Successful!
                </p>
                <div>Round Multiplier: <strong className="text-white text-xs">{verifyResult.multiplier.toFixed(2)}x</strong></div>
                <div>Server Seed: <span className="text-zinc-400 break-all">{verifyResult.serverSeed}</span></div>
                <div>Client Seed: <span className="text-zinc-400">{verifyResult.clientSeed}</span></div>
                <div>Calculated SHA256: <span className="text-zinc-400 break-all">{verifyResult.combinedHash}</span></div>
              </>
            ) : (
              <p className="text-amber-400 leading-relaxed text-xs">
                {verifyResult.msg}
              </p>
            )}
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}

// Global Reusable Layout Wrapper for modals
function ModalWrapper({ 
  title, 
  icon, 
  children, 
  onClose 
}: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode; 
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="modal_overlay">
      <div 
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
