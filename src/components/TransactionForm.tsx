import React, { useState, FormEvent } from 'react';
import { Transaction, WalletType, TransactionType, Category } from '../types';
import { Sparkles, Loader2, Plus, Calendar, ArrowRight, Check, X, FolderPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TransactionFormProps {
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  isLoadingAI?: boolean;
  onClose?: () => void;
  categories: Category[];
  onAddCategory?: (name: string, emoji: string, type: 'expense' | 'income') => void;
}

export default function TransactionForm({ onAddTransaction, onClose, categories, onAddCategory }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Food & Dining');
  const [note, setNote] = useState<string>('');
  const [wallet, setWallet] = useState<WalletType>('cash');
  const [dateMode, setDateMode] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Add Custom Category Panel Inline State
  const [showAddCatPanel, setShowAddCatPanel] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatEmoji, setNewCatEmoji] = useState<string>('📝');

  // AI Assistant raw input text
  const [aiNote, setAiNote] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [successAI, setSuccessAI] = useState<boolean>(false);

  const handleAISubmit = async () => {
    if (!aiNote.trim()) return;
    setLoadingAI(true);
    setSuccessAI(false);

    try {
      const response = await fetch('/api/gemini/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: aiNote }),
      });
      const resData = await response.json();
      if (resData.success && resData.data) {
        setSuccessAI(true);
        const { category: aCat, amount: aAmt, note: aNote } = resData.data;
        
        // Auto filled entry attributes
        if (aCat) {
          const isInc = aCat.toLowerCase().includes('salary') || aCat.toLowerCase().includes('income') || aCat.toLowerCase().includes('side') || aCat.toLowerCase().includes('business') || aCat.toLowerCase().includes('sell');
          setType(isInc ? 'income' : 'expense');
          setCategory(aCat);
        }
        if (aAmt && aAmt > 0) {
          setAmount(aAmt.toString());
        }
        if (aNote) {
          setNote(aNote);
        }
        
        setTimeout(() => setSuccessAI(false), 2500);
      }
    } catch (err) {
      console.warn('AI Parsing failed due to network limits: ', err);
    } finally {
      setLoadingAI(false);
    }
  };

  // Preset increment buttons helper
  const handleQuickPreset = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
  };

  const handleClearAmount = () => {
    setAmount('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(amount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    // Evaluate date using mode
    let targetDate = customDate;
    if (dateMode === 'today') {
      targetDate = new Date().toISOString().split('T')[0];
    } else if (dateMode === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      targetDate = yesterday.toISOString().split('T')[0];
    }

    onAddTransaction({
      type,
      category,
      amount: amountVal,
      note: note || `${type === 'income' ? 'Income' : 'Expense'} payment`,
      date: targetDate,
      walletSource: type === 'expense' ? wallet : undefined,
      walletDest: type === 'income' ? wallet : undefined,
    });

    // Reset standard form parameters
    setAmount('');
    setNote('');
    setAiNote('');

    if (onClose) {
      onClose();
    }
  };

  // Computed Date string display helper
  const getDateDisplayString = () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const todayStr = today.toLocaleDateString('en-US', options);
    const yesterdayStr = yesterday.toLocaleDateString('en-US', options);

    if (dateMode === 'today') return `Today (${todayStr})`;
    if (dateMode === 'yesterday') return `Yesterday (${yesterdayStr})`;
    return customDate;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm relative overflow-hidden transition-all duration-300" id="financial-ledger-allocator">
      {/* Background visual decorations */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Styled Ledger Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-5 flex justify-between items-start">
        <div>
          <span className="text-[9px] uppercase font-black text-indigo-500 dark:text-indigo-400 tracking-widest block mb-1">
            Quick Ledger Register
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 font-sans my-0 tracking-tight">
            Add New Ledger Entry
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Deduct budgets or log instant incoming cash balances on the fly.
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 hover:text-slate-650 dark:hover:text-slate-250 transition-all cursor-pointer"
            id="close-financial-ledger-allocator"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 🔮 Gemini AI Auto-categorize interface */}
      <div className="bg-slate-50 dark:bg-slate-950/70 rounded-2xl p-4 border border-emerald-500/15 dark:border-emerald-400/10 mb-5 relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
            <span>Speak Naturally to Auto-fill</span>
          </div>
          {successAI && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold animate-bounce">
              ✓ Form auto-filled!
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Bought lunch near Circle for GHS 45 on cash"
            value={aiNote}
            onChange={(e) => setAiNote(e.target.value)}
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 placeholder-slate-400 shadow-sm font-medium"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAISubmit();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAISubmit}
            disabled={loadingAI || !aiNote.trim()}
            className="px-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-850 dark:hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer text-xs font-bold disabled:opacity-40"
          >
            {loadingAI ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : 'Scan'}
          </button>
        </div>
        
        <p className="mt-2 text-[10px] text-slate-500 leading-normal font-medium my-0">
          <strong>Tip:</strong> Or try <em>"Pocket money of GHS 200 into MTN Momo"</em>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* LARGE SWITCH TABS: INFLOW vs OUTFLOW */}
        <div>
          <label className="text-[10px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
            What kind of transaction?
          </label>
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                // Select default category for expense
                setCategory('Food & Dining');
              }}
              className={`py-3 px-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50'
              }`}
            >
              💸 Outflow / Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                // Select default category for income
                setCategory('Salary & Income');
              }}
              className={`py-3 px-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50'
              }`}
            >
              💰 Inflow / Income
            </button>
          </div>
        </div>

        {/* INTERACTIVE AMOUNT FIELD WITH PRESET INCREMENTS */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800 rounded-2xl space-y-3">
          <label className="text-[10px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400 block">
            How much? (Amount in GHS)
          </label>
          <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-850 rounded-2xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all shadow-sm">
            <span className="text-slate-400 dark:text-slate-500 font-extrabold font-mono text-sm mr-2 select-none">
              GHS
            </span>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent text-base text-indigo-700 dark:text-indigo-400 font-black focus:outline-none placeholder-slate-350"
            />
            {amount && (
              <button
                type="button"
                onClick={handleClearAmount}
                className="text-[10px] font-black text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg px-2 py-1 shrink-0 font-sans transition-all"
              >
                Clear
              </button>
            )}
          </div>

          {/* Preset Pill Speed Increments */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickPreset(10)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] font-extrabold text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer"
            >
              +10
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(50)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] font-extrabold text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer"
            >
              +50
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(100)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] font-extrabold text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer"
            >
              +100
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(200)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] font-extrabold text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer"
            >
              +200
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(500)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] font-extrabold text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer"
            >
              +500
            </button>
          </div>
        </div>

        {/* INTERACTIVE COMPREHENSIVE WALLET SELECTOR CARDS */}
        <div>
          <label className="text-[10px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
            {type === 'expense' ? '💸 Source Ledger account' : '💰 Destination Ledger account'}
          </label>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => setWallet('cash')}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between ${
                wallet === 'cash'
                  ? 'bg-indigo-50/80 dark:bg-indigo-950/20 border-indigo-500 ring-1 ring-indigo-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                  💵
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">Physical Cash Purse</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Liquid banknotes & physical pocket cash</span>
                </div>
              </div>
              {wallet === 'cash' && <div className="w-4 h-4 bg-indigo-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold"><Check className="w-2.5 h-2.5 strike-3" /></div>}
            </button>

            <button
              type="button"
              onClick={() => setWallet('momo')}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between ${
                wallet === 'momo'
                  ? 'bg-indigo-50/80 dark:bg-indigo-950/20 border-indigo-500 ring-1 ring-indigo-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                  📱
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">MTN MoMo (Mobile Money)</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Sim Card transaction vault & payments</span>
                </div>
              </div>
              {wallet === 'momo' && <div className="w-4 h-4 bg-indigo-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold"><Check className="w-2.5 h-2.5 strike-3" /></div>}
            </button>

            <button
              type="button"
              onClick={() => setWallet('bank')}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between ${
                wallet === 'bank'
                  ? 'bg-indigo-50/80 dark:bg-indigo-950/20 border-indigo-500 ring-1 ring-indigo-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                  🏦
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">GCB / Eco Bank Account</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Formal banking deposits & wire payouts</span>
                </div>
              </div>
              {wallet === 'bank' && <div className="w-4 h-4 bg-indigo-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold"><Check className="w-2.5 h-2.5 strike-3" /></div>}
            </button>
          </div>
        </div>

        {/* PILL-CHIPS CATEGORIES SELECTION GRID */}
        <div>
          <label className="text-[10px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
            {type === 'expense' ? '📊 Budget Category to Deduct' : '💫 Income Classification'}
          </label>
          <div className="flex flex-wrap gap-1.5 py-1">
            {categories.filter(c => c.type === (type === 'transfer' ? 'expense' : type)).map((cat) => {
              const isSelected = category === cat.name;
              return (
                <button
                  key={cat.id || cat.name}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm scale-102 font-sans'
                      : `border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900`
                  }`}
                >
                  <span className="select-none">{cat.emoji || '📝'}</span>
                  <span>{cat.name}</span>
                  {isSelected && <span className="text-[9px]">✓</span>}
                </button>
              );
            })}

            {/* Quick launcher to open inline add-category panel */}
            {onAddCategory && (
              <button
                type="button"
                onClick={() => setShowAddCatPanel(!showAddCatPanel)}
                className="px-3 py-2 rounded-xl text-xs font-black border border-dashed border-indigo-300 dark:border-indigo-800/40 hover:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>➕ Create Category</span>
              </button>
            )}
          </div>

          <AnimatePresence>
            {showAddCatPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-4 bg-slate-50 dark:bg-slate-950/50 border border-indigo-500/10 rounded-2xl space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-500 flex items-center gap-1">
                    <FolderPlus className="w-3.5 h-3.5" />
                    Create New {type === 'expense' ? 'Budget' : 'Income'} Category
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddCatPanel(false)}
                    className="text-slate-450 hover:text-slate-650 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Category Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Education, School fees"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Emoji Accent</label>
                    <div className="flex items-center gap-2">
                      <span className="w-9 h-9 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-lg shadow-sm">
                        {newCatEmoji}
                      </span>
                      <input
                        type="text"
                        maxLength={2}
                        value={newCatEmoji}
                        onChange={(e) => setNewCatEmoji(e.target.value)}
                        className="w-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 text-center text-xs text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:border-indigo-500 shadow-sm"
                      />
                      {/* Quick selectors */}
                      <div className="flex gap-1 overflow-x-auto py-1 shrink">
                        {['📚', '👕', '💒', '🎁', '🛒', '⚡', '🍿', '⛪'].map(em => (
                          <button
                            type="button"
                            key={em}
                            onClick={() => setNewCatEmoji(em)}
                            className="w-7 h-7 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg text-xs flex items-center justify-center border border-slate-200 dark:border-slate-800 transition-all shrink-0 cursor-pointer"
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!newCatName.trim()) return;
                    if (onAddCategory) {
                      onAddCategory(newCatName.trim(), newCatEmoji, type === 'transfer' ? 'expense' : type);
                      // Select immediately
                      setCategory(newCatName.trim());
                      setNewCatName('');
                      setNewCatEmoji('📝');
                      setShowAddCatPanel(false);
                    }
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Save Dynamic Category
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* DATE CONVENIENT SHORTCUT CARDS */}
        <div>
          <label className="text-[10px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
            When did this happen?
          </label>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-250 dark:border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => setDateMode('today')}
                className={`py-2 px-1.5 text-[11px] font-extrabold rounded-xl text-center transition-all cursor-pointer ${
                  dateMode === 'today'
                    ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm border border-slate-200 dark:border-slate-800'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDateMode('yesterday')}
                className={`py-2 px-1.5 text-[11px] font-extrabold rounded-xl text-center transition-all cursor-pointer ${
                  dateMode === 'yesterday'
                    ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm border border-slate-200 dark:border-slate-800'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                Yesterday
              </button>
              <button
                type="button"
                onClick={() => setDateMode('custom')}
                className={`py-2 px-1.5 text-[11px] font-extrabold rounded-xl text-center transition-all cursor-pointer ${
                  dateMode === 'custom'
                    ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm border border-slate-200 dark:border-slate-800'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                Custom
              </button>
            </div>

            {/* If Custom Date Selected, show input calendar */}
            {dateMode === 'custom' && (
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  required
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-3 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* DESCRIPTION DETAILS INPUT */}
        <div>
          <label className="text-[10px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            What is this for? (Simple Explanation)
          </label>
          <input
            type="text"
            required
            placeholder={type === 'expense' ? 'E.g. Fried Rice at Circle, taxi commute' : 'E.g. Freelance coding, relative allowance'}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 px-4 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 placeholder-slate-400 font-medium shadow-sm transition-all"
          />
        </div>

        {/* 🔮 DYNAMIC WALLET SLIP SIMULATION PANEL (STYLISH LIVE PREVIEW) */}
        <AnimatePresence mode="wait">
          <div className={`p-4 rounded-3xl border text-xs leading-relaxed transition-all duration-300 shadow-inner relative ${
            amount && parseFloat(amount) > 0 
              ? type === 'expense'
                ? 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-150 dark:border-rose-900/30 text-rose-900 dark:text-rose-300' 
                : 'bg-emerald-50/40 dark:bg-emerald-950/15 border-emerald-150 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-300'
              : 'bg-slate-50/70 dark:bg-slate-950/20 border-slate-150 dark:border-slate-800/40 text-slate-500 dark:text-slate-400'
          }`}>
            <div className="absolute top-3 right-3 text-[8px] font-mono opacity-40 uppercase tracking-widest leading-none select-none">
              SLIP PREVIEW
            </div>

            <div className="font-bold text-[10px] uppercase tracking-wider mb-2 opacity-80 flex items-center gap-1">
              <span>🔮 Dynamic Smart Ledger Impact</span>
            </div>

            {amount && parseFloat(amount) > 0 ? (
              type === 'expense' ? (
                <div className="space-y-1.5 font-medium">
                  <p className="my-0 leading-normal">
                    ⚡ <strong>Budget Deduction:</strong> GHS <strong>{parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> will be subtracted from your <span className="underline decoration-dotted font-bold">{category}</span> allowance.
                  </p>
                  <p className="my-0 leading-normal">
                    💳 <strong>Wallet Withdrawal:</strong> GHS <strong>{parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> will be deducted from <span className="underline font-bold decoration-solid text-slate-900 dark:text-white">{wallet === 'cash' ? '💵 Cash Wallet' : wallet === 'momo' ? '📱 MTN MoMo' : '🏦 GCB Bank'}</span>.
                  </p>
                  <div className="border-t border-rose-300/20 dark:border-rose-800/30 pt-1.5 mt-1.5 flex justify-between items-center text-[10px] font-mono uppercase tracking-tight">
                    <span>Target Date:</span>
                    <span className="font-bold">{getDateDisplayString()}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 font-medium">
                  <p className="my-0 leading-normal">
                    📈 <strong>Income Registered:</strong> GHS <strong>{parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> will be logged under your <span className="underline decoration-dotted font-bold text-emerald-650 dark:text-emerald-350">{category}</span> inflows.
                  </p>
                  <p className="my-0 leading-normal">
                    🏦 <strong>Wallet Deposit:</strong> GHS <strong>{parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> will be added straight into your <span className="underline font-bold decoration-solid text-slate-900 dark:text-white">{wallet === 'cash' ? '💵 Cash Wallet' : wallet === 'momo' ? '📱 MTN MoMo' : '🏦 GCB Bank'}</span>.
                  </p>
                  <div className="border-t border-emerald-300/20 dark:border-emerald-800/30 pt-1.5 mt-1.5 flex justify-between items-center text-[10px] font-mono uppercase tracking-tight">
                    <span>Target Date:</span>
                    <span className="font-bold">{getDateDisplayString()}</span>
                  </div>
                </div>
              )
            ) : (
              <p className="my-0 text-[11px] italic font-medium leading-normal">
                Please enter a transaction amount above. The dynamic ledger impact slip calculations will render instantly.
              </p>
            )}
          </div>
        </AnimatePresence>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          className="w-full py-4 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-850 dark:hover:bg-indigo-700 text-white font-sans font-extrabold text-xs rounded-2xl shadow-md cursor-pointer transition-all hover:shadow-indigo-500/10 active:scale-98 text-center flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          <Plus className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Post To Ledger Ledger</span>
        </button>
      </form>
    </div>
  );
}
