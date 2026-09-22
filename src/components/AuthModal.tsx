import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  User, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { UserAccount } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLogin: (mobileNumber: string) => void;
  onLogout: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(clean);
    setErrorMsg('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('Please enter your account password (minimum 4 characters).');
      return;
    }

    setErrorMsg('');
    setSuccessMsg(`Welcome back! Logging in as ${countryCode} ${mobileNumber}...`);
    setTimeout(() => {
      onLogin(`${countryCode} ${mobileNumber}`);
      setSuccessMsg('');
      onClose();
    }, 600);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match! Please check again.');
      return;
    }
    if (!termsAccepted) {
      setErrorMsg('You must be 18+ and agree to the terms of service.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg(`Account created successfully! Logging you in...`);
    setTimeout(() => {
      onLogin(`${countryCode} ${mobileNumber}`);
      setSuccessMsg('');
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" id="auth_modal_overlay">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-md" 
        onClick={onClose}
      />

      {/* Main Auth Container */}
      <div 
        className="relative w-full max-w-[420px] bg-[#121418] border border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-2xl shadow-red-950/30 overflow-hidden z-10"
        onClick={(e) => e.stopPropagation()}
        id="auth_modal_container"
      >
        {/* Glow accent */}
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-48 h-28 bg-red-600/25 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          id="auth_modal_close_btn"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Aviator Logo Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center gap-2.5 mb-1.5">
            <span className="font-serif italic font-black text-red-600 text-3xl sm:text-4xl tracking-tight drop-shadow-[0_3px_10px_rgba(220,38,38,0.55)] font-['Brush_Script_MT',cursive,sans-serif]">
              Aviator
            </span>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-600/40">
              <svg className="w-5 h-5 fill-white -rotate-12" viewBox="0 0 24 24">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
            </div>
          </div>
          <p className="text-xs text-zinc-400">
            {currentUser ? "Logged in Player Account" : mode === 'login' ? 'Sign in with your mobile number to play' : 'Register your account to play & cash out'}
          </p>
        </div>

        {/* Currently Logged In View */}
        {currentUser ? (
          <div className="space-y-4 text-center py-2" id="auth_logged_in_view">
            <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-zinc-400 font-medium">Logged in as</div>
                <div className="text-sm font-bold text-white font-mono">{currentUser.mobileNumber}</div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Account Verified &bull; Active
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase rounded-xl transition shadow-lg shadow-red-950/40 cursor-pointer"
              >
                Back to Game
              </button>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setMode('login');
                }}
                className="px-4 py-2.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white font-bold text-xs uppercase rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                title="Sign out of current account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Login / Sign Up Toggle Switcher */}
            <div className="flex bg-[#181a20] border border-[#282c37] p-1 rounded-xl mb-4" id="auth_mode_toggle_group">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'login'
                    ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
                    : 'text-zinc-400 hover:text-white'
                }`}
                id="toggle_login_tab"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMsg(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
                    : 'text-zinc-400 hover:text-white'
                }`}
                id="toggle_signup_tab"
              >
                Sign Up
              </button>
            </div>

            {/* Error or Success Alert */}
            {errorMsg && (
              <div className="mb-3 p-2.5 bg-red-950/40 border border-red-800/60 rounded-xl flex items-center gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-3 p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5" id="login_form_element">
                {/* Mobile Number Field */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Mobile Number
                  </label>
                  <div className="flex bg-[#181b22] border border-zinc-800 rounded-xl overflow-hidden focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-600/20 transition">
                    <div className="flex items-center gap-1 px-3 bg-zinc-900 border-r border-zinc-800 text-xs font-bold text-zinc-300">
                      <span>🇮🇳</span>
                      <select 
                        value={countryCode} 
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="bg-transparent border-none text-zinc-200 text-xs font-bold outline-none cursor-pointer"
                      >
                        <option value="+91" className="bg-zinc-900 text-white">+91</option>
                        <option value="+1" className="bg-zinc-900 text-white">+1</option>
                        <option value="+44" className="bg-zinc-900 text-white">+44</option>
                        <option value="+971" className="bg-zinc-900 text-white">+971</option>
                      </select>
                    </div>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={handleMobileChange}
                      placeholder="Enter 10-digit number"
                      maxLength={10}
                      className="w-full h-10 px-3 bg-transparent text-sm text-white placeholder-zinc-500 font-mono outline-none"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative flex items-center bg-[#181b22] border border-zinc-800 rounded-xl overflow-hidden focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-600/20 transition">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full h-10 pl-3 pr-10 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Options row */}
                <div className="flex items-center justify-between text-xs text-zinc-400 pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-red-600 rounded"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert(`Password reset OTP will be sent to your registered mobile: ${countryCode} ${mobileNumber || 'XXXXXXXXXX'}`)}
                    className="text-red-400 hover:text-red-300 text-xs font-semibold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full h-11 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-red-950/60 cursor-pointer mt-2"
                  id="login_submit_button"
                >
                  <span>Log In to Aviator</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Switch to Signup Link */}
                <div className="text-center pt-2 border-t border-zinc-850 text-xs text-zinc-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setErrorMsg(''); }}
                    className="text-red-400 hover:text-red-300 font-bold hover:underline cursor-pointer"
                  >
                    Sign Up Now
                  </button>
                </div>
              </form>
            ) : (
              /* SIGN UP FORM */
              <form onSubmit={handleSignUpSubmit} className="space-y-3" id="signup_form_element">
                {/* Mobile Number Field */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Mobile Number
                  </label>
                  <div className="flex bg-[#181b22] border border-zinc-800 rounded-xl overflow-hidden focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-600/20 transition">
                    <div className="flex items-center gap-1 px-3 bg-zinc-900 border-r border-zinc-800 text-xs font-bold text-zinc-300">
                      <span>🇮🇳</span>
                      <select 
                        value={countryCode} 
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="bg-transparent border-none text-zinc-200 text-xs font-bold outline-none cursor-pointer"
                      >
                        <option value="+91" className="bg-zinc-900 text-white">+91</option>
                        <option value="+1" className="bg-zinc-900 text-white">+1</option>
                        <option value="+44" className="bg-zinc-900 text-white">+44</option>
                      </select>
                    </div>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={handleMobileChange}
                      placeholder="Enter 10-digit number"
                      maxLength={10}
                      className="w-full h-9 px-3 bg-transparent text-sm text-white placeholder-zinc-500 font-mono outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Create Password */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Create Password
                  </label>
                  <div className="relative flex items-center bg-[#181b22] border border-zinc-800 rounded-xl overflow-hidden focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-600/20 transition">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full h-9 pl-3 pr-10 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <div className="flex items-center bg-[#181b22] border border-zinc-800 rounded-xl overflow-hidden focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-600/20 transition">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full h-9 px-3 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Promo / Referral Code */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Promo / Referral (Optional)
                  </label>
                  <div className="flex items-center bg-[#181b22] border border-zinc-800 rounded-xl overflow-hidden">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="e.g. AVIATOR500"
                      className="w-full h-9 px-3 bg-transparent text-xs text-white placeholder-zinc-500 font-mono outline-none uppercase"
                    />
                  </div>
                </div>

                {/* Terms checkbox */}
                <div className="flex items-start gap-2 pt-1 text-[11px] text-zinc-400">
                  <input
                    type="checkbox"
                    id="signup_modal_terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 accent-red-600 rounded"
                    required
                  />
                  <label htmlFor="signup_modal_terms" className="cursor-pointer">
                    I am 18+ years of age and agree to Aviator Terms of Play.
                  </label>
                </div>

                {/* Submit Sign Up Button */}
                <button
                  type="submit"
                  className="w-full h-11 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-red-950/60 cursor-pointer mt-1"
                  id="signup_submit_button"
                >
                  <span>Create Aviator Account</span>
                  <Sparkles className="w-4 h-4" />
                </button>

                {/* Switch to Login Link */}
                <div className="text-center pt-2 border-t border-zinc-850 text-xs text-zinc-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setErrorMsg(''); }}
                    className="text-red-400 hover:text-red-300 font-bold hover:underline cursor-pointer"
                  >
                    Log In
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 mt-4">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span>256-Bit SSL Encrypted &bull; 100% Provably Fair</span>
        </div>
      </div>
    </div>
  );
}
