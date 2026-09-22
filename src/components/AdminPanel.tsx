import React, { useState } from 'react';
import { 
  Settings, 
  Check, 
  X, 
  Database, 
  TrendingUp, 
  DollarSign, 
  RefreshCw, 
  FileText,
  Percent,
  Play,
  QrCode,
  Sliders,
  ShieldCheck,
  Upload,
  Trash2,
  Image as ImageIcon,
  Eye,
  Zap,
  Clock,
  Wallet,
  Edit3,
  Plus
} from 'lucide-react';
import { DepositRequest, GameSettings, GameStats, PastRound, WithdrawRequest } from '../types';

interface AdminPanelProps {
  settings: GameSettings;
  stats: GameStats;
  balance?: number;
  deposits: DepositRequest[];
  withdrawals: WithdrawRequest[];
  pastRounds: PastRound[];
  forcedMultiplier: number | null;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onApproveDeposit: (id: string) => void;
  onRejectDeposit: (id: string) => void;
  onApproveWithdrawal: (id: string) => void;
  onRejectWithdrawal: (id: string) => void;
  onApproveAllDeposits?: () => void;
  onApproveAllWithdrawals?: () => void;
  onPurgeAllDemoData?: () => void;
  onSetForcedMultiplier: (multiplier: number | null) => void;
  onResetStats: () => void;
  onAdjustBalance?: (newBalance: number) => void;
}

