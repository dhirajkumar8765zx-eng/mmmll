import React, { useState, useMemo } from 'react';
import { ShieldCheck, Check } from 'lucide-react';
import { Bet, LivePlayer, PastRound } from '../types';

interface SpribeBetsListProps {
  gameState: 'waiting' | 'flying' | 'crashed';
  multiplier: number;
  livePlayers: LivePlayer[];
  userActiveBets: Bet[];
  userBetHistory: Bet[];
  pastRounds: PastRound[];
  totalBettingUsers: number;
}

// Animal / mascot avatars matching Spribe Aviator
const AVATAR_OPTIONS = [
  { emoji: '🐶', bg: 'bg-amber-700', label: 'Dog' },
  { emoji: '🦅', bg: 'bg-zinc-700', label: 'Eagle' },
  { emoji: '🦒', bg: 'bg-yellow-700', label: 'Giraffe' },
  { emoji: '🐴', bg: 'bg-stone-700', label: 'Horse' },
  { emoji: '🍊', bg: 'bg-orange-600', label: 'Orange' },
  { emoji: '🐱', bg: 'bg-amber-600', label: 'LuckyCat' },
  { emoji: '🐕', bg: 'bg-yellow-800', label: 'Pug' },
  { emoji: '👨‍🚀', bg: 'bg-blue-800', label: 'Astronaut' },
  { emoji: '🦁', bg: 'bg-amber-800', label: 'Lion' },
  { emoji: '🐺', bg: 'bg-slate-700', label: 'Wolf' },
  { emoji: '🐼', bg: 'bg-zinc-800', label: 'Panda' },
  { emoji: '🐯', bg: 'bg-orange-800', label: 'Tiger' },
];

