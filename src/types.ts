export interface Bet {
  id: string;
  amount: number;
  autoCashout: boolean;
  autoCashoutMultiplier: number;
  status: 'idle' | 'placed' | 'cashed_out' | 'crashed' | 'queued';
  cashedOutMultiplier?: number;
  winAmount?: number;
  roundId?: string;
  timestamp: number;
}

export interface DepositRequest {
  id: string;
  amount: number;
  utrId?: string;
  screenshotUrl?: string;
  paymentMethod?: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
  upiIdUsed: string;
}

export interface WithdrawRequest {
  id: string;
  amount: number;
  method: 'upi' | 'bank';
  upiId?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
}

export interface PastRound {
  id: string;
  multiplier: number;
  timestamp: number;
  seed: string;
  clientSeed: string;
  serverSeed: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  animationEnabled: boolean;
  freeBetClaimed: boolean;
  minBet: number;
  maxBet: number;
  maxMultiplier: number;
  upiId: string;
  qrCodeUrl: string; // fallback image URL
  telegramSupportId?: string;
  instantApproval?: boolean; // Instant auto-approval and reflection for deposits & withdrawals
  initialWalletBalance?: number;
}

export interface GameStats {
  totalRounds: number;
  totalBetsPlaced: number;
  totalWins: number;
  totalVolume: number;
  totalDeposits: number;
}

export interface LivePlayer {
  id: string;
  username: string;
  avatar?: string;
  betAmount: number;
  cashoutMult: number;
  cashedMult?: number;
  winAmount?: number;
  status: 'idle' | 'in_flight' | 'cashed_out' | 'crashed';
}

export interface UserAccount {
  mobileNumber: string;
  isLoggedIn: boolean;
  username: string;
  createdAt: number;
}