function AdminPanel({
  settings,
  stats,
  balance,
  deposits,
  withdrawals,
  pastRounds,
  forcedMultiplier,
  onUpdateSettings,
  onApproveDeposit,
  onRejectDeposit,
  onApproveWithdrawal,
  onRejectWithdrawal,
  onApproveAllDeposits,
  onApproveAllWithdrawals,
  onPurgeAllDemoData,
  onSetForcedMultiplier,
  onResetStats,
  onAdjustBalance
}: AdminPanelProps) {
  const [editingBalance, setEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState((balance ?? 0).toString());
  const [upiInput, setUpiInput] = useState(settings.upiId);
  const [qrUrlInput, setQrUrlInput] = useState(settings.qrCodeUrl);
  const [telegramSupportInput, setTelegramSupportInput] = useState(settings.telegramSupportId || '@lottaygent');
  const [instantApprovalInput, setInstantApprovalInput] = useState(settings.instantApproval === true);
  const [customMultiplierInput, setCustomMultiplierInput] = useState('');
  const [minBetInput, setMinBetInput] = useState(settings.minBet);
  const [maxBetInput, setMaxBetInput] = useState(settings.maxBet);
  const [rtpInput, setRtpInput] = useState(97); // simulated RTP slider
  const [reconcileTab, setReconcileTab] = useState<'deposits' | 'withdrawals'>('deposits');
  const [depositFilter, setDepositFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [withdrawFilter, setWithdrawFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [proofModalUrl, setProofModalUrl] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, or WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File is too large! Please upload a QR code image under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setQrUrlInput(base64);
        alert('QR code image uploaded successfully as Base64 format! Click "Save Gateway Credentials" below to save.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearUploadedQR = () => {
    setQrUrlInput('');
    alert('Custom QR cleared. It will now generate UPI QR codes dynamically using your Active UPI ID.');
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      upiId: upiInput,
      qrCodeUrl: qrUrlInput || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(upiInput)}`,
      telegramSupportId: telegramSupportInput.trim() || '@lottaygent',
      instantApproval: instantApprovalInput
    });
    alert('Payment gateway, instant processing, and support configurations updated!');
  };

  const handleSetMultiplier = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customMultiplierInput);
    if (isNaN(val) || val < 1.0) {
      alert('Please enter a valid multiplier >= 1.0');
      return;
    }
    onSetForcedMultiplier(val);
    setCustomMultiplierInput('');
    alert(`Success! Next round forced to fly away at ${val.toFixed(2)}x`);
  };

  const handleClearForcedMultiplier = () => {
    onSetForcedMultiplier(null);
    alert('Forced multiplier removed. Random generator active.');
  };

  const handleSaveLimits = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      minBet: Number(minBetInput),
      maxBet: Number(maxBetInput)
    });
    alert('Betting thresholds updated!');
  };

  return (
    <div className="space-y-6 text-gray-100" id="admin_panel_container">
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            Aviator 100x Operator Terminal
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time server administration panel, game configuration, and deposit reconciliation.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-purple-950/40 border border-purple-800/60 rounded-full">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-mono font-medium text-purple-300">ADMIN ACTIVE</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex flex-col justify-between" id="admin_stat_wallet">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-300 font-semibold">Gaming Wallet</span>
              <div className="flex items-center gap-1">
                {onAdjustBalance && (
                  <button
                    type="button"
                    onClick={() => {
                      setBalanceInput((balance ?? 0).toString());
                      setEditingBalance(!editingBalance);
                    }}
                    className="p-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 hover:text-white transition cursor-pointer"
                    title="Manual Balance Set/Adjust"
                    id="edit_gaming_balance_btn"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                )}
                <Wallet className="w-4 h-4 text-[#28a745]" />
              </div>
            </div>
            
            {editingBalance && onAdjustBalance ? (
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-mono text-zinc-400">₹</span>
                  <input
                    type="number"
                    value={balanceInput}
                    onChange={(e) => setBalanceInput(e.target.value)}
                    className="w-full bg-zinc-900 border border-emerald-700/60 rounded px-2 py-0.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    placeholder="Enter amount"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = parseFloat(balanceInput);
                      if (!isNaN(val) && val >= 0) {
                        onAdjustBalance(val);
                        setEditingBalance(false);
                      }
                    }}
                    className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded cursor-pointer"
                  >
                    Save
                  </button>
                </div>
                <div className="flex gap-1 text-[9px]">
                  <button
                    type="button"
                    onClick={() => { onAdjustBalance((balance ?? 0) + 500); setEditingBalance(false); }}
                    className="flex-1 py-0.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 rounded font-mono"
                  >
                    +₹500
                  </button>
                  <button
                    type="button"
                    onClick={() => { onAdjustBalance((balance ?? 0) + 1000); setEditingBalance(false); }}
                    className="flex-1 py-0.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 rounded font-mono"
                  >
                    +₹1K
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-lg font-black text-white mt-1.5 font-mono text-[#28a745]">
                  ₹{(balance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-emerald-400/90 mt-1">Live Player Game Balance</p>
              </>
            )}
          </div>
        </div>

        <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl" id="admin_stat_deposits">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Reconciled Deposits</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-white mt-1.5">
            ₹{stats.totalDeposits.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">From approved UTR claims</p>
        </div>

        <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl" id="admin_stat_volume">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Total Bets Placed</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-lg font-bold text-white mt-1.5">
            ₹{stats.totalVolume.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">{stats.totalBetsPlaced} bets in {stats.totalRounds} rounds</p>
        </div>

        <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl" id="admin_stat_payout">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Total Player Wins</span>
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-lg font-bold text-white mt-1.5">
            ₹{(stats.totalWins).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">Multiplier Cashouts won</p>
        </div>

        <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl col-span-2 md:col-span-1" id="admin_stat_rtp">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">House Margin</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-lg font-bold text-white mt-1.5">
            ₹{(stats.totalVolume - stats.totalWins).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">
            GGR: {stats.totalVolume > 0 ? (((stats.totalVolume - stats.totalWins) / stats.totalVolume) * 100).toFixed(1) : '100'}%
          </p>
        </div>
      </div>

      {/* Main Grid: Configurations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Forms */}
        <div className="space-y-6 lg:col-span-7">
          
          {/* Forced Multiplier Card */}
          <div className="p-5 bg-zinc-900/95 border border-zinc-800 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Sliders className="w-4 h-4 text-purple-400" />
              Game Loop & Multiplier Control
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Dictate the next flight crash multiplier. Allows administrators to set an exact multiplier target (e.g., 100.00x or 2.50x) or leave blank for automatic provably fair RNG generation.
            </p>

            <form onSubmit={handleSetMultiplier} className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 block mb-1">
                  Next Crash Multiplier (e.g., 2.50, 100.00)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="1.01"
                    placeholder="Auto-generate"
                    value={customMultiplierInput}
                    onChange={(e) => setCustomMultiplierInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-zinc-700 outline-none"
                  />
                  <span className="absolute right-3 top-2 text-zinc-500 text-xs">x</span>
                </div>
              </div>
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition duration-150 active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                Inject Multiplier
              </button>
            </form>

            {forcedMultiplier !== null ? (
              <div className="mt-4 p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  <p className="text-xs text-amber-200">
                    Next round locked at <span className="font-mono font-bold text-amber-400 text-sm">{forcedMultiplier.toFixed(2)}x</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearForcedMultiplier}
                  className="text-[11px] text-zinc-400 hover:text-white underline cursor-pointer"
                >
                  Cancel Override
                </button>
              </div>
            ) : (
              <p className="mt-3 text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Fair Server Seed RNG Active
              </p>
            )}
          </div>

          {/* UPI Custom Scanner config */}
          <div className="p-5 bg-zinc-900/95 border border-zinc-800 rounded-2xl" id="admin_upi_form">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <QrCode className="w-4 h-4 text-purple-400" />
              UPI & Custom QR Payment Scanner Gateway
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Enter your corporate merchant UPI ID. The payment engine will automatically generate dynamic checkout QR codes matching this ID, encoded with the precise transaction deposit amount.
            </p>

            <form onSubmit={handleSavePayment} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 block mb-1">
                  Active UPI ID
                </label>
                <input
                  type="text"
                  placeholder="e.g., payment.aviator@upi"
                  value={upiInput}
                  onChange={(e) => setUpiInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-zinc-700 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#0088cc] block mb-1">
                  Live Telegram Support ID
                </label>
                <input
                  type="text"
                  placeholder="@lottaygent"
                  value={telegramSupportInput}
                  onChange={(e) => setTelegramSupportInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-[#0088cc]/40 focus:border-[#0088cc] rounded-lg px-3 py-2 text-sm text-sky-300 font-mono font-bold placeholder-zinc-700 outline-none"
                  required
                />
                <span className="text-[10px] text-zinc-500 block mt-1">
                  Player support channel displayed in Header, Modals, Side Menu, and Floating 24/7 widget.
                </span>
              </div>

              <div className="space-y-3 bg-zinc-950 p-4 border border-zinc-850 rounded-xl">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block mb-1">
                    Custom QR Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Leave blank or upload/paste URL"
                    value={qrUrlInput}
                    onChange={(e) => setQrUrlInput(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-zinc-700 outline-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-zinc-900 pt-3">
                  <div className="flex-1 w-full text-left">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block mb-1.5">
                      OR Upload QR Code Image
                    </span>
                    <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-750 text-xs font-bold rounded-lg cursor-pointer transition text-zinc-200">
                      <Upload className="w-3.5 h-3.5 text-purple-400" />
                      <span>Upload QR File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {qrUrlInput && (
                    <div className="flex items-center gap-3 bg-zinc-900 p-2 border border-zinc-800 rounded-xl shrink-0 w-full sm:w-auto justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={qrUrlInput}
                          alt="QR Preview"
                          className="w-10 h-10 object-contain rounded bg-white border border-zinc-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="text-[10px] text-zinc-400 leading-normal">
                          <span className="text-emerald-400 font-bold block">QR Loaded</span>
                          {qrUrlInput.startsWith('data:image/') ? 'Uploaded Base64' : 'Custom URL Link'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearUploadedQR}
                        className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-red-400 transition animate-scale-in"
                        title="Delete custom QR"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-[9px] text-zinc-500 leading-relaxed pt-1">
                  💡 <strong>Tip:</strong> If no custom QR is uploaded or linked, the game dynamically generates an active interactive UPI deep-link scanner for Paytm/GPay with the exact user deposit amount automatically!
                </p>
              </div>

              {/* Manual vs Instant Approval Engine Switch */}
              <div className="p-3.5 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Deposit & Withdrawal Review Process</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      instantApprovalInput ? 'bg-amber-950 text-amber-400 border border-amber-800/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                    }`}>
                      {instantApprovalInput ? 'Auto-Approve All' : 'Manual Review (Approve / Reject)'}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    {instantApprovalInput 
                      ? '⚡ Auto-approval is ON: all customer deposits and withdrawals are processed immediately without admin review.' 
                      : '🛡️ Manual Admin Review is ON: customer deposits and withdrawals remain pending until you click Approve (स्वीकार करें) or Reject (अस्वीकार करें).'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setInstantApprovalInput(!instantApprovalInput)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    instantApprovalInput ? 'bg-amber-500' : 'bg-zinc-800'
                  }`}
                  id="toggle_instant_approval"
                  title="Toggle Auto-Approval Mode"
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      instantApprovalInput ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-zinc-800 hover:bg-zinc-750 text-white border border-zinc-700 font-bold text-xs py-2 px-4 rounded-lg transition active:scale-95 cursor-pointer"
                >
                  Save Gateway Credentials
                </button>
              </div>
            </form>
          </div>

          {/* Table Limits config */}
          <div className="p-5 bg-zinc-900/95 border border-zinc-800 rounded-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              Table Limits & RTP
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Set betting boundaries.
            </p>

            <form onSubmit={handleSaveLimits} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 block mb-1">
                  Min Bet (₹)
                </label>
                <input
                  type="number"
                  value={minBetInput}
                  onChange={(e) => setMinBetInput(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-zinc-700 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 block mb-1">
                  Max Bet (₹)
                </label>
                <input
                  type="number"
                  value={maxBetInput}
                  onChange={(e) => setMaxBetInput(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-zinc-700 outline-none"
                />
              </div>

              <div className="col-span-2 pt-2">
                <button
                  type="submit"
                  className="w-full bg-zinc-800 hover:bg-zinc-750 text-white border border-zinc-700 font-bold text-xs py-2 px-4 rounded-lg transition cursor-pointer"
                >
                  Update Threshold limits
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Reconcile UTR Submissions & Withdrawals */}
        <div className="space-y-6 lg:col-span-5 flex flex-col h-full">
          <div className="p-5 bg-zinc-900/95 border border-zinc-800 rounded-2xl flex-1 flex flex-col">
            {/* Tab Header Selector */}
            <div className="flex border-b border-zinc-800 pb-2 mb-4 gap-4">
              <button
                type="button"
                onClick={() => setReconcileTab('deposits')}
                className={`pb-2 text-sm font-bold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
                  reconcileTab === 'deposits'
                    ? 'border-emerald-500 text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                Deposits
                <span className="bg-emerald-950/60 text-emerald-400 text-[10px] font-bold px-2 py-0.5 border border-emerald-800/40 rounded-full">
                  {deposits.filter(d => d.status === 'pending').length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setReconcileTab('withdrawals')}
                className={`pb-2 text-sm font-bold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
                  reconcileTab === 'withdrawals'
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <DollarSign className="w-4 h-4 text-red-400" />
                Withdrawals
                <span className="bg-red-950/60 text-red-400 text-[10px] font-bold px-2 py-0.5 border border-red-800/40 rounded-full">
                  {withdrawals.filter(w => w.status === 'pending').length}
                </span>
              </button>
            </div>

            {reconcileTab === 'deposits' ? (
              /* DEPOSITS LIST */
              <div className="flex-1 flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => {
                      const count = f === 'all' 
                        ? deposits.length 
                        : deposits.filter(d => d.status === f).length;
                      return (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setDepositFilter(f)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
                            depositFilter === f
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border border-zinc-800'
                          }`}
                        >
                          <span>{f}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            depositFilter === f ? 'bg-emerald-950/80 text-emerald-200' : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {deposits.filter(d => d.status === 'pending').length > 0 && onApproveAllDeposits && (
                    <button
                      type="button"
                      onClick={onApproveAllDeposits}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-lg flex items-center gap-1 transition shadow-sm cursor-pointer shrink-0"
                      id="admin_approve_all_deposits_btn"
                    >
                      <Check className="w-3 h-3" />
                      Approve All Pending ({deposits.filter(d => d.status === 'pending').length})
                    </button>
                  )}
                </div>

                {/* Gaming Account Balance Live Status Banner */}
                <div className="mb-3 p-2.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#28a745] shrink-0" />
                    <span className="text-zinc-300">
                      Player Gaming Account Balance: <strong className="text-[#28a745] font-mono font-bold">₹{(balance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-700/50 font-medium">
                    ⚡ Approve करते ही तुरंत बैलेंस में ऐड होगा
                  </span>
                </div>

                {deposits.filter(d => d.status === 'pending').length > 0 && (
                  <div className="mb-3 p-2.5 bg-amber-950/30 border border-amber-800/40 rounded-xl flex items-center gap-2 text-xs text-amber-300">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>{deposits.filter(d => d.status === 'pending').length} Customer Deposit(s)</strong> waiting for Admin review. Click <strong>Approve (स्वीकार करें)</strong> to add funds to Gaming Account, or <strong>Reject (अस्वीकार करें)</strong> to decline.
                    </span>
                  </div>
                )}

                <div className="flex-grow overflow-y-auto max-h-[380px] pr-1 space-y-3" id="admin_utr_list">
                  {deposits.filter(d => depositFilter === 'all' || d.status === depositFilter).length === 0 ? (
                    <div className="h-44 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-center p-4">
                      <Database className="w-8 h-8 text-zinc-700 mb-2" />
                      <p className="text-xs text-zinc-500 font-medium">No {depositFilter !== 'all' ? depositFilter : ''} deposits found</p>
                      <p className="text-[10px] text-zinc-600 mt-1 max-w-[220px]">
                        Customer deposit submissions appear here in real-time.
                      </p>
                    </div>
                  ) : (
                    deposits
                      .filter(d => depositFilter === 'all' || d.status === depositFilter)
                      .slice()
                      .reverse()
                      .map((claim, idx) => (
                      <div 
                        key={`${claim.id}-${idx}`} 
                        className={`p-3.5 rounded-xl border transition ${
                          claim.status === 'pending' 
                            ? 'bg-zinc-950 border-amber-600/50 shadow-md shadow-amber-950/20' 
                            : claim.status === 'approved' 
                            ? 'bg-zinc-950/60 border-emerald-900/40' 
                            : 'bg-zinc-950/40 border-red-950/40 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white font-mono">₹{claim.amount.toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">({claim.id})</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                            claim.status === 'pending'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-600/50 animate-pulse'
                              : claim.status === 'approved'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                              : 'bg-red-950/80 text-red-300 border border-red-800/50'
                          }`}>
                            {claim.status === 'pending' ? (
                              <>
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>Pending (समीक्षा बाकी)</span>
                              </>
                            ) : claim.status === 'approved' ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Approved (स्वीकृत)</span>
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3 text-red-400" />
                                <span>Rejected (अस्वीकृत)</span>
                              </>
                            )}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 mt-2.5 pt-2 border-t border-zinc-900 text-[11px] text-zinc-400 font-mono">
                          <div>UTR / Reference ID:</div>
                          <div className="text-right text-emerald-400 font-bold select-all">{claim.utrId}</div>
                          <div>Submitted At:</div>
                          <div className="text-right text-zinc-500">
                            {new Date(claim.timestamp).toLocaleTimeString()}
                          </div>
                          <div className="col-span-2 pt-1 text-[10px] text-zinc-400 flex items-center justify-between border-t border-zinc-900/60 mt-1">
                            <span>Gateway: <strong className="text-zinc-200">{claim.paymentMethod || 'UPI QR'}</strong></span>
                            <span>UPI: <span className="text-zinc-300">{claim.upiIdUsed}</span></span>
                          </div>
                          {claim.screenshotUrl && (
                            <div className="col-span-2 pt-1.5 flex items-center justify-between bg-zinc-900/90 p-2 rounded-lg border border-zinc-800">
                              <span className="text-[10px] text-zinc-300 flex items-center gap-1.5 font-sans font-medium">
                                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                                Payment Screenshot Proof Attached
                              </span>
                              <button
                                type="button"
                                onClick={() => setProofModalUrl(claim.screenshotUrl || null)}
                                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View Proof
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Customer Deposit Approve & Reject Controls */}
                        {claim.status === 'pending' && (
                          <div className="flex gap-2.5 mt-3 pt-2.5 border-t border-zinc-850">
                            <button
                              type="button"
                              onClick={() => onApproveDeposit(claim.id)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs uppercase py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition shadow-md shadow-emerald-950/50 cursor-pointer"
                              id={`approve_dep_${claim.id}`}
                              title={`Approve and credit ₹${claim.amount} to Gaming Account`}
                            >
                              <Check className="w-4 h-4 stroke-[2.5]" />
                              <span>Approve & Add ₹{claim.amount.toLocaleString('en-IN')} (स्वीकार करें)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onRejectDeposit(claim.id)}
                              className="flex-1 bg-red-950/80 hover:bg-red-700 active:scale-95 text-red-200 hover:text-white border border-red-800/60 hover:border-red-600 font-bold text-xs uppercase py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition shadow-md shadow-red-950/50 cursor-pointer"
                              id={`reject_dep_${claim.id}`}
                            >
                              <X className="w-4 h-4 stroke-[2.5]" />
                              <span>Reject (अस्वीकार करें)</span>
                            </button>
                          </div>
                        )}

                        {claim.status === 'approved' && onAdjustBalance && (
                          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-zinc-900 text-[10px]">
                            <span className="text-emerald-400 font-mono flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" />
                              ₹{claim.amount.toLocaleString('en-IN')} Balance Sync Active
                            </span>
                            <button
                              type="button"
                              onClick={() => onAdjustBalance((balance ?? 0) + claim.amount)}
                              className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-emerald-300 border border-zinc-800 transition font-mono cursor-pointer"
                              title="Re-credit this amount to Gaming Account if needed"
                            >
                              + Add to Wallet (₹{claim.amount})
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* WITHDRAWALS LIST */
              <div className="flex-1 flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => {
                      const count = f === 'all' 
                        ? withdrawals.length 
                        : withdrawals.filter(w => w.status === f).length;
                      return (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setWithdrawFilter(f)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
                            withdrawFilter === f
                              ? 'bg-red-600 text-white shadow-sm'
                              : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border border-zinc-800'
                          }`}
                        >
                          <span>{f}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            withdrawFilter === f ? 'bg-red-950/80 text-red-200' : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {withdrawals.filter(w => w.status === 'pending').length > 0 && onApproveAllWithdrawals && (
                    <button
                      type="button"
                      onClick={onApproveAllWithdrawals}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-lg flex items-center gap-1 transition shadow-sm cursor-pointer shrink-0"
                      id="admin_approve_all_withdrawals_btn"
                    >
                      <Check className="w-3 h-3" />
                      Approve All Pending ({withdrawals.filter(w => w.status === 'pending').length})
                    </button>
                  )}
                </div>

                {withdrawals.filter(w => w.status === 'pending').length > 0 && (
                  <div className="mb-3 p-2.5 bg-amber-950/30 border border-amber-800/40 rounded-xl flex items-center gap-2 text-xs text-amber-300">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>{withdrawals.filter(w => w.status === 'pending').length} Customer Withdrawal(s)</strong> waiting for Admin review. Click <strong>Approve (स्वीकार करें)</strong> to mark paid, or <strong>Reject & Refund (अस्वीकार करें व रिफंड)</strong> to return funds to player wallet.
                    </span>
                  </div>
                )}

                <div className="flex-grow overflow-y-auto max-h-[380px] pr-1 space-y-3" id="admin_withdrawals_list">
                  {withdrawals.filter(w => withdrawFilter === 'all' || w.status === withdrawFilter).length === 0 ? (
                    <div className="h-44 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-center p-4">
                      <Database className="w-8 h-8 text-zinc-700 mb-2" />
                      <p className="text-xs text-zinc-500 font-medium">No {withdrawFilter !== 'all' ? withdrawFilter : ''} withdrawals found</p>
                      <p className="text-[10px] text-zinc-600 mt-1 max-w-[220px]">
                        Customer withdrawal payout requests appear here in real-time.
                      </p>
                    </div>
                  ) : (
                    withdrawals
                      .filter(w => withdrawFilter === 'all' || w.status === withdrawFilter)
                      .slice()
                      .reverse()
                      .map((request, idx) => (
                      <div 
                        key={`${request.id}-${idx}`} 
                        className={`p-3.5 rounded-xl border transition ${
                          request.status === 'pending' 
                            ? 'bg-zinc-950 border-red-600/50 shadow-md shadow-red-950/20' 
                            : request.status === 'approved' 
                            ? 'bg-zinc-950/60 border-emerald-900/40' 
                            : 'bg-zinc-950/40 border-zinc-900 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-red-400 font-mono">₹{request.amount.toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">({request.id})</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                            request.status === 'pending'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-600/50 animate-pulse'
                              : request.status === 'approved'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                              : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                          }`}>
                            {request.status === 'pending' ? (
                              <>
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>Pending (समीक्षा बाकी)</span>
                              </>
                            ) : request.status === 'approved' ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Paid (स्वीकृत व भुगतान)</span>
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3 text-red-400" />
                                <span>Rejected & Refunded (रिफंडेड)</span>
                              </>
                            )}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 mt-2.5 pt-2 border-t border-zinc-900 text-[11px] text-zinc-400 font-mono">
                          <div>Payout ID:</div>
                          <div className="text-right text-zinc-200 font-bold">{request.id}</div>
                          <div>Method:</div>
                          <div className="text-right text-white font-bold uppercase">{request.method}</div>
                          
                          {request.method === 'upi' ? (
                            <>
                              <div>Customer UPI ID:</div>
                              <div className="text-right text-emerald-400 font-bold select-all">{request.upiId}</div>
                            </>
                          ) : (
                            <>
                              <div>Bank Name:</div>
                              <div className="text-right text-white text-[10px] truncate">{request.bankName}</div>
                              <div>Account No:</div>
                              <div className="text-right text-white select-all font-bold">{request.accountNumber}</div>
                              <div>IFSC Code:</div>
                              <div className="text-right text-white select-all uppercase">{request.ifscCode}</div>
                            </>
                          )}
                          
                          <div>Requested At:</div>
                          <div className="text-right text-zinc-500">
                            {new Date(request.timestamp).toLocaleTimeString()}
                          </div>
                        </div>

                        {/* Customer Withdrawal Approve & Reject Controls */}
                        {request.status === 'pending' && (
                          <div className="flex gap-2.5 mt-3 pt-2.5 border-t border-zinc-850">
                            <button
                              type="button"
                              onClick={() => onApproveWithdrawal(request.id)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs uppercase py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition shadow-md shadow-emerald-950/50 cursor-pointer"
                              id={`approve_wth_${request.id}`}
                            >
                              <Check className="w-4 h-4 stroke-[2.5]" />
                              <span>Approve Payout (स्वीकार करें)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onRejectWithdrawal(request.id)}
                              className="flex-1 bg-red-950/80 hover:bg-red-700 active:scale-95 text-red-200 hover:text-white border border-red-800/60 hover:border-red-600 font-bold text-xs uppercase py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition shadow-md shadow-red-950/50 cursor-pointer"
                              id={`reject_wth_${request.id}`}
                            >
                              <X className="w-4 h-4 stroke-[2.5]" />
                              <span>Reject & Refund (अस्वीकार करें)</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-zinc-800 mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={onResetStats}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Metrics & Records
              </button>
              <span className="text-[10px] text-zinc-600 font-mono">UTC Logged Terminal</span>
            </div>
          </div>

        </div>
      </div>

      {/* Live Production Launch Control Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-950 border border-red-900/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-950/80 border border-red-800/50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Live Environment Reset & Re-Initialization</span>
              <span className="bg-emerald-950 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-800/40">
                Production Ready
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Cleanly reset all wallet balances to ₹0, wipe transaction logs, clear multiplier histories, and re-initialize the live environment.
            </p>
          </div>
        </div>
        {onPurgeAllDemoData && (
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to reset all game data? This will reset the wallet balance to ₹0, wipe multiplier history, zero out all metrics, and re-initialize the live environment.')) {
                onPurgeAllDemoData();
              }
            }}
            className="bg-red-900/80 hover:bg-red-800 border border-red-700/60 hover:border-red-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition active:scale-95 cursor-pointer shrink-0 shadow-lg shadow-red-950/50"
            id="purge_demo_data_btn"
          >
            <Trash2 className="w-4 h-4 text-red-300" />
            Reset Data & Re-Initialize Live
          </button>
        )}
      </div>

      {/* Admin Screenshot Proof Modal */}
      {proofModalUrl && (
        <div 
          className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4"
          onClick={() => setProofModalUrl(null)}
        >
          <div 
            className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl space-y-3 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>User Payment Screenshot</span>
              </span>
              <button 
                onClick={() => setProofModalUrl(null)}
                className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-xl bg-black flex items-center justify-center p-2">
              <img src={proofModalUrl} alt="Deposit Proof" className="max-h-[65vh] object-contain rounded-lg" />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setProofModalUrl(null)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(AdminPanel);
