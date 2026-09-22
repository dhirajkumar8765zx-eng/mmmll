import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  Wallet, 
  PlusCircle, 
  Plus,
  HelpCircle, 
  Settings, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle,
  ArrowUpRight,
  ChevronLeft,
  X,
  History,
  Users,
  Gamepad2,
  CreditCard,
  User
} from 'lucide-react';

import { Bet, DepositRequest, PastRound, GameSettings, GameStats, LivePlayer, WithdrawRequest, UserAccount } from './types';
import { audio } from './lib/audio';

import AviatorGame from './components/AviatorGame';
import SpribeBetsList from './components/SpribeBetsList';
import SideMenu from './components/SideMenu';
import AdminPanel from './components/AdminPanel';
import DepositModal from './components/DepositModal';
import WithdrawModal from './components/WithdrawModal';
import AuthModal from './components/AuthModal';
import AdminAccessModal from './components/AdminAccessModal';
import TelegramSupportModal, { TELEGRAM_SUPPORT_ID } from './components/TelegramSupportModal';
import {
  HowToPlayModal,
  GameRulesModal,
  GameLimitsModal,
  FreeBetsModal,
  ProvablyFairModal
} from './components/Modals';

// Clean live launch state: empty historical multipliers
const INITIAL_MULTIPLIERS: PastRound[] = [];

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: false,
  animationEnabled: true,
  freeBetClaimed: false,
  minBet: 10,
  maxBet: 10000,
  maxMultiplier: 100,
  upiId: 'babu0200@ybl',
  qrCodeUrl: '',
  telegramSupportId: '@lottaygent',
  instantApproval: false,
  initialWalletBalance: 0
};

const DEFAULT_STATS: GameStats = {
  totalRounds: 0,
  totalBetsPlaced: 0,
  totalWins: 0,
  totalVolume: 0,
  totalDeposits: 0
};

const BOT_POOL_NAMES = [
  '1***5', '1***8', '1***6', '1***1', '1***0', '1***4', '1***5', '1***1',
  '1***3', '9***2', '4***8', '7***0', '6***1', '3***9', '8***4', '2***7',
  '5***3', '2***9', '7***4', '8***1', '9***8', '3***2', '4***5', '6***8',
  '2***1', '5***9', '1***7', '9***0', '4***3', '7***6', '8***2', '6***4',
  '3***5', '2***8', '5***1', '9***4', '4***9', '7***2', '8***8', '6***7',
  '1***2', '9***5', '3***1', '7***7', '8***5', '4***1', '2***4', '5***8',
  '6***3', '9***1', '3***8', '1***9', '7***5', '4***6', '8***0', '5***2',
  '2***3', '6***9', '8***7', '3***4', '5***5', '9***7', '1***6', '4***2'
];

const BOT_BET_AMOUNTS = [
  8000, 7000, 6000, 5000, 4000, 3500, 3000, 2500, 2000, 1500, 1000, 800, 500, 400, 300, 200, 100, 50
];

