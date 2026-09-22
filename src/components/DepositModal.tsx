import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  QrCode, 
  Copy, 
  Check, 
  ShieldCheck, 
  Clock, 
  XCircle, 
  Coins, 
  ExternalLink, 
  Sparkles, 
  Download, 
  ArrowRight,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Eye,
  Trash2
} from 'lucide-react';
import QRCode from 'qrcode';
import { GameSettings, DepositRequest } from '../types';

interface DepositModalProps {
  onClose: () => void;
  settings: GameSettings;
  userDeposits: DepositRequest[];
  balance?: number;
  onSubmitDeposit?: (
    amount: number,
    screenshotUrl?: string,
    utrId?: string,
    upiIdUsed?: string,
    paymentMethod?: string
  ) => void;
  onSubmitUtr?: (amount: number, utrId: string, upiIdUsed: string) => void;
}

export default function DepositModal({
  onClose,
  settings,
  userDeposits,
  balance,
  onSubmitDeposit,
  onSubmitUtr
}: DepositModalProps) {
  // Configured UPI credentials (dynamic from settings or default)
  const UPI_ID = settings.upiId?.trim() || 'babu0200@ybl';
  const PAYEE_NAME = 'Kamlesh Kumar';

  // 3-Screen Flow State: 1 = Enter Amount, 2 = Payment Method, 3 = Upload Screenshot
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1); // 4 = Success confirmation screen

  // Screen 1: Amount State
  const [amountInput, setAmountInput] = useState('500');
  const [amountError, setAmountError] = useState<string | null>(null);

  // Screen 2: Payment Method State
  const [selectedMethod, setSelectedMethod] = useState<'phonepe' | 'qr'>('phonepe');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrGenerating, setQrGenerating] = useState(false);
  const [useCustomQrImage, setUseCustomQrImage] = useState(false);

  // Screen 3: Screenshot Upload & Verification State
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [screenshotSize, setScreenshotSize] = useState<string>('');
  const [manualUtr, setManualUtr] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Submitted request reference
  const [submittedDeposit, setSubmittedDeposit] = useState<{
    id: string;
    amount: number;
    utr: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const presets = [100, 200, 500, 1000, 2000, 5000];
  const finalAmount = parseFloat(amountInput) || 100;

  const encodedUpi = encodeURIComponent(UPI_ID);
  const encodedName = encodeURIComponent(PAYEE_NAME);
  const transactionNote = encodeURIComponent(`Deposit to ${PAYEE_NAME}`);

  // UPI Intent URL
  const upiIntentUrl = `upi://pay?pa=${encodedUpi}&pn=${encodedName}&am=${finalAmount}&cu=INR&tn=${transactionNote}`;
  
  // PhonePe Deep Link URL (opens PhonePe app directly)
  const phonePeDeepLink = `phonepe://pay?pa=${encodedUpi}&pn=${encodedName}&am=${finalAmount}&cu=INR&tn=${transactionNote}`;

  // Dynamically generate scannable QR code on the client-side
  useEffect(() => {
    let isMounted = true;
    setQrGenerating(true);

    QRCode.toDataURL(upiIntentUrl, {
      width: 320,
      margin: 1.5,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0a0a0c',
        light: '#ffffff'
      }
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setQrGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Client-side QR generation error:', err);
        if (isMounted) {
          setQrGenerating(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [upiIntentUrl]);

  // Step 1: Validate Amount & Go to Step 2
  const handleProceedToStep2 = () => {
    const amt = parseFloat(amountInput);
    if (isNaN(amt) || amt < 100) {
      setAmountError('Minimum deposit amount is ₹100.');
      return;
    }
    if (amt > 100000) {
      setAmountError('Maximum single deposit limit is ₹1,00,000.');
      return;
    }
    setAmountError(null);
    setCurrentStep(2);
  };

  // Step 2: Handle PhonePe direct click
  const handlePhonePeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = phonePeDeepLink;
    setTimeout(() => {
      window.location.href = upiIntentUrl;
    }, 1200);
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const copyIntentLink = () => {
    navigator.clipboard.writeText(upiIntentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const downloadQrCode = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `UPI-QR-KamleshKumar-Rs${finalAmount}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Step 3: Handle File Upload (Drag and Drop + Manual Selection)
  const processImageFile = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit. Please upload a smaller screenshot.');
      return;
    }

    setScreenshotFile(file);
    setScreenshotName(file.name);
    setScreenshotSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setScreenshotPreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processImageFile(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setScreenshotName('');
    setScreenshotSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Step 3
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!screenshotPreview) {
      setUploadError('Please upload a screenshot of your successful payment receipt.');
      return;
    }

    const cleanUtr = manualUtr.trim() 
      ? manualUtr.trim() 
      : `UTR-${Math.floor(Math.random() * 900000000000 + 100000000000)}`;
    const cleanSenderUpi = 'Direct@UPI';
    const methodUsed = selectedMethod === 'phonepe' ? 'PhonePe' : 'UPI QR';

    setIsSubmitting(true);
    if (onSubmitDeposit) {
      onSubmitDeposit(finalAmount, screenshotPreview, cleanUtr, cleanSenderUpi, methodUsed);
    } else if (onSubmitUtr) {
      onSubmitUtr(finalAmount, cleanUtr, cleanSenderUpi);
    }
    setIsSubmitting(false);
    setSubmittedDeposit({
      id: `DEP-${Math.floor(Math.random() * 90000 + 10000)}`,
      amount: finalAmount,
      utr: cleanUtr
    });
    setCurrentStep(4); // Show final confirmation screen
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto" id="deposit_modal_overlay">
      <div 
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl animate-scale-in my-auto"
        onClick={(e) => e.stopPropagation()}
        id="deposit_modal_container"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span>Add Game Balance</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-normal px-2 py-0.5 rounded-full border border-emerald-700/40">
                  Instant UPI
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Payee: <strong className="text-zinc-200">{PAYEE_NAME}</strong> ({UPI_ID})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {typeof balance === 'number' && (
              <div className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-700/50 rounded-lg text-right">
                <div className="text-[9px] text-zinc-400 uppercase leading-none font-bold">Game Balance</div>
                <div className="text-xs font-mono font-black text-[#28a745]">₹{balance.toFixed(2)}</div>
              </div>
            )}
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
              id="close_deposit_modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3-Screen Stepper Indicator */}
        {currentStep !== 4 && (
          <div className="px-4 sm:px-5 py-3 bg-zinc-950/60 border-b border-zinc-850">
            <div className="flex items-center justify-between">
              {/* Step 1 Indicator */}
              <div 
                onClick={() => currentStep > 1 && setCurrentStep(1)}
                className={`flex items-center gap-2 cursor-pointer transition ${
                  currentStep === 1 
                    ? 'text-emerald-400 font-bold' 
                    : currentStep > 1 
                    ? 'text-zinc-300 hover:text-white' 
                    : 'text-zinc-600'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold transition ${
                  currentStep === 1 
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/30' 
                    : currentStep > 1 
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50' 
                    : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {currentStep > 1 ? '✓' : '1'}
                </div>
                <span className="text-xs">Amount</span>
              </div>

              <div className={`h-0.5 flex-1 mx-2 transition ${currentStep >= 2 ? 'bg-emerald-600' : 'bg-zinc-800'}`} />

              {/* Step 2 Indicator */}
              <div 
                onClick={() => {
                  if (currentStep > 2) setCurrentStep(2);
                }}
                className={`flex items-center gap-2 transition ${
                  currentStep === 2 
                    ? 'text-emerald-400 font-bold' 
                    : currentStep > 2 
                    ? 'text-zinc-300 hover:text-white cursor-pointer' 
                    : 'text-zinc-600'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold transition ${
                  currentStep === 2 
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/30' 
                    : currentStep > 2 
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50' 
                    : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {currentStep > 2 ? '✓' : '2'}
                </div>
                <span className="text-xs">Payment</span>
              </div>

              <div className={`h-0.5 flex-1 mx-2 transition ${currentStep >= 3 ? 'bg-emerald-600' : 'bg-zinc-800'}`} />

              {/* Step 3 Indicator */}
              <div className={`flex items-center gap-2 transition ${
                currentStep === 3 
                  ? 'text-emerald-400 font-bold' 
                  : 'text-zinc-600'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold transition ${
                  currentStep === 3 
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/30' 
                    : 'bg-zinc-800 text-zinc-500'
                }`}>
                  3
                </div>
                <span className="text-xs">Screenshot</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[82vh] overflow-y-auto">

          {/* ========================================================================= */}
          {/* SCREEN 1: ENTER THE AMOUNT                                                */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-4" id="screen_1_enter_amount">
              <div className="text-center space-y-1 pb-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-950/70 border border-emerald-800/40 px-3 py-0.5 rounded-full">
                  Step 1 of 3
                </span>
                <h4 className="text-base font-bold text-white pt-1">Enter Deposit Amount</h4>
                <p className="text-xs text-zinc-400">
                  Select or type the amount you want to add to your in-game balance.
                </p>
              </div>

              {amountError && (
                <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-xs text-red-300 font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{amountError}</span>
                </div>
              )}

              {/* Large Amount Input Box */}
              <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-850 space-y-3 text-center">
                <label className="text-[11px] uppercase font-bold tracking-wider text-zinc-400 block">
                  Amount in Indian Rupees (INR)
                </label>

                <div className="relative max-w-xs mx-auto">
                  <span className="absolute left-4 top-3 font-black text-emerald-400 text-2xl">₹</span>
                  <input
                    type="number"
                    min="100"
                    max="100000"
                    step="50"
                    value={amountInput}
                    onChange={(e) => {
                      setAmountInput(e.target.value);
                      setAmountError(null);
                    }}
                    autoFocus
                    className="w-full bg-zinc-900 border-2 border-zinc-800 focus:border-emerald-500 rounded-2xl pl-10 pr-4 py-3 text-2xl sm:text-3xl text-white font-mono font-black text-center outline-none transition shadow-inner"
                    placeholder="500"
                    id="deposit_amount_input"
                  />
                </div>

                <div className="text-xs text-zinc-400 flex items-center justify-center gap-1">
                  <span>Minimum Deposit:</span>
                  <strong className="text-emerald-400 font-mono">₹100</strong>
                  <span className="text-zinc-600 mx-1">•</span>
                  <span className="text-zinc-400">Zero Processing Fees</span>
                </div>

                {/* Quick Presets Grid */}
                <div className="pt-2">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-2">
                    Quick Preset Amounts:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {presets.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setAmountInput(p.toString());
                          setAmountError(null);
                        }}
                        className={`py-2 px-1 rounded-xl border text-center font-mono font-bold text-xs transition duration-150 active:scale-95 cursor-pointer ${
                          amountInput === p.toString()
                            ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-400/30'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        ₹{p.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payee Info Banner */}
              <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-850 flex items-center justify-between text-xs">
                <div className="text-left">
                  <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Payment Destination</span>
                  <strong className="text-zinc-200">{PAYEE_NAME}</strong>
                  <span className="text-zinc-400 ml-1.5 font-mono">({UPI_ID})</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-800/40">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified UPI
                </div>
              </div>

              {/* Step 1 Primary Action */}
              <button
                type="button"
                onClick={handleProceedToStep2}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/50 active:scale-95 cursor-pointer"
                id="btn_continue_to_payment_method"
              >
                <span>Continue with ₹{finalAmount.toLocaleString('en-IN')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 2: CHOOSE PAYMENT METHOD                                           */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-4" id="screen_2_choose_payment_method">
              {/* Header with Amount Banner */}
              <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-850">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                    title="Change Amount"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Step 2: Choose Payment Method</span>
                    <h4 className="text-xs font-bold text-white">Recharge: ₹{finalAmount.toLocaleString('en-IN')}</h4>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                >
                  Edit Amount
                </button>
              </div>

              {/* Payment Method Selector Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Method 1: PhonePe Deep Link */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('phonepe')}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                    selectedMethod === 'phonepe'
                      ? 'bg-purple-950/80 border-purple-500 text-white ring-2 ring-purple-500/40 shadow-lg shadow-purple-950/50'
                      : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-750'
                  }`}
                  id="method_tab_phonepe"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#5f259f] text-white flex items-center justify-center font-black text-lg shadow-md shrink-0 border border-purple-400/30">
                    पे
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black text-white flex items-center justify-between">
                      <span>PhonePe</span>
                      {selectedMethod === 'phonepe' && (
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                      )}
                    </div>
                    <span className="text-[10px] text-purple-300 block truncate">
                      Instant App Deep Link
                    </span>
                  </div>
                </button>

                {/* Method 2: Dynamic QR Code */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('qr')}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                    selectedMethod === 'qr'
                      ? 'bg-emerald-950/80 border-emerald-500 text-white ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/50'
                      : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-750'
                  }`}
                  id="method_tab_qr"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0 border border-emerald-400/30">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black text-white flex items-center justify-between">
                      <span>UPI QR Code</span>
                      {selectedMethod === 'qr' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-300 block truncate">
                      Scan with any App
                    </span>
                  </div>
                </button>
              </div>

              {/* Selected Method Interactive Box */}
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 space-y-3.5">
                {selectedMethod === 'phonepe' ? (
                  /* Option 1: Pay via PhonePe */
                  <div className="space-y-3" id="screen_2_phonepe_content">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-850">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#5f259f] text-white flex items-center justify-center font-black text-xs">
                          पे
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">PhonePe Instant Payment</h4>
                          <p className="text-[10px] text-zinc-400">Payee: {PAYEE_NAME}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-black text-purple-400">
                        ₹{finalAmount}
                      </span>
                    </div>

                    {/* Prominent Direct Button to Open PhonePe */}
                    <a
                      href={phonePeDeepLink}
                      onClick={handlePhonePeClick}
                      className="w-full py-3 px-4 bg-gradient-to-r from-[#5f259f] via-[#6f2db7] to-[#7b32c6] hover:from-[#6c2bb4] hover:to-[#8a38de] border border-purple-400/40 rounded-xl flex items-center justify-center gap-2.5 text-white font-black text-sm shadow-xl shadow-purple-950/60 active:scale-95 transition cursor-pointer"
                      id="btn_open_phonepe_direct"
                    >
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                        पे
                      </div>
                      <span>Pay ₹{finalAmount} in PhonePe App</span>
                      <ExternalLink className="w-4 h-4 ml-0.5 opacity-80" />
                    </a>

                    {/* Payee credentials box */}
                    <div className="p-2.5 bg-zinc-900/80 rounded-xl border border-zinc-800 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Payee:</span>
                        <strong className="text-white font-mono">{PAYEE_NAME}</strong>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>UPI ID:</span>
                        <span className="text-emerald-400 font-mono font-bold select-all">{UPI_ID}</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Recharge Amount:</span>
                        <span className="text-white font-mono font-bold">₹{finalAmount}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Option 2: Scan UPI QR Code */
                  <div className="flex flex-col items-center justify-center space-y-3" id="screen_2_qr_content">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/70 border border-emerald-500/40 rounded-full text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{useCustomQrImage && settings.qrCodeUrl ? 'Merchant UPI QR' : 'Dynamic Scannable QR Code'}</span>
                    </div>

                    {settings.qrCodeUrl && (
                      <div className="flex bg-zinc-950 border border-zinc-800 p-0.5 rounded-lg text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setUseCustomQrImage(false)}
                          className={`px-2.5 py-1 rounded-md transition ${!useCustomQrImage ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                        >
                          Auto Amount QR (₹{finalAmount})
                        </button>
                        <button
                          type="button"
                          onClick={() => setUseCustomQrImage(true)}
                          className={`px-2.5 py-1 rounded-md transition ${useCustomQrImage ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                        >
                          Merchant QR
                        </button>
                      </div>
                    )}

                    {/* Scannable QR Image Card */}
                    <div className="p-3.5 bg-white rounded-2xl shadow-2xl relative border-2 border-emerald-500/20 flex flex-col items-center">
                      {qrGenerating && !useCustomQrImage && (
                        <div className="absolute inset-0 bg-white/90 rounded-2xl flex items-center justify-center z-10">
                          <span className="text-xs font-mono font-bold text-zinc-900 animate-pulse">
                            Generating QR...
                          </span>
                        </div>
                      )}

                      {useCustomQrImage && settings.qrCodeUrl ? (
                        <img 
                          src={settings.qrCodeUrl} 
                          alt={`Merchant QR Code - ${PAYEE_NAME}`}
                          className="w-44 h-44 sm:w-48 sm:h-48 object-contain select-none rounded-lg"
                        />
                      ) : qrDataUrl ? (
                        <img 
                          src={qrDataUrl} 
                          alt={`UPI QR Code - ${PAYEE_NAME} - ₹${finalAmount}`}
                          className="w-44 h-44 sm:w-48 sm:h-48 object-contain select-none"
                        />
                      ) : (
                        <div className="w-44 h-44 flex items-center justify-center text-zinc-700">
                          <RefreshCw className="w-6 h-6 animate-spin" />
                        </div>
                      )}

                      <div className="mt-2 text-center">
                        <div className="text-xs font-bold text-zinc-900">{PAYEE_NAME}</div>
                        <div className="text-[11px] font-mono font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mt-0.5 border border-emerald-200">
                          ₹{finalAmount} INR
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 text-center">
                      Scan with Google Pay, PhonePe, Paytm, CRED, or BHIM
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={downloadQrCode}
                        disabled={!qrDataUrl}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-800 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Download QR</span>
                      </button>
                      <button
                        type="button"
                        onClick={copyIntentLink}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-800 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Link Copied' : 'Copy Intent URL'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Copy UPI bar */}
                <div className="flex items-center justify-between p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs">
                  <div className="text-left">
                    <span className="text-[9px] uppercase font-bold text-zinc-500 block">UPI ID:</span>
                    <span className="font-mono font-bold text-white select-all">{UPI_ID}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={copyUpiId}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer border border-zinc-700"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUpi ? 'Copied' : 'Copy UPI'}</span>
                  </button>
                </div>
              </div>

              {/* Instructions banner for Screen 3 */}
              <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Important:</strong> After paying, take a screenshot of your payment confirmation screen / receipt, then proceed to the next step.
                </span>
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-bold text-xs rounded-xl border border-zinc-800 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/40 active:scale-95 cursor-pointer"
                  id="btn_proceed_to_upload_screenshot"
                >
                  <span>I Have Paid • Upload Screenshot</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 3: UPLOAD PAYMENT SCREENSHOT                                       */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <form onSubmit={handleFinalSubmit} className="space-y-4" id="screen_3_upload_screenshot">
              {/* Header with Amount & Method Summary */}
              <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-850">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                    title="Back to Payment Method"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Step 3 of 3: Upload Proof</span>
                    <h4 className="text-xs font-bold text-white">
                      Confirming ₹{finalAmount.toLocaleString('en-IN')} via {selectedMethod === 'phonepe' ? 'PhonePe' : 'UPI QR'}
                    </h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 block">Payee</span>
                  <span className="text-xs font-mono font-bold text-zinc-300">{PAYEE_NAME}</span>
                </div>
              </div>

              {uploadError && (
                <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-xs text-red-300 font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Screenshot Drag & Drop / File Upload Area */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase font-bold tracking-wider text-zinc-300 flex items-center justify-between">
                  <span>Payment Screenshot Receipt <span className="text-emerald-400">*</span></span>
                  <span className="text-[10px] text-zinc-500 font-normal">PNG, JPG, WEBP (Max 10MB)</span>
                </label>

                {screenshotPreview ? (
                  /* Uploaded Image Preview Box */
                  <div className="p-3 bg-zinc-950 rounded-2xl border border-emerald-500/40 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-20 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 shrink-0 relative group">
                        <img 
                          src={screenshotPreview} 
                          alt="Uploaded payment proof" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewModalOpen(true)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="min-w-0 flex-1 space-y-1 text-left">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-xs font-bold text-white truncate block">
                            {screenshotName || 'Screenshot Attached'}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400">{screenshotSize} • Image ready for verification</p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setPreviewModalOpen(true)}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Preview</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveScreenshot}
                            className="text-[11px] text-red-400 hover:text-red-300 font-bold underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty Dropzone for File Upload */
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition cursor-pointer ${
                      isDragOver
                        ? 'border-emerald-500 bg-emerald-950/20'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900/60'
                    }`}
                    id="screenshot_dropzone"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                      id="screenshot_file_input"
                    />

                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-105 transition">
                      <Upload className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white">
                        Click to select or drag & drop payment screenshot
                      </p>
                      <p className="text-[10px] text-zinc-400 max-w-xs">
                        Upload the screenshot showing transaction status, amount ₹{finalAmount}, and recipient {PAYEE_NAME}.
                      </p>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="px-3 py-1 bg-zinc-900 rounded-lg text-[11px] font-bold text-zinc-300 border border-zinc-800">
                        Browse Device Gallery / Files
                      </span>
                    </div>
                  </div>
                )}

                {/* Optional UTR / Reference Number Field */}
                <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850 space-y-1 text-left">
                  <label htmlFor="input_manual_utr" className="text-[11px] font-bold text-zinc-300 flex items-center justify-between">
                    <span>12-Digit UTR / Ref No.</span>
                    <span className="text-[10px] text-zinc-500 font-normal">Optional</span>
                  </label>
                  <input
                    id="input_manual_utr"
                    type="text"
                    placeholder="e.g., 426819283719"
                    value={manualUtr}
                    onChange={(e) => setManualUtr(e.target.value.replace(/\s+/g, ''))}
                    maxLength={22}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-zinc-700 outline-none"
                  />
                  <p className="text-[10px] text-zinc-500">
                    Found on your payment app receipt (Google Pay, PhonePe, Paytm).
                  </p>
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-bold text-xs rounded-xl border border-zinc-800 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/40 active:scale-95 cursor-pointer"
                  id="btn_submit_deposit_proof"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting Proof...</span>
                    </span>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Submit Proof & Claim ₹{finalAmount.toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 4: SUCCESS CONFIRMATION STATE                                      */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-4 text-center py-3" id="screen_deposit_success">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto shadow-xl shadow-emerald-500/20 animate-bounce">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-black text-white">Deposit Submitted Successfully!</h4>
                <p className="text-xs text-zinc-300 max-w-sm mx-auto">
                  पेमेंट सफलतापूर्वक सबमिट हो गया है। जैसे ही एडमिन पैनल से आपका डिपॉजिट <strong>Approve (स्वीकार)</strong> होगा, <strong className="text-emerald-400 font-mono">₹{submittedDeposit?.amount || finalAmount}</strong> सीधे आपके <strong>गेमिंग अकाउंट (Wallet)</strong> में जुड़ जाएगा।
                </p>
              </div>

              <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-850 text-left text-xs font-mono space-y-1.5 max-w-sm mx-auto">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Amount Claimed:</span>
                  <strong className="text-emerald-400 font-bold">₹{submittedDeposit?.amount || finalAmount}</strong>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Payee:</span>
                  <span className="text-zinc-200">{PAYEE_NAME}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>UTR / Ref ID:</span>
                  <span className="text-zinc-300">{submittedDeposit?.utr || 'Under verification'}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Status:</span>
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending Verification
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleRemoveScreenshot();
                    setCurrentStep(1);
                  }}
                  className="flex-1 py-3 px-4 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-bold text-xs rounded-xl border border-zinc-800 transition cursor-pointer"
                >
                  Make Another Deposit
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-lg shadow-emerald-950/50"
                >
                  Back to Game
                </button>
              </div>
            </div>
          )}

          {/* Section: Recent Recharge Queue History */}
          <div className="border-t border-zinc-850 pt-3">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Recharge Queue & History
            </h4>

            <div className="space-y-2 max-h-24 overflow-y-auto pr-1" id="deposit_history_list">
              {userDeposits.length === 0 ? (
                <p className="text-[10px] text-zinc-600 italic text-center py-1">No recharge requests logged yet</p>
              ) : (
                userDeposits.slice().reverse().map((dep, idx) => (
                  <div key={`${dep.id}-${idx}`} className="p-2 bg-zinc-950/70 rounded-xl border border-zinc-850 flex items-center justify-between text-[11px] font-mono">
                    <div className="space-y-0.5">
                      <div className="text-white font-bold">₹{dep.amount}</div>
                      <div className="text-[9px] text-zinc-500">Ref: {dep.utrId || dep.id}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {dep.status === 'pending' ? (
                        <span className="flex items-center gap-1 text-amber-500 text-[10px] font-bold uppercase bg-amber-950/20 px-2 py-0.5 border border-amber-900/30 rounded-full">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      ) : dep.status === 'approved' ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold uppercase bg-emerald-950/20 px-2 py-0.5 border border-emerald-900/30 rounded-full">
                          <ShieldCheck className="w-3 h-3" />
                          Credited
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400 text-[10px] font-bold uppercase bg-red-950/20 px-2 py-0.5 border border-red-900/30 rounded-full">
                          <XCircle className="w-3 h-3" />
                          Declined
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Section: Telegram Live Support for Deposit Help */}
          <div className="p-3 bg-[#0088cc]/10 border border-[#0088cc]/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0088cc] flex items-center justify-center text-white shrink-0">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
              </div>
              <div>
                <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <span>Recharge Help & Instant Approval</span>
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

        {/* Modal Footer */}
        <div className="px-5 py-2.5 bg-zinc-950 border-t border-zinc-850 flex items-center justify-between text-[10px] text-zinc-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Verified Gateway • {PAYEE_NAME}
          </span>
          <span>SECURE 256-BIT SSL</span>
        </div>
      </div>

      {/* Lightbox / Modal for previewing screenshot full size */}
      {previewModalOpen && screenshotPreview && (
        <div 
          className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4"
          onClick={() => setPreviewModalOpen(false)}
        >
          <div 
            className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl space-y-3 p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>Screenshot Preview</span>
              </span>
              <button 
                onClick={() => setPreviewModalOpen(false)}
                className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-xl bg-black flex items-center justify-center">
              <img src={screenshotPreview} alt="Proof preview" className="max-h-[65vh] object-contain" />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