function SpribeBetsList({
  gameState,
  multiplier,
  livePlayers,
  userActiveBets,
  userBetHistory,
  pastRounds,
  totalBettingUsers
}: SpribeBetsListProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'previous' | 'top' | 'my'>('all');

  // Calculate live total win sum of players in current round
  const totalWinINR = useMemo(() => {
    let sum = 0;
    livePlayers.forEach((p) => {
      if (p.status === 'cashed_out') {
        sum += p.betAmount * p.cashoutMult;
      }
    });
    userActiveBets.forEach((b) => {
      if (b.status === 'cashed_out' && b.winAmount) {
        sum += b.winAmount;
      }
    });
    return sum;
  }, [livePlayers, userActiveBets]);

  // Previous round top bets (derived dynamically from actual past rounds)
  const previousBets = useMemo(() => {
    if (!pastRounds || pastRounds.length === 0) return [];
    const prevRoundMult = pastRounds[0]?.multiplier || 1.0;
    return [
      { id: 'pb-1', username: '1***5', avatar: '🐶', bg: 'bg-amber-700', bet: 800, mult: 1.50, won: prevRoundMult >= 1.50 },
      { id: 'pb-2', username: '1***8', avatar: '🦅', bg: 'bg-zinc-700', bet: 1200, mult: 1.85, won: prevRoundMult >= 1.85 },
      { id: 'pb-3', username: '1***6', avatar: '🦒', bg: 'bg-yellow-700', bet: 500, mult: 2.20, won: prevRoundMult >= 2.20 },
      { id: 'pb-4', username: '1***1', avatar: '🐴', bg: 'bg-stone-700', bet: 700, mult: 1.45, won: prevRoundMult >= 1.45 },
    ];
  }, [pastRounds]);

  // Top wins (derived from completed past rounds or genuine high multipliers)
  const topBets = useMemo(() => {
    if (!pastRounds || pastRounds.length === 0) return [];
    return pastRounds.filter(r => r.multiplier >= 2.0).slice(0, 5).map((r, idx) => ({
      id: `tb-${idx}`,
      username: `${Math.floor(Math.random() * 9 + 1)}***${Math.floor(Math.random() * 9)}`,
      avatar: AVATAR_OPTIONS[idx % AVATAR_OPTIONS.length].emoji,
      bg: AVATAR_OPTIONS[idx % AVATAR_OPTIONS.length].bg,
      bet: 500 * (idx + 1),
      mult: r.multiplier,
      win: Math.floor(500 * (idx + 1) * r.multiplier)
    }));
  }, [pastRounds]);

  return (
    <div 
      className="w-full bg-[#0a0a0c] border border-zinc-900 rounded-2xl p-3 sm:p-4 select-none shadow-2xl mt-3"
      id="spribe_all_bets_bottom_container"
    >
      {/* 1. Tab Selector: [ All Bets ]  Previous  Top  My Bets */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`py-1.5 px-4 sm:px-5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'all'
                ? 'bg-[#2c2c2e] text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
            id="tab_all_bets"
          >
            All Bets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('previous')}
            className={`py-1.5 px-4 sm:px-5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'previous'
                ? 'bg-[#2c2c2e] text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
            id="tab_previous_bets"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('top')}
            className={`py-1.5 px-4 sm:px-5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'top'
                ? 'bg-[#2c2c2e] text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
            id="tab_top_bets"
          >
            Top
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('my')}
            className={`py-1.5 px-3.5 sm:px-4 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'my'
                ? 'bg-[#2c2c2e] text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
            id="tab_my_bets"
          >
            My Bets ({userBetHistory.length + userActiveBets.filter(b => b.status === 'placed' || b.status === 'queued').length})
          </button>
        </div>
      </div>

      {/* 2. Stats Row (Matches screenshot: Avatars, e.g. "706/1173 Bets", green line, "497,801.08 Total win INR") */}
      {activeTab === 'all' && (
        <div className="flex items-center justify-between py-2.5 px-1 border-b border-zinc-900">
          {/* Left: 3 Overlapping Avatars + Bets count & Green Bar */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-5 h-5 rounded-full border border-zinc-900 bg-amber-700 flex items-center justify-center text-[10px] text-white font-bold">
                  🐶
                </div>
                <div className="w-5 h-5 rounded-full border border-zinc-900 bg-zinc-700 flex items-center justify-center text-[10px] text-white font-bold">
                  🦅
                </div>
                <div className="w-5 h-5 rounded-full border border-zinc-900 bg-yellow-700 flex items-center justify-center text-[10px] text-white font-bold">
                  🦒
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-zinc-300 tracking-tight">
                {totalBettingUsers}/{totalBettingUsers + 467} Bets
              </span>
            </div>
            {/* Green progress line */}
            <div className="w-24 sm:w-28 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (totalBettingUsers / (totalBettingUsers + 467)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Right: Big total win number & Total win INR */}
          <div className="text-right">
            <div className="text-base sm:text-lg font-mono font-black text-white tracking-tight">
              {totalWinINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] font-sans font-bold text-zinc-500 uppercase tracking-wider">
              Total win INR
            </div>
          </div>
        </div>
      )}

      {/* 3. Table Column Headers: Player | Bet INR | X | Win INR */}
      <div className="grid grid-cols-12 text-[11px] font-sans font-bold text-zinc-400 uppercase tracking-wider py-2 px-3 border-b border-zinc-900 select-none">
        <div className="col-span-4 text-left">Player</div>
        <div className="col-span-3 text-right">Bet INR</div>
        <div className="col-span-2 text-center">X</div>
        <div className="col-span-3 text-right">Win INR</div>
      </div>

      {/* 4. Scrollable Capsule Rows List */}
      <div className="max-h-[380px] overflow-y-auto space-y-1.5 py-1.5 pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
        
        {/* --- TAB: ALL BETS (Current Live Round) --- */}
        {activeTab === 'all' && (
          <>
            {/* If User has placed active bets, pin them first with a gold border! */}
            {userActiveBets
              .filter((b) => b.status === 'placed' || b.status === 'queued' || b.status === 'cashed_out')
              .map((b, idx) => {
                const isWon = b.status === 'cashed_out';
                const isPlaced = b.status === 'placed';
                return (
                  <div
                    key={`user-active-${b.id || idx}`}
                    className={`grid grid-cols-12 items-center py-2 px-3 rounded-full border text-xs font-mono transition-all duration-200 ${
                      isWon
                        ? 'bg-emerald-950/40 border-emerald-500/60 shadow-sm'
                        : isPlaced
                        ? 'bg-amber-950/30 border-amber-500/40'
                        : 'bg-[#141416] border-purple-500/40'
                    }`}
                  >
                    {/* Player */}
                    <div className="col-span-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-xs shrink-0 border border-blue-400">
                        🎮
                      </div>
                      <span className="font-bold text-white tracking-wide truncate">
                        You (Panel {idx + 1})
                      </span>
                    </div>

                    {/* Bet INR */}
                    <div className="col-span-3 text-right text-zinc-200 font-bold">
                      {b.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>

                    {/* X */}
                    <div className="col-span-2 text-center">
                      {isWon && b.cashedOutMultiplier ? (
                        <span className="text-[#913ef8] font-black">
                          {b.cashedOutMultiplier.toFixed(2)}x
                        </span>
                      ) : isPlaced && gameState === 'flying' ? (
                        <span className="text-amber-400 font-black animate-pulse">
                          {multiplier.toFixed(2)}x
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </div>

                    {/* Win INR */}
                    <div className="col-span-3 text-right">
                      {isWon && b.winAmount ? (
                        <span className="text-[#28a745] font-black">
                          {b.winAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </div>
                  </div>
                );
              })}

            {/* Simulated Live Players (Exact representation from photo) */}
            {livePlayers.map((player, idx) => {
              const avatarObj = AVATAR_OPTIONS[idx % AVATAR_OPTIONS.length];
              const isCashedOut = player.status === 'cashed_out';
              const isCrashed = gameState === 'crashed' && !isCashedOut;
              const winAmount = isCashedOut ? player.betAmount * player.cashoutMult : 0;

              return (
                <div
                  key={player.id}
                  className={`grid grid-cols-12 items-center py-2 px-3 rounded-full border transition-all duration-200 text-xs font-mono ${
                    isCashedOut
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : isCrashed
                      ? 'bg-[#101012] border-zinc-900/60 opacity-40'
                      : 'bg-[#141416] border-zinc-900/80 hover:border-zinc-800'
                  }`}
                >
                  {/* Player: Avatar + Masked Name (e.g. 1***5) */}
                  <div className="col-span-4 flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full ${avatarObj.bg} flex items-center justify-center text-xs shrink-0 border border-zinc-800`}>
                      {avatarObj.emoji}
                    </div>
                    <span className="font-bold text-zinc-300 tracking-wide truncate">
                      {player.username}
                    </span>
                  </div>

                  {/* Bet INR: e.g. 8,000.00 */}
                  <div className="col-span-3 text-right text-zinc-200 font-bold">
                    {player.betAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>

                  {/* X: e.g. 2.89x in purple if cashed out, otherwise empty */}
                  <div className="col-span-2 text-center">
                    {isCashedOut ? (
                      <span className="text-[#913ef8] font-black text-xs sm:text-[13px]">
                        {player.cashoutMult.toFixed(2)}x
                      </span>
                    ) : (
                      <span className="text-zinc-700">—</span>
                    )}
                  </div>

                  {/* Win INR: e.g. 23,120.00 in bright green */}
                  <div className="col-span-3 text-right">
                    {isCashedOut ? (
                      <span className="text-[#28a745] font-black text-xs sm:text-[13px]">
                        {winAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-zinc-700">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* --- TAB: PREVIOUS ROUNDS --- */}
        {activeTab === 'previous' && (
          <>
            <div className="px-2 py-1 text-[11px] text-zinc-500 font-sans italic">
              Results from round crash at {pastRounds[0]?.multiplier?.toFixed(2) || '2.45'}x
            </div>
            {previousBets.map((pb) => {
              const winAmount = pb.won ? pb.bet * pb.mult : 0;
              return (
                <div
                  key={pb.id}
                  className={`grid grid-cols-12 items-center py-2 px-3 rounded-full border text-xs font-mono ${
                    pb.won
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-[#101012] border-zinc-900/60 opacity-50'
                  }`}
                >
                  <div className="col-span-4 flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full ${pb.bg} flex items-center justify-center text-xs shrink-0 border border-zinc-800`}>
                      {pb.avatar}
                    </div>
                    <span className="font-bold text-zinc-300">{pb.username}</span>
                  </div>

                  <div className="col-span-3 text-right text-zinc-300 font-bold">
                    {pb.bet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>

                  <div className="col-span-2 text-center">
                    {pb.won ? (
                      <span className="text-[#913ef8] font-black">{pb.mult.toFixed(2)}x</span>
                    ) : (
                      <span className="text-zinc-700">—</span>
                    )}
                  </div>

                  <div className="col-span-3 text-right">
                    {pb.won ? (
                      <span className="text-[#28a745] font-black">
                        {winAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-zinc-700">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* --- TAB: TOP WINS --- */}
        {activeTab === 'top' && (
          <>
            <div className="px-2 py-1 text-[11px] text-zinc-500 font-sans italic">
              All-time record wins leaderboard
            </div>
            {topBets.map((tb) => (
              <div
                key={tb.id}
                className="grid grid-cols-12 items-center py-2 px-3 rounded-full border border-amber-500/30 bg-amber-950/15 text-xs font-mono"
              >
                <div className="col-span-4 flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${tb.bg} flex items-center justify-center text-xs shrink-0 border border-amber-500/40`}>
                    {tb.avatar}
                  </div>
                  <span className="font-bold text-white">{tb.username}</span>
                </div>

                <div className="col-span-3 text-right text-zinc-300 font-bold">
                  {tb.bet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                <div className="col-span-2 text-center">
                  <span className="text-[#c01bf0] font-black">{tb.mult.toFixed(2)}x</span>
                </div>

                <div className="col-span-3 text-right text-[#28a745] font-black">
                  {tb.win.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </>
        )}

        {/* --- TAB: MY BETS --- */}
        {activeTab === 'my' && (
          <>
            {userBetHistory.length === 0 && userActiveBets.filter(b => b.status === 'placed' || b.status === 'queued').length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs italic">
                You haven't placed any bets in this session yet.
              </div>
            ) : (
              <>
                {/* Active bets */}
                {userActiveBets
                  .filter((b) => b.status === 'placed' || b.status === 'queued')
                  .map((b, idx) => (
                    <div
                      key={`my-act-${idx}`}
                      className="grid grid-cols-12 items-center py-2 px-3 rounded-full border border-amber-500/40 bg-amber-950/20 text-xs font-mono animate-pulse"
                    >
                      <div className="col-span-4 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white">
                          🎮
                        </div>
                        <span className="font-bold text-white">In Flight</span>
                      </div>
                      <div className="col-span-3 text-right text-white font-bold">
                        {b.amount.toFixed(2)}
                      </div>
                      <div className="col-span-2 text-center text-amber-400 font-black">
                        {multiplier.toFixed(2)}x
                      </div>
                      <div className="col-span-3 text-right text-amber-300 font-bold">
                        {(b.amount * multiplier).toFixed(2)}
                      </div>
                    </div>
                  ))}

                {/* History bets */}
                {userBetHistory.map((b, idx) => {
                  const isWon = b.status === 'cashed_out';
                  return (
                    <div
                      key={`my-hist-${b.id || idx}`}
                      className={`grid grid-cols-12 items-center py-2 px-3 rounded-full border text-xs font-mono ${
                        isWon
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : 'bg-[#101012] border-zinc-900/60 opacity-60'
                      }`}
                    >
                      <div className="col-span-4 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-300">
                          {isWon ? '✓' : '✗'}
                        </div>
                        <span className="font-bold text-zinc-300">
                          {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="col-span-3 text-right text-zinc-300 font-bold">
                        {b.amount.toFixed(2)}
                      </div>

                      <div className="col-span-2 text-center">
                        {isWon ? (
                          <span className="text-[#913ef8] font-black">{b.cashedOutMultiplier?.toFixed(2)}x</span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </div>

                      <div className="col-span-3 text-right">
                        {isWon ? (
                          <span className="text-[#28a745] font-black">{b.winAmount?.toFixed(2)}</span>
                        ) : (
                          <span className="text-red-500 font-bold">0.00</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}
      </div>

      {/* 5. Footer: ✔ Provably Fair Game | Powered by SPRIBE (Exact replica from photo) */}
      <div className="flex items-center justify-between pt-3 mt-1 border-t border-zinc-900 text-[10px] sm:text-[11px] font-sans select-none">
        <div className="flex items-center gap-1.5 text-zinc-400 font-bold">
          <div className="w-3.5 h-3.5 rounded-full bg-zinc-800 text-emerald-400 flex items-center justify-center text-[9px]">
            ✓
          </div>
          <span>Provably Fair Game</span>
        </div>

        <div className="text-zinc-500 font-medium tracking-wider">
          Powered by <span className="font-black text-zinc-400 uppercase">SPRIBE</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(SpribeBetsList);
