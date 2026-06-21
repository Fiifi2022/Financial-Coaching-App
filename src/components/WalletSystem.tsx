import React, { useState, FormEvent } from 'react';
import { Wallet, WalletType, Transaction } from '../types';
import { CreditCard, Landmark, Coins, TrendingUp, TrendingDown, RefreshCw, Plus, Calendar, ArrowRightLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface WalletSystemProps {
  wallets: Wallet[];
  recentTransactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
}

export default function WalletSystem({ wallets, recentTransactions, onAddTransaction }: WalletSystemProps) {
  const [activeWalletId, setActiveWalletId] = useState<WalletType>('bank');
  
  // States of Transfer Modal / Form inline
  const [showTransfer, setShowTransfer] = useState(false);
  const [sourceWallet, setSourceWallet] = useState<WalletType>('cash');
  const [destWallet, setDestWallet] = useState<WalletType>('momo');
  const [amountStr, setAmountStr] = useState('');
  const [noteStr, setNoteStr] = useState('');
  
  const handleTransferSubmit = (e: FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(amountStr);
    if (isNaN(amountVal) || amountVal <= 0) return;
    
    // Transfer isolated outflow/inflow
    onAddTransaction({
      type: 'transfer',
      category: 'Transfer',
      amount: amountVal,
      note: noteStr || `Transferred GHS ${amountVal} from ${sourceWallet} to ${destWallet}`,
      date: new Date().toISOString().split('T')[0],
      walletSource: sourceWallet,
      walletDest: destWallet,
    });
    
    // reset form
    setAmountStr('');
    setNoteStr('');
    setShowTransfer(false);
  };

  const getIcon = (id: WalletType) => {
    switch (id) {
      case 'momo':
        return CreditCard;
      case 'bank':
        return Landmark;
      case 'cash':
        return Coins;
    }
  };

  const selectedWallet = wallets.find(w => w.id === activeWalletId) || wallets[0];
  const walletTransactions = recentTransactions.filter(
    tx => tx.walletSource === activeWalletId || tx.walletDest === activeWalletId
  );

  return (
    <div className="space-y-6" id="wallet-management-ledger">
      {/* Mini grid of Wallets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {wallets.map((wallet) => {
          const Icon = getIcon(wallet.id);
          const isSelected = activeWalletId === wallet.id;
          
          return (
            <div
              key={wallet.id}
              onClick={() => setActiveWalletId(wallet.id)}
              className={`p-6 rounded-3xl cursor-pointer border transition-all duration-300 relative overflow-hidden ${
                isSelected
                  ? 'bg-[#0f172a] border-transparent text-white shadow-xl shadow-indigo-950/30 ring-2 ring-indigo-550'
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-850 shadow-sm'
              }`}
            >
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full opacity-[0.03] bg-indigo-5050 blur-2xl" />
              
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-white/10 text-white' :
                  wallet.id === 'bank' ? 'bg-indigo-50 text-indigo-600' :
                  wallet.id === 'momo' ? 'bg-amber-50 text-amber-600' :
                  'bg-emerald-50 text-emerald-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                {isSelected && (
                  <span className="text-[10px] font-sans bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                )}
              </div>
              
              <div>
                <span className={`text-xs font-sans font-bold uppercase tracking-wider block ${isSelected ? 'active-text-slate-300' : 'text-slate-500'}`}>{wallet.name}</span>
                <div className={`text-2xl font-black tracking-tight mt-1 font-sans ${isSelected ? 'active-text-white text-white' : 'text-slate-900'}`}>
                  GHS {wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className={`grid grid-cols-2 gap-2 mt-4 pt-4 border-t text-xs ${isSelected ? 'border-slate-800 bg-slate-900/40 p-2.5 rounded-xl' : 'border-slate-100'}`}>
                <div>
                  <span className={`${isSelected ? 'active-text-slate-300' : 'text-slate-400'} block text-[10px] uppercase font-bold tracking-wider`}>Inflows</span>
                  <span className={`${isSelected ? 'active-text-emerald-300 text-[13px]' : 'text-emerald-600'} font-black block mt-0.5`}>+{wallet.inflow.toLocaleString()} GHS</span>
                </div>
                <div>
                  <span className={`${isSelected ? 'active-text-slate-300' : 'text-slate-400'} block text-[10px] uppercase font-bold tracking-wider`}>Outflows</span>
                  <span className={`${isSelected ? 'active-text-amber-300 text-[13px]' : 'text-amber-600'} font-black block mt-0.5`}>-{wallet.outflow.toLocaleString()} GHS</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Selected Wallet Analytics & Actions */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 font-sans mt-0 my-0">Wallet Ledger Analytics</h3>
              <span className="text-xs font-semibold text-slate-500 capitalize">{selectedWallet.name}</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100/60 p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-650">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-sans">Monthly Inflow Factor</span>
                    <span className="text-sm font-bold text-emerald-600">GHS {selectedWallet.inflow.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-amber-50/50 border border-amber-100/60 p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-650">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-sans">Monthly Outflow velocity</span>
                    <span className="text-sm font-bold text-amber-600">GHS {selectedWallet.outflow.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowTransfer(!showTransfer)}
              className="w-full mt-5 py-3 rounded-2xl bg-slate-900 rotate-0 hover:bg-slate-850 text-xs font-semibold text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
              <span>Initiate Internal Transfer</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 bg-indigo-50/20 p-4.5 rounded-2xl border border-indigo-150/50 mt-5 leading-relaxed">
            <span className="font-bold text-slate-900 block mb-1">💡 What does "Internal Transfer" mean?</span>
            Moving your money between your own wallets (like bank to MTN MoMo or GHS cash to bank) is completely safe! Because the money is staying in your possession, it is not counted as spending or expenses. It simply shifts balances to where you need them most.
          </div>
        </div>

        {/* Right Column: Wallet Transactions Ledger */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-sans mt-0 my-0">Transaction Audit History</h3>
                <p className="text-xs text-slate-500 mt-1">Physical ledger isolated by ledger pool: <span className="text-indigo-600 font-bold uppercase">{selectedWallet.name}</span></p>
              </div>
            </div>

            {walletTransactions.length === 0 ? (
              <div className="py-16 text-center select-none">
                <RefreshCw className="w-8 h-8 mx-auto text-slate-400 animate-spin mb-3" />
                <p className="text-sm font-semibold text-slate-600">Clean slate ledger</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-normal">
                  No active transactions registered for this account layout in the current billing cycle. Add expenses directly or test an AI categorization.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {walletTransactions.map((tx) => {
                  const isExpense = tx.type === 'expense';
                  const isIncome = tx.type === 'income';
                  const isTransfer = tx.type === 'transfer';
                  
                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 bg-slate-55/60 border border-slate-100 hover:border-slate-200 rounded-2xl flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold leading-none ${
                          isIncome ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' :
                          isExpense ? 'bg-rose-50 text-rose-600 border border-rose-100/50' :
                          'bg-indigo-50 text-indigo-600 border border-indigo-100/50'
                        }`}>
                          {tx.category.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{tx.note}</span>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                            <span className="font-semibold">{tx.category}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-450" />
                              <span>{tx.date}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-bold ${
                          isIncome ? 'text-emerald-600' :
                          isExpense ? 'text-rose-600' :
                          'text-indigo-600'
                        }`}>
                          {isIncome ? '+' : isExpense ? '-' : '⇄'} GHS {tx.amount.toFixed(2)}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-medium">
                          {isTransfer ? `${tx.walletSource} ➔ ${tx.walletDest}` : (tx.walletSource || tx.walletDest)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide-out Transfer Dialog Box Overlay */}
      {showTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 relative shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h4 className="text-sm font-sans font-bold text-slate-900 mt-0 uppercase tracking-tight flex items-center gap-1.5 justify-start">
                <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin" />
                <span>Issue Wallet Transfer</span>
              </h4>
              <button
                onClick={() => setShowTransfer(false)}
                className="text-xs text-slate-450 hover:text-slate-800 cursor-pointer font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Source ledger wallet</label>
                <select
                  value={sourceWallet}
                  onChange={(e) => setSourceWallet(e.target.value as WalletType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-850 focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="cash">Cash Wallet</option>
                  <option value="momo">MTN Mobile Money Wallet</option>
                  <option value="bank">GCB Bank Account Wallet</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Destination destination wallet</label>
                <select
                  value={destWallet}
                  onChange={(e) => setDestWallet(e.target.value as WalletType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-850 focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="cash">Cash Wallet</option>
                  <option value="momo">MTN Mobile Money Wallet</option>
                  <option value="bank">GCB Bank Account Wallet</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Transfer Amount (GHS)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="GHS 0.00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-indigo-650 focus:outline-none focus:border-indigo-500 focus:bg-white font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Audit description note (optional)</label>
                <input
                  type="text"
                  placeholder="E.g. ATM withdrawal"
                  value={noteStr}
                  onChange={(e) => setNoteStr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-850 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={sourceWallet === destWallet}
                className="w-full py-3 bg-slate-900 text-white font-sans font-bold text-xs rounded-xl shadow-md hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {sourceWallet === destWallet ? "Sources cannot match" : "Submit Isolated Transfer"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