const createSingleBotPlayer = (index: number): LivePlayer => {
  const name = BOT_POOL_NAMES[index % BOT_POOL_NAMES.length];
  const r = Math.random();
  let cashoutMult = 1.15;
  if (r < 0.35) {
    cashoutMult = 1.12 + Math.random() * 0.65;
  } else if (r < 0.65) {
    cashoutMult = 1.80 + Math.random() * 1.5;
  } else if (r < 0.85) {
    cashoutMult = 3.30 + Math.random() * 3.5;
  } else if (r < 0.95) {
    cashoutMult = 7.00 + Math.random() * 8.0;
  } else {
    cashoutMult = 15.00 + Math.random() * 25.0;
  }
  cashoutMult = Math.floor(cashoutMult * 100) / 100;
  const betAmount = BOT_BET_AMOUNTS[Math.floor(Math.random() * BOT_BET_AMOUNTS.length)];

  return {
    id: `lp-${index}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    username: name,
    betAmount,
    cashoutMult,
    status: 'idle'
  };
};

const generateInitialWaitingPlayers = (): LivePlayer[] => {
  // Start with 2 to 4 early bird bets placed right at the beginning of countdown
  const count = Math.floor(Math.random() * 3) + 2;
  const list: LivePlayer[] = [];
  for (let i = 0; i < count; i++) {
    list.push(createSingleBotPlayer(i));
  }
  return list;
};

export default function App() {
  // --- Persistent Storage Loading ---
  const [balance, setBalance] = useState<number>(() => {
    const isLiveInit = localStorage.getItem('aviator_live_initialized_v2');
    if (!isLiveInit) {
      // First time loading clean live launch: purge demo records & set 0 balance
      localStorage.setItem('aviator_live_initialized_v2', 'true');
      localStorage.removeItem('aviator_multipliers');
      localStorage.removeItem('aviator_stats');
      localStorage.removeItem('aviator_deposits');
      localStorage.removeItem('aviator_withdrawals');
      localStorage.removeItem('aviator_user_bets');
      localStorage.setItem('aviator_balance', '0');
      return 0;
    }
    const saved = localStorage.getItem('aviator_balance');
    return saved ? parseFloat(saved) : 0;
  });

  const [livePlayers, setLivePlayers] = useState<LivePlayer[]>(() => generateInitialWaitingPlayers());

  const [totalBettingUsers, setTotalBettingUsers] = useState<number>(() => {
    return Math.floor(Math.random() * 80) + 510; // start between 510 and 590
  });

  // Always persist balance to localStorage whenever it updates
  useEffect(() => {
    localStorage.setItem('aviator_balance', balance.toString());
  }, [balance]);

  // Dynamic fluctuation of active players count (increases and decreases over time around 500+)
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalBettingUsers((prev) => {
        const change = Math.floor(Math.random() * 9) - 4; // fluctuates by -4 to +4
        let next = prev + change;
        if (next < 500) {
          next += Math.floor(Math.random() * 5) + 1; // push back up above 500
        } else if (next > 650) {
          next -= Math.floor(Math.random() * 5) + 1; // cap upper limit
        }
        return next;
      });
    }, 2500); // update every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('aviator_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.upiId === 'aviator100x.operator@upi' || !parsed.upiId) {
          parsed.upiId = 'babu0200@ybl';
          localStorage.setItem('aviator_settings', JSON.stringify(parsed));
        }
        return parsed;
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [deposits, setDeposits] = useState<DepositRequest[]>(() => {
    const saved = localStorage.getItem('aviator_deposits');
    return saved ? JSON.parse(saved) : [];
  });

  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>(() => {
    const saved = localStorage.getItem('aviator_withdrawals');
    return saved ? JSON.parse(saved) : [];
  });

  const [recentMultipliers, setRecentMultipliers] = useState<PastRound[]>(() => {
    const saved = localStorage.getItem('aviator_multipliers');
    return saved ? JSON.parse(saved) : INITIAL_MULTIPLIERS;
  });

  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('aviator_stats');
    return saved ? JSON.parse(saved) : DEFAULT_STATS;
  });

  // --- Session & UI States ---
  const checkIsAdminRoute = () => {
    if (typeof window === 'undefined') return false;
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    return (
      hash.includes('admin') ||
      search.includes('admin') ||
      pathname.endsWith('/admin') ||
      pathname.includes('/admin/')
    );
  };

  const [activeView, setActiveView] = useState<'game' | 'admin'>(() => {
    if (checkIsAdminRoute() && sessionStorage.getItem('aviator_admin_auth') === 'true') {
      return 'admin';
    }
    return 'game';
  });
  const [adminAccessModalOpen, setAdminAccessModalOpen] = useState(false);

  useEffect(() => {
    const handleUrlCheck = () => {
      const isRouteAdmin = checkIsAdminRoute();
      if (isRouteAdmin) {
        if (sessionStorage.getItem('aviator_admin_auth') === 'true') {
          setActiveView('admin');
        } else {
          setAdminAccessModalOpen(true);
        }
      } else {
        setActiveView('game');
      }
    };

    handleUrlCheck();
    window.addEventListener('hashchange', handleUrlCheck);
    window.addEventListener('popstate', handleUrlCheck);
    return () => {
      window.removeEventListener('hashchange', handleUrlCheck);
      window.removeEventListener('popstate', handleUrlCheck);
    };
  }, []);

  const handleAdminAuthSuccess = () => {
    setAdminAccessModalOpen(false);
    setActiveView('admin');
    if (!checkIsAdminRoute()) {
      window.location.hash = 'admin';
    }
    showToast('Operator authorization verified. Welcome to Admin Terminal.', 'success');
  };

  const handleBackToGame = () => {
    setActiveView('game');
    if (window.location.hash.includes('admin')) {
      window.location.hash = '';
    }
    if (window.location.search.includes('admin') || window.location.pathname.includes('admin')) {
      history.replaceState(null, '', '/');
    }
  };

  const handleLogoutAdmin = () => {
    sessionStorage.removeItem('aviator_admin_auth');
    setActiveView('game');
    if (window.location.hash.includes('admin')) {
      window.location.hash = '';
    }
    if (window.location.search.includes('admin') || window.location.pathname.includes('admin')) {
      history.replaceState(null, '', '/');
    }
    showToast('Operator session locked.', 'info');
  };

  const [mobileTab, setMobileTab] = useState<'game' | 'live' | 'history'>('game');
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('aviator_user_account');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [telegramSupportOpen, setTelegramSupportOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'how_to_play' | 'rules' | 'limits' | 'free_bets' | 'provably_fair' | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  const handleLoginSuccess = (mobileNumber: string) => {
    const user: UserAccount = {
      mobileNumber,
      isLoggedIn: true,
      username: mobileNumber.slice(-4),
      createdAt: Date.now()
    };
    setCurrentUser(user);
    localStorage.setItem('aviator_user_account', JSON.stringify(user));
    showToast(`Welcome! Logged in as ${mobileNumber}`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('aviator_user_account');
    showToast('You have been logged out from your account.', 'info');
  };

  // --- Game Loop States ---
  const [gameState, setGameState] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const [multiplier, setMultiplier] = useState(1.00);
  const [countdown, setCountdown] = useState(6); // betting timer
  const [forcedMultiplier, setForcedMultiplier] = useState<number | null>(null);

  // Gradually place bot bets during waiting countdown (real-time live increasing count)
  useEffect(() => {
    if (gameState !== 'waiting') return;

    let botCounter = livePlayers.length;
    // Interval runs every 130ms: randomly places 1-2 bot bets gradually
    const botInterval = setInterval(() => {
      setLivePlayers((prev) => {
        // Stop adding once round reaches realistic high participation (~65 bots)
        if (prev.length >= 65) return prev;

        const toAdd = Math.random() < 0.7 ? 1 : 2;
        const newBots: LivePlayer[] = [];
        for (let i = 0; i < toAdd; i++) {
          newBots.push(createSingleBotPlayer(botCounter++));
        }
        return [...prev, ...newBots];
      });
    }, 130);

    return () => clearInterval(botInterval);
  }, [gameState]);

  // Scheduled bets that will run in the upcoming or active round
  const [activeBets, setActiveBets] = useState<Bet[]>([
    { id: 'b1', amount: 10, autoCashout: false, autoCashoutMultiplier: 2.0, status: 'idle', timestamp: Date.now() },
    { id: 'b2', amount: 10, autoCashout: false, autoCashoutMultiplier: 2.0, status: 'idle', timestamp: Date.now() }
  ]);

  // Persistent list of all user's previous bets during this session (with deduplication on load)
  const [userBetHistory, setUserBetHistory] = useState<Bet[]>(() => {
    const saved = localStorage.getItem('aviator_user_bets');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved) as Bet[];
      const seen = new Set<string>();
      return parsed.filter((b) => {
        if (!b || !b.id) return false;
        if (seen.has(b.id)) return false;
        seen.add(b.id);
        return true;
      });
    } catch {
      return [];
    }
  });

  // Track the actual crash trigger for the current flight
  const currentCrashValue = useRef<number>(2.5);
  const flightTime = useRef<number>(0);
  const loopRef = useRef<any>(null);
  const countdownRef = useRef<number>(6);
  const activeBetsRef = useRef<Bet[]>(activeBets);
  activeBetsRef.current = activeBets;
  const balanceRef = useRef<number>(balance);
  balanceRef.current = balance;
  const settingsRef = useRef<GameSettings>(settings);
  settingsRef.current = settings;
  const startFlightRef = useRef<() => void>(() => {});

  // Safe helper to append completed/crashed bets without duplicating keys
  const recordCompletedBets = (newBets: Bet[]) => {
    if (!newBets.length) return;
    setUserBetHistory((prev) => {
      const existingIds = new Set(prev.map((b) => b.id));
      const uniqueNew = newBets.filter((b) => !existingIds.has(b.id));
      return [...uniqueNew, ...prev];
    });
  };

  // --- Sync storage ---
  useEffect(() => {
    if (balance < 0) {
      setBalance(0);
      localStorage.setItem('aviator_balance', '0');
    } else {
      localStorage.setItem('aviator_balance', balance.toString());
    }
  }, [balance]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    localStorage.setItem('aviator_settings', JSON.stringify(settings));
    audio.setSoundEnabled(settings.soundEnabled);
    audio.setMusicEnabled(settings.musicEnabled);
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('aviator_deposits', JSON.stringify(deposits));
  }, [deposits]);

  useEffect(() => {
    localStorage.setItem('aviator_withdrawals', JSON.stringify(withdrawals));
  }, [withdrawals]);

  useEffect(() => {
    localStorage.setItem('aviator_multipliers', JSON.stringify(recentMultipliers));
  }, [recentMultipliers]);

  useEffect(() => {
    localStorage.setItem('aviator_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('aviator_user_bets', JSON.stringify(userBetHistory));
  }, [userBetHistory]);

  // Audio Context unlocker
  useEffect(() => {
    const unlock = () => {
      audio.init();
      window.removeEventListener('click', unlock);
    };
    window.addEventListener('click', unlock);
    return () => window.removeEventListener('click', unlock);
  }, []);

  // Trigger flight takeoff
  const startFlight = () => {
    flightTime.current = 0;
    setMultiplier(1.00);

    // Calculate this flight's crash point
    let crashPoint = 1.05;
    if (forcedMultiplier !== null) {
      crashPoint = forcedMultiplier;
      setForcedMultiplier(null); // clear forced multiplier after use
    } else {
      // Realistic Aviator distribution curve
      const r = Math.random();
      if (r < 0.03) {
        crashPoint = 1.00; // instant crash!
      } else {
        crashPoint = Math.floor(100 * (0.97 / (1.0 - r * 0.95))) / 100;
      }
    }
    
    // Safety cap
    currentCrashValue.current = Math.max(1.00, Math.min(crashPoint, settingsRef.current.maxMultiplier));

    // Resolve scheduled/queued bets to active status and deduct balance
    let totalDeduction = 0;
    let tempBalance = balanceRef.current;
    const currentBets = activeBetsRef.current;
    const resolvedBets = currentBets.map((bet) => {
      if (bet.status === 'placed' || bet.status === 'queued') {
        if (tempBalance >= bet.amount) {
          tempBalance -= bet.amount;
          totalDeduction += bet.amount;
          return {
            ...bet,
            status: 'placed' as const,
            roundId: `R-${Math.floor(Math.random() * 90000 + 10000)}`,
            timestamp: Date.now()
          };
        } else {
          // Insufficient funds, cancel bet and revert to idle
          return {
            ...bet,
            status: 'idle' as const
          };
        }
      }
      return bet;
    });

    activeBetsRef.current = resolvedBets;
    setActiveBets(resolvedBets);

    if (totalDeduction > 0) {
      setBalance((b) => Math.max(0, b - totalDeduction));
      const acceptedCount = resolvedBets.filter((b, idx) => b.status === 'placed' && (currentBets[idx].status === 'placed' || currentBets[idx].status === 'queued')).length;
      setStats((s) => ({
        ...s,
        totalBetsPlaced: s.totalBetsPlaced + acceptedCount,
        totalVolume: s.totalVolume + totalDeduction
      }));
    }

    setGameState('flying');
    setLivePlayers((prev) => prev.map((p) => ({ ...p, status: 'in_flight' })));
    audio.startFlightSound(1.00);
  };
  startFlightRef.current = startFlight;

  // --- Main Core Loop (Runs continuously, every 50ms) ---
  useEffect(() => {
    const TICK_RATE = 50; // ms

    loopRef.current = setInterval(() => {
      if (gameState === 'waiting') {
        // Countdown mode
        countdownRef.current -= 1;
        if (countdownRef.current <= 0) {
          countdownRef.current = 6;
          setCountdown(6);
          // Trigger flight takeoff with latest state refs
          startFlightRef.current();
        } else {
          setCountdown(countdownRef.current);
          audio.playTick();
        }
      } else if (gameState === 'flying') {
        // Flying climbing mode
        flightTime.current += TICK_RATE / 1000;
        
        // Exponent climb equation
        const nextMult = 1.00 + Math.pow(flightTime.current, 2) * 0.05;
        
        if (nextMult >= currentCrashValue.current) {
          // Plane Crashed / Flew away!
          triggerCrash();
        } else {
          setMultiplier(nextMult);
          audio.updateFlightSound(nextMult);

          // Evaluate Auto-Cashout limits for active bets
          const currentBets = activeBetsRef.current;
          const eligibleBets = currentBets.filter(
            (bet) => bet.status === 'placed' && bet.autoCashout && nextMult >= bet.autoCashoutMultiplier
          );

          if (eligibleBets.length > 0) {
            let totalCashoutWin = 0;
            const completedList: Bet[] = [];
            const nextActiveBets = currentBets.map((bet) => {
              if (bet.status === 'placed' && bet.autoCashout && nextMult >= bet.autoCashoutMultiplier) {
                const winAmt = bet.amount * bet.autoCashoutMultiplier;
                totalCashoutWin += winAmt;
                const completedBet: Bet = {
                  ...bet,
                  status: 'cashed_out',
                  cashedOutMultiplier: bet.autoCashoutMultiplier,
                  winAmount: winAmt,
                  timestamp: Date.now()
                };
                completedList.push(completedBet);
                return completedBet;
              }
              return bet;
            });

            activeBetsRef.current = nextActiveBets;
            setActiveBets(nextActiveBets);
            setBalance((b) => b + totalCashoutWin);
            audio.playCashout();
            setStats((s) => ({
              ...s,
              totalWins: s.totalWins + totalCashoutWin
            }));
            recordCompletedBets(completedList);
          }

          // Evaluate Live Players cashout in real-time
          setLivePlayers((prevPlayers) => {
            let changed = false;
            const updated = prevPlayers.map((p) => {
              if (p.status === 'in_flight' && nextMult >= p.cashoutMult) {
                changed = true;
                return { ...p, status: 'cashed_out' };
              }
              return p;
            });
            return changed ? updated : prevPlayers;
          });
        }
      }
    }, gameState === 'waiting' ? 1000 : TICK_RATE);

    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, [gameState]);

  // Trigger crash event
  const triggerCrash = () => {
    setGameState('crashed');
    setMultiplier(currentCrashValue.current);
    audio.playCrash();

    // Record crashed bets without duplication
    const currentBets = activeBetsRef.current;
    const placedBets = currentBets.filter((bet) => bet.status === 'placed');
    if (placedBets.length > 0) {
      const crashedBets: Bet[] = placedBets.map((bet) => ({
        ...bet,
        status: 'crashed' as const,
        timestamp: Date.now()
      }));
      recordCompletedBets(crashedBets);
    }

    // Mark uncached bets as crashed in activeBets
    setActiveBets((prevBets) => {
      const updated = prevBets.map((bet) => {
        if (bet.status === 'placed') {
          return {
            ...bet,
            status: 'crashed' as const,
            timestamp: Date.now()
          };
        }
        return bet;
      });
      activeBetsRef.current = updated;
      return updated;
    });

    // Mark uncached live players as crashed
    setLivePlayers((prev) =>
      prev.map((p) => {
        if (p.status === 'in_flight') {
          return { ...p, status: 'crashed' };
        }
        return p;
      })
    );

    // Add to past round records
    const newRound: PastRound = {
      id: `R-${Math.floor(Math.random() * 9000 + 1000)}`,
      multiplier: currentCrashValue.current,
      timestamp: Date.now(),
      seed: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      clientSeed: 'aviator_client_seed_77491_x100',
      serverSeed: '7d4a6f91b4020c0f991f8ef36329e4dcd9cfbf50bc3db09ec308cb187514fa9c'
    };

    setRecentMultipliers((prev) => [newRound, ...prev]);
    setStats((s) => ({
      ...s,
      totalRounds: s.totalRounds + 1
    }));

    // Transition back to waiting state after 3 seconds
    setTimeout(() => {
      setGameState('waiting');
      countdownRef.current = 6;
      setCountdown(6);
      setMultiplier(1.00);

      // Regenerate dynamic live players for next round (starts fresh and gradually builds up)
      setLivePlayers(generateInitialWaitingPlayers());

      // Clean bets status back to idle ready for the next round, converting queued bets to placed
      setActiveBets((prev) => {
        const updated = prev.map((bet) => {
          if (bet.status === 'cashed_out' || bet.status === 'crashed') {
            return {
              ...bet,
              status: 'idle' as const
            };
          }
          if (bet.status === 'queued') {
            return {
              ...bet,
              status: 'placed' as const
            };
          }
          return bet;
        });
        activeBetsRef.current = updated;
        return updated;
      });
    }, 3000);
  };

  // Manual cash out triggered by user click
  const handleCashOut = (panelId: number) => {
    if (gameState !== 'flying') return;

    const bet = activeBetsRef.current[panelId];
    if (bet && bet.status === 'placed') {
      const winAmt = bet.amount * multiplier;
      setBalance((b) => b + winAmt);
      audio.playCashout();

      // update stats
      setStats((s) => ({
        ...s,
        totalWins: s.totalWins + winAmt
      }));

      const completedBet: Bet = {
        ...bet,
        status: 'cashed_out',
        cashedOutMultiplier: multiplier,
        winAmount: winAmt,
        timestamp: Date.now()
      };
      recordCompletedBets([completedBet]);

      setActiveBets((prev) => {
        const copy = [...prev];
        copy[panelId] = completedBet;
        activeBetsRef.current = copy;
        return copy;
      });
    }
  };

  // Place a bet scheduling it
  const handlePlaceBet = (panelId: number, amount: number, autoCash: boolean, autoCashMult: number) => {
    setActiveBets((prev) => {
      const copy = [...prev];
      copy[panelId] = {
        id: `b-${panelId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        amount,
        autoCashout: autoCash,
        autoCashoutMultiplier: autoCashMult,
        status: gameState === 'waiting' ? 'placed' : 'queued', // places instantly if waiting, otherwise queues for next round
        timestamp: Date.now()
      };
      activeBetsRef.current = copy;
      return copy;
    });
  };

  // Cancel bet
  const handleCancelBet = (panelId: number) => {
    setActiveBets((prev) => {
      const copy = [...prev];
      copy[panelId] = {
        ...copy[panelId],
        status: 'idle'
      };
      activeBetsRef.current = copy;
      return copy;
    });
  };

  // Claim Free Bet code
  const handleClaimFreeBet = (reward: number) => {
    setBalance((b) => b + reward);
    setSettings((prev) => ({ ...prev, freeBetClaimed: true }));
  };

  // Submit deposit reference with screenshot proof
  const handleSubmitDeposit = (
    amount: number,
    screenshotUrl?: string,
    utrId?: string,
    upiIdUsed?: string,
    paymentMethod?: string
  ) => {
    const isAutoInstant = settings.instantApproval === true;
    const cleanUtr = utrId || `UTR-${Math.floor(Math.random() * 900000000000 + 100000000000)}`;
    const newReq: DepositRequest = {
      id: `DEP-${Math.floor(Math.random() * 90000 + 10000)}`,
      amount,
      utrId: cleanUtr,
      screenshotUrl,
      paymentMethod: paymentMethod || 'UPI',
      status: isAutoInstant ? 'approved' : 'pending',
      timestamp: Date.now(),
      upiIdUsed: upiIdUsed || settings.upiId
    };

    setDeposits((prev) => {
      const updated = [newReq, ...prev];
      localStorage.setItem('aviator_deposits', JSON.stringify(updated));
      return updated;
    });

    if (isAutoInstant) {
      setBalance((b) => {
        const nextBal = b + amount;
        localStorage.setItem('aviator_balance', nextBal.toString());
        return nextBal;
      });
      setStats((s) => {
        const nextStats = {
          ...s,
          totalDeposits: s.totalDeposits + amount
        };
        localStorage.setItem('aviator_stats', JSON.stringify(nextStats));
        return nextStats;
      });
      showToast(`Deposit of ₹${amount.toLocaleString('en-IN')} verified & credited instantly!`, 'success');
    } else {
      showToast(`Deposit request of ₹${amount.toLocaleString('en-IN')} submitted! Waiting for Admin verification.`, 'info');
    }
  };

  const handleSubmitUtr = (amount: number, utrId: string, upiIdUsed: string) => {
    handleSubmitDeposit(amount, undefined, utrId, upiIdUsed, 'UPI');
  };

  // Submit withdrawal request
  const handleSubmitWithdrawal = (
    amount: number,
    method: 'upi' | 'bank',
    details: { upiId?: string; bankName?: string; accountNumber?: string; ifscCode?: string }
  ) => {
    const isAutoInstant = settings.instantApproval === true;
    const newReq: WithdrawRequest = {
      id: `WTH-${Math.floor(Math.random() * 90000 + 10000)}`,
      amount,
      method,
      upiId: details.upiId,
      bankName: details.bankName,
      accountNumber: details.accountNumber,
      ifscCode: details.ifscCode,
      status: isAutoInstant ? 'approved' : 'pending',
      timestamp: Date.now()
    };

    // Deduct immediately upon withdrawal request so funds are reserved
    setBalance((b) => {
      const nextBal = Math.max(0, b - amount);
      localStorage.setItem('aviator_balance', nextBal.toString());
      return nextBal;
    });

    setWithdrawals((prev) => {
      const updated = [newReq, ...prev];
      localStorage.setItem('aviator_withdrawals', JSON.stringify(updated));
      return updated;
    });

    if (isAutoInstant) {
      showToast(`Withdrawal of ₹${amount.toLocaleString('en-IN')} approved and paid out!`, 'success');
    } else {
      showToast(`Withdrawal request of ₹${amount.toLocaleString('en-IN')} submitted! Waiting for Admin approval.`, 'info');
    }
  };

  // --- Admin Actions ---
  const handleApproveDeposit = (id: string) => {
    // 1. Locate the pending deposit item directly from current state
    const target = deposits.find((d) => d.id === id);
    if (!target) {
      showToast('Deposit request not found.', 'error');
      return;
    }
    if (target.status !== 'pending') {
      showToast('This deposit has already been processed.', 'info');
      return;
    }

    const creditAmount = Number(target.amount) || 0;
    if (creditAmount <= 0) {
      showToast('Invalid deposit amount.', 'error');
      return;
    }

    // 2. Mark as approved in state & storage
    const updatedDeposits = deposits.map((d) =>
      d.id === id ? { ...d, status: 'approved' as const } : d
    );
    setDeposits(updatedDeposits);
    localStorage.setItem('aviator_deposits', JSON.stringify(updatedDeposits));

    // 3. Directly credit the player's gaming platform balance
    setBalance((prevBal) => {
      const nextBal = (Number(prevBal) || 0) + creditAmount;
      localStorage.setItem('aviator_balance', nextBal.toString());
      return nextBal;
    });

    // 4. Update Admin platform statistics
    setStats((prevStats) => {
      const nextStats = {
        ...prevStats,
        totalDeposits: (Number(prevStats.totalDeposits) || 0) + creditAmount,
      };
      localStorage.setItem('aviator_stats', JSON.stringify(nextStats));
      return nextStats;
    });

    // 5. Sound & alert confirmation
    try {
      audio.playCashout();
    } catch {
      // audio safety
    }
    showToast(`Deposit of ₹${creditAmount.toLocaleString('en-IN')} APPROVED! ₹${creditAmount.toLocaleString('en-IN')} added to Gaming Wallet.`, 'success');
  };

  const handleRejectDeposit = (id: string) => {
    const target = deposits.find((d) => d.id === id);
    if (!target) return;
    if (target.status !== 'pending') return;

    const rejectedAmount = Number(target.amount) || 0;
    const updated = deposits.map((d) =>
      d.id === id ? { ...d, status: 'rejected' as const } : d
    );
    setDeposits(updated);
    localStorage.setItem('aviator_deposits', JSON.stringify(updated));

    showToast(`Deposit of ₹${rejectedAmount.toLocaleString('en-IN')} REJECTED.`, 'error');
  };

  const handleApproveWithdrawal = (id: string) => {
    const target = withdrawals.find((w) => w.id === id);
    if (!target) return;
    if (target.status !== 'pending') return;

    const approvedAmount = Number(target.amount) || 0;
    const updated = withdrawals.map((w) =>
      w.id === id ? { ...w, status: 'approved' as const } : w
    );
    setWithdrawals(updated);
    localStorage.setItem('aviator_withdrawals', JSON.stringify(updated));

    showToast(`Withdrawal of ₹${approvedAmount.toLocaleString('en-IN')} APPROVED! Marked as paid.`, 'success');
  };

  const handleRejectWithdrawal = (id: string) => {
    const target = withdrawals.find((w) => w.id === id);
    if (!target) return;
    if (target.status !== 'pending') return;

    const refundAmount = Number(target.amount) || 0;
    const updated = withdrawals.map((w) =>
      w.id === id ? { ...w, status: 'rejected' as const } : w
    );
    setWithdrawals(updated);
    localStorage.setItem('aviator_withdrawals', JSON.stringify(updated));

    if (refundAmount > 0) {
      // Refund back to active player balance
      setBalance((b) => {
        const nextBal = (Number(b) || 0) + refundAmount;
        localStorage.setItem('aviator_balance', nextBal.toString());
        return nextBal;
      });
      showToast(`Withdrawal of ₹${refundAmount.toLocaleString('en-IN')} REJECTED! Funds refunded to player wallet.`, 'info');
    }
  };

  // Batch instant approvals
  const handleApproveAllDeposits = () => {
    const pendingDeposits = deposits.filter((d) => d.status === 'pending');
    if (pendingDeposits.length === 0) {
      showToast('No pending deposits to approve.', 'info');
      return;
    }

    const totalToAdd = pendingDeposits.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

    const updated = deposits.map((d) =>
      d.status === 'pending' ? { ...d, status: 'approved' as const } : d
    );
    setDeposits(updated);
    localStorage.setItem('aviator_deposits', JSON.stringify(updated));

    if (totalToAdd > 0) {
      setBalance((b) => {
        const nextBal = (Number(b) || 0) + totalToAdd;
        localStorage.setItem('aviator_balance', nextBal.toString());
        return nextBal;
      });
      setStats((s) => {
        const nextStats = {
          ...s,
          totalDeposits: (Number(s.totalDeposits) || 0) + totalToAdd,
        };
        localStorage.setItem('aviator_stats', JSON.stringify(nextStats));
        return nextStats;
      });
      try {
        audio.playCashout();
      } catch {
        // audio safety
      }
      showToast(`All pending deposits approved! ₹${totalToAdd.toLocaleString('en-IN')} added to Gaming Wallet.`, 'success');
    }
  };

  const handleApproveAllWithdrawals = () => {
    const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');
    if (pendingWithdrawals.length === 0) {
      showToast('No pending withdrawals to approve.', 'info');
      return;
    }

    const updated = withdrawals.map((w) =>
      w.status === 'pending' ? { ...w, status: 'approved' as const } : w
    );
    setWithdrawals(updated);
    localStorage.setItem('aviator_withdrawals', JSON.stringify(updated));

    showToast(`All ${pendingWithdrawals.length} pending withdrawals approved and cleared for payout!`, 'success');
  };

  // Direct balance adjustment from Admin Panel
  const handleAdjustBalance = (newAmount: number) => {
    const safeAmount = Math.max(0, Number(newAmount) || 0);
    setBalance(safeAmount);
    localStorage.setItem('aviator_balance', safeAmount.toString());
    showToast(`Gaming account balance set to ₹${safeAmount.toLocaleString('en-IN')}`, 'success');
  };

  // Reset/Purge for Live Launch
  const handlePurgeAllDemoData = () => {
    setBalance(0);
    setStats({
      totalRounds: 0,
      totalBetsPlaced: 0,
      totalWins: 0,
      totalVolume: 0,
      totalDeposits: 0
    });
    setDeposits([]);
    setWithdrawals([]);
    setRecentMultipliers([]);
    setUserBetHistory([]);
    setActiveBets([
      { id: 'b1', amount: 10, autoCashout: false, autoCashoutMultiplier: 2.0, status: 'idle', timestamp: Date.now() },
      { id: 'b2', amount: 10, autoCashout: false, autoCashoutMultiplier: 2.0, status: 'idle', timestamp: Date.now() }
    ]);
    localStorage.removeItem('aviator_balance');
    localStorage.removeItem('aviator_deposits');
    localStorage.removeItem('aviator_withdrawals');
    localStorage.removeItem('aviator_multipliers');
    localStorage.removeItem('aviator_stats');
    localStorage.removeItem('aviator_user_bets');
    localStorage.setItem('aviator_balance', '0');
    localStorage.setItem('aviator_live_initialized_v2', 'true');
    showToast('Live environment reset: All balances, transaction logs, and history cleanly re-initialized!', 'success');
  };

  const handleResetStats = () => {
    setStats({
      totalRounds: 0,
      totalBetsPlaced: 0,
      totalWins: 0,
      totalVolume: 0,
      totalDeposits: 0
    });
    setDeposits([]);
    setWithdrawals([]);
    setRecentMultipliers([]);
    setBalance(0);
    localStorage.setItem('aviator_balance', '0');
    showToast('Stats wiped out. Player wallet balance reset to ₹0.', 'success');
  };

  // --- Dedicated Standalone Operator Terminal Section ---
  if (activeView === 'admin') {
    return (
      <div className="min-h-screen bg-zinc-950 font-sans text-gray-200 antialiased p-3 sm:p-6 relative overflow-x-hidden" id="admin_portal_section">
        {/* Subtle operator background glow */}
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

        <AdminPanel
          settings={settings}
          stats={stats}
          balance={balance}
          deposits={deposits}
          withdrawals={withdrawals}
          pastRounds={recentMultipliers}
          forcedMultiplier={forcedMultiplier}
          onUpdateSettings={(newSettings) => setSettings((s) => ({ ...s, ...newSettings }))}
          onApproveDeposit={handleApproveDeposit}
          onRejectDeposit={handleRejectDeposit}
          onApproveAllDeposits={handleApproveAllDeposits}
          onApproveWithdrawal={handleApproveWithdrawal}
          onRejectWithdrawal={handleRejectWithdrawal}
          onApproveAllWithdrawals={handleApproveAllWithdrawals}
          onSetForcedMultiplier={setForcedMultiplier}
          onResetStats={handleResetStats}
          onPurgeAllDemoData={handlePurgeAllDemoData}
          onAdjustBalance={handleAdjustBalance}
          onBackToGame={handleBackToGame}
          onLogoutAdmin={handleLogoutAdmin}
        />

        {/* Global Toast for notifications in Admin view */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in" id="admin_toast_notification">
            <div className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 text-white backdrop-blur-xl ${
              toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100' :
              toast.type === 'error' ? 'bg-red-950/90 border-red-500/50 text-red-100' :
              'bg-zinc-900/90 border-zinc-700 text-zinc-100'
            }`}>
              {toast.type === 'success' && <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
              {toast.type === 'info' && <Sparkles className="w-5 h-5 text-zinc-400 shrink-0" />}
              <span className="text-xs font-bold leading-normal">{toast.message}</span>
              <button 
                onClick={() => setToast(null)}
                className="p-1 rounded bg-black/20 hover:bg-black/40 text-zinc-400 hover:text-white transition cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Authentic Clean Aviator Game View (Zero Admin Clutter) ---
  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-gray-200 antialiased relative overflow-x-hidden flex flex-col justify-between" id="app_frame">
      
      {/* Dynamic colorful decorative radial blur backdrops */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-red-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

      {/* Primary Top Header Navigation Bar (Clean Player UI, No Admin Icons) */}
      <header className="sticky top-0 z-30 border-b border-zinc-900 bg-zinc-950/95 backdrop-blur-md px-2.5 sm:px-4 py-2" id="top_navbar">
        <div className="max-w-7xl mx-auto space-y-1.5">
          {/* Row 1: Back Button, Withdraw Button, Live Telegram Support, Deposit Button, Avatar/Login */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: Back Chevron & Action Pills */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setActiveView('game'); setMobileTab('game'); }}
                className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer border border-zinc-800"
                title="Refresh Game"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Withdraw Button */}
              <button
                type="button"
                onClick={() => setWithdrawModalOpen(true)}
                className="bg-red-950/40 hover:bg-red-900/50 text-red-400 hover:text-red-300 px-2.5 py-1 border border-red-500/30 rounded-xl font-bold text-[11px] flex items-center gap-1 transition active:scale-95 cursor-pointer"
                title="Withdrawal Options"
                id="separate_withdrawal_button"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />
                <span>Withdraw</span>
              </button>

              {/* Live Telegram Support Button */}
              <button
                type="button"
                onClick={() => setTelegramSupportOpen(true)}
                className="bg-[#0088cc]/15 hover:bg-[#0088cc]/25 text-[#0088cc] hover:text-sky-300 px-2.5 py-1 border border-[#0088cc]/40 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm shadow-[#0088cc]/10"
                title="Live Telegram Support (@lottaygent)"
                id="header_telegram_support_button"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
                <span className="hidden sm:inline">Live Support</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            </div>

            {/* Right: Deposit + User Profile (No Admin Toggle here!) */}
            <div className="flex items-center gap-2">
              {/* Deposit Button */}
              <button
                type="button"
                onClick={() => setDepositModalOpen(true)}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 font-bold text-xs transition active:scale-95 cursor-pointer shadow-md shadow-emerald-950/50"
                title="Deposit Funds"
                id="header_deposit_btn"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Deposit</span>
              </button>

              {/* User Account / Profile Chip or Login button */}
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono font-bold text-zinc-300 transition cursor-pointer"
                  title={`Logged in: ${currentUser.mobileNumber}`}
                  id="header_user_profile_btn"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-red-600 to-rose-700 flex items-center justify-center text-[10px] text-white font-bold">
                    👤
                  </div>
                  <span className="hidden sm:inline text-[11px] text-zinc-300">
                    {currentUser.mobileNumber.slice(-4)}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-400 hover:text-white flex items-center gap-1 font-bold text-xs transition cursor-pointer active:scale-95"
                  title="User Login / Sign Up"
                  id="header_login_btn"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Authentic Spribe Sub-Bar: Left "Aviator" Logo | Right "{balance} INR" in bright green & Hamburger */}
          <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
            {/* Authentic Red Script Aviator Logo */}
            <div 
              onClick={() => { setActiveView('game'); setMobileTab('game'); }}
              className="flex items-center gap-2 cursor-pointer select-none active:scale-95 transition"
            >
              <span className="font-serif italic font-black text-red-600 text-xl sm:text-2xl tracking-tight drop-shadow-[0_2px_8px_rgba(220,38,38,0.5)] font-['Brush_Script_MT',cursive,sans-serif]">
                Aviator
              </span>
            </div>

            {/* Right: Vibrant Green Balance in INR + Hamburger Menu */}
            <div className="flex items-center gap-3">
              <span className="text-sm sm:text-base font-mono font-black text-[#28a745] tracking-tight">
                {balance.toFixed(2)} INR
              </span>
              <button
                type="button"
                onClick={() => setSideMenuOpen(true)}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition active:scale-95 cursor-pointer"
                id="hamburger_menu_btn"
                aria-label="Open Menu"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Primary Main Content Area: Pure Aviator Game */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4 flex flex-col justify-center pb-8" id="primary_main_content">
        <div className="w-full max-w-lg mx-auto space-y-2.5 sm:space-y-3 animate-fade-in" id="spribe_main_game_wrapper">
          
          {/* Flight Arena & Dual Betting Panels (with Bet / Cash Out buttons) */}
          <AviatorGame
            balance={balance}
            gameState={gameState}
            multiplier={multiplier}
            countdown={countdown}
            recentMultipliers={recentMultipliers}
            activeBets={activeBets}
            liveBetsCount={livePlayers.length + activeBets.filter((b) => b.status === 'placed' || b.status === 'queued').length}
            onPlaceBet={handlePlaceBet}
            onCancelBet={handleCancelBet}
            onCashOut={handleCashOut}
          />

          {/* Authentic Spribe Bets Section: Placed DIRECTLY UNDER the Bet panel! */}
          <SpribeBetsList
            gameState={gameState}
            multiplier={multiplier}
            livePlayers={livePlayers}
            userActiveBets={activeBets}
            userBetHistory={userBetHistory}
            pastRounds={recentMultipliers}
            totalBettingUsers={totalBettingUsers}
          />
        </div>
      </main>

      {/* Game Clean Footer (No admin controls) */}
      <footer className="w-full text-center py-3 border-t border-zinc-900/60 text-zinc-600 text-[11px] font-mono mt-auto" id="game_footer_bar">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center text-zinc-600">
          <span>© 2026 Aviator 100x • Provably Fair Certified • 18+ Only</span>
        </div>
      </footer>

      {/* Overlay Drawer Menu */}
      <SideMenu
        isOpen={sideMenuOpen}
        onClose={() => setSideMenuOpen(false)}
        settings={settings}
        betHistory={activeBets.filter(b => b.status === 'cashed_out' || b.status === 'crashed')}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onToggleSound={() => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
        onToggleMusic={() => setSettings((s) => ({ ...s, musicEnabled: !s.musicEnabled }))}
        onToggleAnimation={() => setSettings((s) => ({ ...s, animationEnabled: !s.animationEnabled }))}
        onOpenModal={(modal) => setActiveModal(modal)}
        onOpenTelegramSupport={() => setTelegramSupportOpen(true)}
      />

      {/* Operator Access PIN Modal */}
      <AdminAccessModal
        isOpen={adminAccessModalOpen}
        onClose={() => setAdminAccessModalOpen(false)}
        onSuccess={handleAdminAuthSuccess}
      />

      {/* User Authentication Modal (Login & Sign Up) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLoginSuccess}
        onLogout={handleLogout}
      />

      {/* Recharge UPI Deposit Modal */}
      {depositModalOpen && (
        <DepositModal
          onClose={() => setDepositModalOpen(false)}
          settings={settings}
          userDeposits={deposits}
          balance={balance}
          onSubmitDeposit={handleSubmitDeposit}
          onSubmitUtr={handleSubmitUtr}
        />
      )}

      {/* Withdraw Modal */}
      {withdrawModalOpen && (
        <WithdrawModal
          onClose={() => setWithdrawModalOpen(false)}
          balance={balance}
          userWithdrawals={withdrawals}
          onSubmitWithdrawal={handleSubmitWithdrawal}
        />
      )}

      {/* Official Live Telegram Support Modal */}
      <TelegramSupportModal
        isOpen={telegramSupportOpen}
        onClose={() => setTelegramSupportOpen(false)}
        telegramId={settings.telegramSupportId || TELEGRAM_SUPPORT_ID}
      />


      {/* Informative Popups / Modals */}
      {activeModal === 'how_to_play' && (
        <HowToPlayModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'rules' && (
        <GameRulesModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'limits' && (
        <GameLimitsModal onClose={() => setActiveModal(null)} settings={settings} />
      )}
      {activeModal === 'free_bets' && (
        <FreeBetsModal 
          onClose={() => setActiveModal(null)} 
          onClaimFreeBet={handleClaimFreeBet}
          settings={settings}
        />
      )}
      {activeModal === 'provably_fair' && (
        <ProvablyFairModal onClose={() => setActiveModal(null)} pastRounds={recentMultipliers} />
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 right-5 z-50 animate-bounce">
          <div className={`p-4 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-md max-w-sm ${
            toast.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-emerald-500/10' 
              : toast.type === 'error'
              ? 'bg-red-950/90 border-red-500 text-red-200 shadow-red-500/10'
              : 'bg-zinc-900/90 border-zinc-700 text-zinc-200'
          }`}>
            {toast.type === 'success' && <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
            {toast.type === 'info' && <Sparkles className="w-5 h-5 text-zinc-400 shrink-0" />}
            <span className="text-xs font-bold leading-normal">{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="p-1 rounded bg-black/20 hover:bg-black/40 text-zinc-400 hover:text-white transition cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating 24/7 Live Telegram Support Widget Button */}
      <aside className="fixed bottom-4 right-4 z-40" id="floating_telegram_support_widget" aria-label="Live Telegram Support">
        <button
          type="button"
          onClick={() => setTelegramSupportOpen(true)}
          className="group flex items-center gap-2 bg-gradient-to-r from-[#0088cc] to-[#0077b5] hover:brightness-110 text-white pl-2.5 pr-3.5 py-2 rounded-full shadow-xl shadow-[#0088cc]/30 border border-sky-300/30 transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
          id="floating_support_btn"
          title="24/7 Live Telegram Support (@lottaygent)"
        >
          <div className="relative w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-zinc-950 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-zinc-950" />
          </div>
          <div className="flex flex-col text-left leading-none">
            <span className="text-[9px] font-bold text-sky-100 uppercase tracking-wider">Live Support</span>
            <span className="text-[11px] font-mono font-black text-white">{settings.telegramSupportId || '@lottaygent'}</span>
          </div>
        </button>
      </aside>

    </div>
  );
}
