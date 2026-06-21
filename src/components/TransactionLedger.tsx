import { useState } from 'react';
import { Transaction, WalletType } from '../types';
import { Search, Trash2, Filter, Calendar, ArrowUpDown, TrendingDown, TrendingUp, ArrowRightLeft, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';

interface TransactionLedgerProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

export default function TransactionLedger({ transactions, onDeleteTransaction }: TransactionLedgerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWalletFilter, setSelectedWalletFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'day' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Derive unique categories for filter
  const categoriesList = Array.from(new Set(transactions.map((tx) => tx.category))).filter(Boolean);

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    // Search filter
    const matchesSearch = 
      tx.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase());

    // Wallet filter
    const matchesWallet = 
      selectedWalletFilter === 'all' ||
      (tx.type === 'expense' && tx.walletSource === selectedWalletFilter) ||
      (tx.type === 'income' && tx.walletDest === selectedWalletFilter) ||
      (tx.type === 'transfer' && (tx.walletSource === selectedWalletFilter || tx.walletDest === selectedWalletFilter));

    // Type filter
    const matchesType = 
      selectedTypeFilter === 'all' || 
      tx.type === selectedTypeFilter;

    // Category filter
    const matchesCategory = 
      selectedCategoryFilter === 'all' || 
      tx.category === selectedCategoryFilter;

    // Date range filter
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const refDateStr = '2026-06-20'; // Current reference simulation date
      const refDate = new Date(refDateStr + 'T00:00:00');
      const txDate = new Date(tx.date + 'T00:00:00');
      
      const diffTime = refDate.getTime() - txDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (dateFilter === 'day') {
        matchesDate = tx.date === refDateStr || diffDays === 0;
      } else if (dateFilter === 'week') {
        matchesDate = diffDays >= 0 && diffDays < 7;
      } else if (dateFilter === 'month') {
        matchesDate = diffDays >= 0 && diffDays < 30;
      }
    }

    return matchesSearch && matchesWallet && matchesType && matchesCategory && matchesDate;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortBy === 'date-asc') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (sortBy === 'amount-desc') {
      return b.amount - a.amount;
    }
    if (sortBy === 'amount-asc') {
      return a.amount - b.amount;
    }
    return 0;
  });

  // Statistics calculation
  const totalBought = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalReceived = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Breakdown of purchases by source wallet
  const purchasesByWallet = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => {
      const src = tx.walletSource || 'cash';
      acc[src] = (acc[src] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Visual Header Block */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-3xl relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-400/20 inline-block mb-2">
              Financial Audit Ledger
            </span>
            <h2 className="text-2xl font-black font-sans my-0 tracking-tight">Your Comprehensive Purchase Ledger</h2>
            <p className="text-xs text-indigo-200 mt-1 max-w-xl font-sans leading-relaxed">
              Every pesewa counted. Here you can browse, filter, search, and manage a complete list of everything bought, pocket income received, and internal transfers made so far.
            </p>
          </div>
          
          <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl flex items-center gap-6 divide-x divide-slate-800">
            <div>
              <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">Everything Bought</span>
              <span className="text-lg font-extrabold text-rose-400 font-sans block mt-0.5">GHS {totalBought.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <span className="text-[9px] text-slate-400 block">{transactions.filter(t => t.type === 'expense').length} items purchased</span>
            </div>
            <div className="pl-6">
              <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">Total Inflows</span>
              <span className="text-lg font-extrabold text-emerald-400 font-sans block mt-0.5">GHS {totalReceived.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <span className="text-[9px] text-slate-400 block">{transactions.filter(t => t.type === 'income').length} income events</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Breakdown of Purchases by Wallet Pool */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-4.5 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Spent using Cash</span>
            <span className="text-base font-extrabold text-slate-850 mt-1 block">GHS {(purchasesByWallet.cash || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
            💵
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4.5 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Spent over MTN MoMo</span>
            <span className="text-base font-extrabold text-slate-855 mt-1 block">GHS {(purchasesByWallet.momo || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
            📱
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4.5 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Paid via Bank Account</span>
            <span className="text-base font-extrabold text-slate-855 mt-1 block">GHS {(purchasesByWallet.bank || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            🏦
          </div>
        </div>
      </div>

      {/* Ledger Controls Panel */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search container */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search purchases by keywords, notes, categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 focus:bg-white font-medium"
            />
          </div>

          {/* Quick Clear Button */}
          {(searchTerm !== '' || selectedWalletFilter !== 'all' || selectedTypeFilter !== 'all' || selectedCategoryFilter !== 'all' || dateFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedWalletFilter('all');
                setSelectedTypeFilter('all');
                setSelectedCategoryFilter('all');
                setDateFilter('all');
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline bg-indigo-50/50 px-3.5 py-2.5 rounded-xl transition-all self-start cursor-pointer lg:self-center"
            >
              Reset Filters
            </button>
          )}

          {/* Sorting */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-bold focus:outline-none focus:border-indigo-400 focus:bg-white"
            >
              <option value="date-desc">Newest Entries First</option>
              <option value="date-asc">Oldest Entries First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Date Interval Selector Tabs */}
        <div className="bg-slate-50 border border-slate-200 p-1.5 rounded-2xl flex flex-wrap items-center gap-1.5 shadow-inner">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-3 block shrink-0">
            Timeframe Filter
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dateFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              🗓️ All History
            </button>
            <button
              onClick={() => setDateFilter('day')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dateFilter === 'day'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title="Today's financial transactions"
            >
              ☀️ Days (Today)
            </button>
            <button
              onClick={() => setDateFilter('week')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dateFilter === 'week'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title="Past 7 days running timeframe"
            >
              📅 Weeks (Past 7 Days)
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dateFilter === 'month'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title="Past 30 days running timeframe"
            >
              🌙 Months (Past 30 Days)
            </button>
          </div>
        </div>

        {/* Breakdown Filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-4">
          <div>
            <label className="text-[9px] uppercase font-black tracking-wider text-slate-400 block mb-1">Ledger Wallet</label>
            <select
              value={selectedWalletFilter}
              onChange={(e) => setSelectedWalletFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-750 font-semibold focus:outline-none focus:border-indigo-400"
            >
              <option value="all">💳 All Ledger Wallets</option>
              <option value="cash">💵 Cash Only</option>
              <option value="momo">📱 MoMo Only</option>
              <option value="bank">🏦 Bank Only</option>
            </select>
          </div>

          <div>
            <label className="text-[9px] uppercase font-black tracking-wider text-slate-400 block mb-1">Taxonomy Type</label>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-755 font-semibold focus:outline-none focus:border-indigo-400"
            >
              <option value="all">✨ All Operations</option>
              <option value="expense">💸 Expenses Only (Everything bought)</option>
              <option value="income">💰 Incomes Only</option>
              <option value="transfer">⇄ Transfers Only</option>
            </select>
          </div>

          <div>
            <label className="text-[9px] uppercase font-black tracking-wider text-slate-400 block mb-1">Purchase Category</label>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-755 font-semibold focus:outline-none focus:border-indigo-400"
            >
              <option value="all">📊 All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table List View of Ledger */}
      <div className="bg-white border border-slate-200 rounded-[2.2rem] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-black text-slate-850 uppercase tracking-widest font-sans flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-slate-600" />
            <span>Auditable Ledger Items ({sortedTransactions.length})</span>
          </span>
          <div className="text-[10px] text-slate-500 font-mono">
            Filtered matches from {transactions.length} total indices
          </div>
        </div>

        {sortedTransactions.length === 0 ? (
          <div className="py-24 text-center select-none max-w-sm mx-auto p-4">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-xs font-black text-slate-800">No auditable records found</p>
            <p className="text-[11px] text-slate-450 mt-1 leading-normal">
              No transactions match your combined search keywords or filters. Create a new entry using the left side panel or reset filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
            {sortedTransactions.map((tx) => {
              const isExpense = tx.type === 'expense';
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';

              return (
                <div
                  key={tx.id}
                  className="p-4 hover:bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold leading-none shrink-0 ${
                      isIncome ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' :
                      isExpense ? 'bg-rose-50 text-rose-600 border border-rose-100/50' :
                      'bg-indigo-50 text-indigo-600 border border-indigo-100/50'
                    }`}>
                      {isIncome ? '💰' : isExpense ? '💸' : '⇄'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-900">{tx.note}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          isExpense ? 'bg-rose-50 text-rose-600 border border-rose-100/30' :
                          isIncome ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/30' :
                          'bg-indigo-50 text-indigo-600 border border-indigo-150/30'
                        }`}>
                          {tx.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2.5 mt-1.5 text-[10px] text-slate-500 font-sans">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{tx.date}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 uppercase tracking-tight">
                          <span>Paid with:</span>
                          <strong className="text-slate-700">
                            {isTransfer 
                              ? `${tx.walletSource?.toUpperCase()} ➔ ${tx.walletDest?.toUpperCase()}` 
                              : (tx.walletSource || tx.walletDest || 'cash').toUpperCase()
                            }
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className={`text-sm font-black font-mono block ${
                        isIncome ? 'text-emerald-600' :
                        isExpense ? 'text-rose-600' :
                        'text-indigo-600'
                      }`}>
                        {isIncome ? '+' : isExpense ? '-' : '⇄'} GHS {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete this recorded option?\n"${tx.note}"\nThis will safely retract this amount from budgets and refund balances!`)) {
                          onDeleteTransaction(tx.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                      title="Safely Delete Item & Reverse From Balance"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Guide Card specifically explaining category allocation safety */}
      <div className="bg-indigo-50/30 border border-indigo-100/60 p-5 rounded-3xl text-xs text-slate-700 leading-relaxed font-sans relative overflow-hidden">
        <h4 className="font-extrabold text-slate-850 flex items-center gap-1.5 mt-0 mb-1.5">
          <span>🛡️ State-Safe Balance Retraction Gurantee</span>
        </h4>
        <p className="my-0">
          Did you make an entry error or change your mind? Clicking the trash icon doesn't just clear the log list—it is fully smart! It <strong>automatically reverses</strong> the effect: adding physical cash/momo/bank balances back to your original purse, decrementing cash flows, and subtracting from the corresponding budget category's spent amount instantly.
        </p>
      </div>
    </div>
  );
}
