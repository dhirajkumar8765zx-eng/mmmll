import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Headphones, 
  Zap, 
  MessageCircle,
  HelpCircle
} from 'lucide-react';

interface TelegramSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  telegramId?: string;
}

export const TELEGRAM_SUPPORT_ID = '@lottaygent';
export const TELEGRAM_SUPPORT_LINK = 'https://t.me/lottaygent';

export default function TelegramSupportModal({
  isOpen,
  onClose,
  telegramId = TELEGRAM_SUPPORT_ID
}: TelegramSupportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(telegramId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenTelegram = () => {
    const cleanUsername = telegramId.replace('@', '');
    window.open(`https://t.me/${cleanUsername}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      id="telegram_support_modal_overlay"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal Content */}
      <div 
        className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10"
        onClick={(e) => e.stopPropagation()}
        id="telegram_support_modal_container"
      >
        {/* Header with Telegram Branding */}
        <div className="relative px-5 py-4 bg-gradient-to-r from-[#0088cc]/20 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Telegram Icon */}
            <div className="w-10 h-10 rounded-xl bg-[#0088cc] flex items-center justify-center shadow-lg shadow-[#0088cc]/30 text-white">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">Live Telegram Support</h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ONLINE 24/7
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Official Customer Service & Assistance</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition border border-zinc-800 cursor-pointer"
            id="close_telegram_modal_btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          
          {/* Main Telegram ID Highlight Box */}
          <div className="p-4 bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">
                Support Telegram ID
              </span>
              <span className="text-[10px] text-[#0088cc] font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Avg. reply time: &lt; 2 mins
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-black/60 rounded-xl border border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0088cc]/20 border border-[#0088cc]/30 flex items-center justify-center text-[#0088cc]">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-white font-mono font-black text-base tracking-wide selection:bg-[#0088cc]">
                    {telegramId}
                  </div>
                  <div className="text-[10px] text-zinc-500">Official Aviator Helpdesk</div>
                </div>
              </div>

              {/* Copy Button */}
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-zinc-700"
                id="copy_telegram_id_btn"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct Open Button */}
            <button
              type="button"
              onClick={handleOpenTelegram}
              className="w-full py-3 px-4 bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#0088cc]/30 transition active:scale-98 cursor-pointer"
              id="open_telegram_direct_btn"
            >
              <span>Chat on Telegram ({telegramId})</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Assistance Categories */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
              How Can We Help You?
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-zinc-900/60 border border-zinc-850 rounded-xl space-y-1">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5 text-[11px]">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Recharge & Deposit</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-snug">
                  Fast confirmation for UPI, QR & bank transfers.
                </p>
              </div>

              <div className="p-2.5 bg-zinc-900/60 border border-zinc-850 rounded-xl space-y-1">
                <div className="text-red-400 font-bold flex items-center gap-1.5 text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Instant Withdrawal</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-snug">
                  Quick status verification and payout inquiries.
                </p>
              </div>

              <div className="p-2.5 bg-zinc-900/60 border border-zinc-850 rounded-xl space-y-1">
                <div className="text-amber-400 font-bold flex items-center gap-1.5 text-[11px]">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Bonus & Free Bets</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-snug">
                  Claim special voucher codes and reload rewards.
                </p>
              </div>

              <div className="p-2.5 bg-zinc-900/60 border border-zinc-850 rounded-xl space-y-1">
                <div className="text-purple-400 font-bold flex items-center gap-1.5 text-[11px]">
                  <Headphones className="w-3.5 h-3.5" />
                  <span>VIP Priority Support</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-snug">
                  Dedicated manager support for high rollers.
                </p>
              </div>
            </div>
          </div>

          {/* Security & Authenticity Notice */}
          <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-xl flex items-start gap-2.5 text-[11px] text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Always verify the Telegram username is strictly <strong className="text-white font-mono">{telegramId}</strong>. We will never ask for your account password or PIN.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-zinc-950 border-t border-zinc-850 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="font-mono">Direct Support: {telegramId}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
