import { useState } from 'react';
import { Lock, Fingerprint, ShieldAlert, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface SecurityLockProps {
  onUnlock: () => void;
}

export default function SecurityLock({ onUnlock }: SecurityLockProps) {
  const [pin, setPin] = useState<string>('');
  const [errorCount, setErrorCount] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showBiometricSim, setShowBiometricSim] = useState<boolean>(false);

  const handleNumClick = (num: number) => {
    setErrorMsg('');
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin === '1234') {
        onUnlock();
      } else if (nextPin.length === 4) {
        setTimeout(() => {
          setErrorCount(prev => prev + 1);
          setErrorMsg('Incorrect Security PIN. Hint: 1 2 3 4');
          setPin('');
        }, 300);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const triggerBiometricUnlock = () => {
    setShowBiometricSim(true);
    setTimeout(() => {
      onUnlock();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 select-none text-white relative overflow-hidden" id="passcode-shield-container">
      {/* Background radial spotlights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {showBiometricSim ? (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center space-y-6 text-center max-w-sm">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center animate-pulse">
              <Fingerprint className="w-12 h-12 text-emerald-400" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400/50 animate-ping" />
          </div>
          <div>
            <h2 className="text-xl font-sans font-bold text-white tracking-tight mt-0">Authenticating Face ID</h2>
            <p className="text-xs text-slate-400 mt-2">Checking encrypted on-device keychain store...</p>
          </div>
        </motion.div>
      ) : (
        <div className="w-full max-w-sm flex flex-col items-center space-y-8">
          {/* Top Shield Header */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950/40 mb-4 border border-emerald-400/20">
              <Lock className="w-7 h-7 text-slate-950" />
            </div>
            <h1 className="text-xl font-sans font-extrabold text-white tracking-tight mt-0">Secure Vault Access</h1>
            <p className="text-xs text-slate-400 mt-1">Please type your secure 4-digit mobile PIN</p>
          </div>

          {/* Pin Dots indicators */}
          <div className="flex items-center gap-4 py-2">
            {[0, 1, 2, 3].map((index) => {
              const hasDigit = pin.length > index;
              return (
                <div
                  key={index}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                    hasDigit
                      ? 'bg-emerald-400 scale-125 shadow-md shadow-emerald-400/50'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                />
              );
            })}
          </div>

          {/* Feedback message display */}
          <div className="h-6 flex items-center justify-center text-center">
            {errorMsg ? (
              <motion.div initial={{ y: 2, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
              </motion.div>
            ) : pin.length > 0 ? (
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest animate-pulse">Entering Lock PIN...</span>
            ) : (
              <span className="text-[10px] text-slate-500 font-mono">Demo Passcode: <span className="text-emerald-400 font-bold">1 2 3 4</span></span>
            )}
          </div>

          {/* Numeric keypad grid */}
          <div className="grid grid-cols-3 gap-y-4 gap-x-6 w-full px-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumClick(num)}
                className="w-16 h-16 rounded-full bg-slate-900 border border-slate-850 hover:bg-slate-850 hover:border-slate-800 active:scale-95 transition-all text-lg font-bold flex items-center justify-center cursor-pointer shadow-sm tracking-tighter"
              >
                {num}
              </button>
            ))}
            
            {/* Action bottoms */}
            <button
              onClick={triggerBiometricUnlock}
              className="w-16 h-16 rounded-full bg-emerald-900/20 border border-emerald-800/15 hover:bg-emerald-900/30 hover:border-emerald-800/30 active:scale-95 transition-all flex items-center justify-center text-emerald-400 cursor-pointer"
              title="Touch ID Simulation"
            >
              <Fingerprint className="w-6 h-6" />
            </button>
            
            <button
              onClick={() => handleNumClick(0)}
              className="w-16 h-16 rounded-full bg-slate-900 border border-slate-850 hover:bg-slate-850 hover:border-slate-800 active:scale-95 transition-all text-lg font-bold flex items-center justify-center cursor-pointer"
            >
              0
            </button>

            <button
              onClick={handleDelete}
              className="w-16 h-16 rounded-full bg-slate-900 border border-slate-850 hover:bg-slate-850 hover:border-slate-800 active:scale-95 transition-all text-xs font-semibold tracking-tight text-slate-400 flex items-center justify-center cursor-pointer"
            >
              Delete
            </button>
          </div>

          <button
            onClick={onUnlock}
            className="text-xs text-slate-400 hover:text-white transition-all flex items-center gap-1 border-b border-transparent hover:border-slate-400 cursor-pointer pt-2"
          >
            <span>Skip PIN Entry (Sandbox mode)</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      )}
    </div>
  );
}
