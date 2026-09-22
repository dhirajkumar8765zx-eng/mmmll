import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  Clock, 
  XCircle, 
  ArrowUpRight, 
  Building, 
  CreditCard, 
  User,
  ExternalLink
} from 'lucide-react';
import { WithdrawRequest } from '../types';

interface WithdrawModalProps {
  onClose: () => void;
  balance: number;
  userWithdrawals: WithdrawRequest[];
  onSubmitWithdrawal: (
    amount: number, 
    method: 'upi' | 'bank', 
    details: { upiId?: string; bankName?: string; accountNumber?: string; ifscCode?: string }
  ) => void;
}

export default function WithdrawModal({
  onClose,
  balance,
  userWithdrawals,
  onSubmitWithdrawal
}: WithdrawModalProps) {
  const [method, setMethod] = useState<'upi' | 'bank'>('upi');
  const [amountInput, setAmountInput] = useState('1000');
  
  // UPI Form Details
  const [upiId, setUpiId] = useState('');
  
  // Bank Form Details
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const presets = [500, 1000, 2000, 5000, 10000];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amountInput);
    setLocalError(null);
    setLocalSuccess(null);

    if (isNaN(amt)) {
      setLocalError('Please enter a valid amount.');
      return;
    }
    if (amt < 500) {
      setLocalError('Minimum withdrawal amount is ₹500.');
      return;
    }
    if (amt > balance) {
      setLocalError(`Insufficient balance! Your current balance is ₹${balance.toLocaleString('en-IN')}. Please enter an amount within your balance.`);
      return;
    }

    if (method === 'upi') {
      const cleanUpi = upiId.trim();
      if (!cleanUpi || !cleanUpi.includes('@')) {
        setLocalError('Please enter a valid UPI ID (e.g. username@upi).');
        return;
      }
      
      setIsSubmitting(true);
      onSubmitWithdrawal(amt, 'upi', { upiId: cleanUpi });
      setIsSubmitting(false);
      setUpiId('');
      setLocalSuccess(`Withdrawal request of ₹${amt.toLocaleString('en-IN')} submitted and processed instantly!`);

    } else {
      const cleanBank = bankName.trim();
      const cleanAcc = accountNumber.trim();
      const cleanIfsc = ifscCode.trim().toUpperCase();

      if (!cleanBank) {
        setLocalError('Please enter a bank name.');
        return;
      }
      if (cleanAcc.length < 9 || cleanAcc.length > 18 || !/^\d+$/.test(cleanAcc)) {
        setLocalError('Please enter a valid Bank Account Number (9 to 18 digits).');
        return;
      }
      if (cleanIfsc.length !== 11) {
        setLocalError('Please enter a valid 11-digit IFSC code.');
        return;
      }

      setIsSubmitting(true);
      onSubmitWithdrawal(amt, 'bank', {
        bankName: cleanBank,
        accountNumber: cleanAcc,
        ifscCode: cleanIfsc
      });
      setIsSubmitting(false);
      setBankName('');
      setAccountNumber('');
      setIfscCode('');
      setLocalSuccess(`Bank Transfer withdrawal request of ₹${amt.toLocaleString('en-IN')} submitted and processed instantly!`);
    }
  };

  const finalAmount = parseFloat(amountInput) || 0;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" id="withdraw_modal_overlay">
      <div 
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        id="withdraw_modal_container"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Withdraw Funds</h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">Payouts directly to your Bank Account or UPI</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Elegant Inline Notifications */}
          {localError && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-400 font-bold flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{localError}</span>
            </div>
          )}
          {localSuccess && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-bold flex items-start gap-2">
              <span className="shrink-0 mt-0.5">✅</span>
              <span>{localSuccess}</span>
            </div>
          )}

          {/* Active Balance Display inside modal */}
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wide">Withdrawable Balance</span>
            <span className="text-sm font-mono font-black text-emerald-400">
              ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="withdraw_form_single">
            {/* Method selection tabs */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                Select Payout Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition duration-150 cursor-pointer ${
                    method === 'upi'
                      ? 'bg-zinc-900 border-red-500/50 text-white shadow-lg'
                      : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-red-500" />
                  UPI Payout
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('bank')}
                  className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition duration-150 cursor-pointer ${
                    method === 'bank'
                      ? 'bg-zinc-900 border-red-500/50 text-white shadow-lg'
                      : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Building className="w-4 h-4 text-red-500" />
                  Bank Transfer
                </button>
              </div>
            </div>

            {/* Amount input */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                Enter Payout Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 font-bold text-zinc-400">₹</span>
                <input
                  type="number"
                  min="500"
                  max="100000"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl pl-8 pr-4 py-3 text-lg text-white font-mono font-bold outline-none"
                  required
                />
              </div>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-5 gap-1.5">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmountInput(p.toString())}
                  className={`py-2 px-1 rounded-lg border text-center font-mono font-bold text-[11px] transition duration-150 active:scale-95 cursor-pointer ${
                    amountInput === p.toString()
                      ? 'bg-red-950/20 border-red-500 text-white'
                      : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  ₹{p}
                </button>
              ))}
            </div>

            {/* Dynamic Payee Details - IMMEDIATELY visible based on method */}
            <div className="border-t border-zinc-850 pt-4 mt-2">
              {method === 'upi' ? (
                /* UPI ID Input Form - Instantly visible */
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block text-left">
                    Your Payout UPI ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. payeename@okaxis"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm placeholder-zinc-800 outline-none"
                    required
                  />
                  <p className="text-[10px] text-zinc-500 text-left">
                    Double check your UPI Address carefully. Transfers to incorrect addresses cannot be reversed or refunded.
                  </p>
                </div>
              ) : (
                /* Bank details form - Instantly visible */
                <div className="space-y-3 bg-zinc-950 p-4 border border-zinc-850 rounded-xl">
                  <h4 className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 text-left">Recipient Bank Account Details</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-semibold text-zinc-500 block text-left">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. State Bank of India"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-700 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-semibold text-zinc-500 block text-left">Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 30129845771"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder-zinc-700 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-semibold text-zinc-500 block text-left">IFSC Code (11 characters)</label>
                    <input
                      type="text"
                      placeholder="e.g. SBIN0001428"
                      value={ifscCode}
                      maxLength={11}
                      onChange={(e) => setIfscCode(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder-zinc-700 outline-none uppercase"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-zinc-500 leading-normal bg-zinc-950 p-3 rounded-xl border border-zinc-850 space-y-1">
              <p className="text-left">⚠️ <strong>Minimum Payout Limit:</strong> ₹500.</p>
              <p className="text-left">⚡ Payout requests are verified by the operator queue. Funds are instantly reserved from your balance upon request.</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-lg active:scale-95 duration-100 transition cursor-pointer"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Submitting Payout...</span>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  Request Withdrawal
                </>
              )}
            </button>
          </form>

          {/* User Withdrawal Queue History List */}
          <div className="border-t border-zinc-800 pt-4">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Withdrawal Audit Queue
            </h4>

            <div className="space-y-2 max-h-32 overflow-y-auto pr-1" id="withdraw_history_list">
              {userWithdrawals.length === 0 ? (
                <p className="text-[10px] text-zinc-600 italic text-center py-2">No withdrawal actions logged yet</p>
              ) : (
                userWithdrawals.slice().reverse().map((wd, idx) => (
                  <div key={`${wd.id}-${idx}`} className="p-2.5 bg-zinc-950/60 rounded-xl border border-zinc-850 flex items-center justify-between text-[11px] font-mono">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">₹{wd.amount}</span>
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-zinc-500 bg-zinc-900 px-1 rounded border border-zinc-800">
                          {wd.method}
                        </span>
                      </div>
                      <div className="text-[9px] text-zinc-500 break-all leading-normal max-w-[200px]">
                        {wd.method === 'upi' ? `UPI: ${wd.upiId}` : `Bank: ${wd.bankName} (${wd.accountNumber})`}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {wd.status === 'pending' ? (
                        <span className="flex items-center gap-1 text-amber-500 text-[10px] font-bold uppercase bg-amber-950/20 px-2 py-0.5 border border-amber-900/30 rounded-full">
                          <Clock className="w-3 h-3" />
                          Verifying
                        </span>
                      ) : wd.status === 'approved' ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold uppercase bg-emerald-950/20 px-2 py-0.5 border border-emerald-900/30 rounded-full">
                          <ShieldCheck className="w-3 h-3" />
                          Sent
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400 text-[10px] font-bold uppercase bg-red-950/20 px-2 py-0.5 border border-red-900/30 rounded-full">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section: Telegram Live Support for Withdrawal Help */}
          <div className="p-3 bg-[#0088cc]/10 border border-[#0088cc]/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0088cc] flex items-center justify-center text-white shrink-0">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
              </div>
              <div>
                <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <span>Withdrawal Support & Payout Query</span>
                  <span className="text-[9px] px-1 bg-emerald-500/20 text-emerald-400 font-mono rounded">24/7</span>
                </div>
                <div className="text-[10px] text-zinc-400">Telegram: <span className="text-[#0088cc] font-mono font-bold">@lottaygent</span></div>
              </div>
            </div>
            <a
              href="https://t.me/lottaygent"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 bg-[#0088cc] hover:bg-[#0077b5] text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow transition cursor-pointer"
            >
              <span>Chat</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer badges */}
        <div className="px-5 py-3 bg-zinc-950 border-t border-zinc-850 flex items-center justify-between text-[10px] text-zinc-600 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
            OPERATOR GUARANTEE
          </span>
          <span>PCI-DSS COMPLIANT</span>
        </div>
      </div>
    </div>
  );
}
