import React, { useState, FormEvent } from 'react';
import { Debt } from '../types';
import { Calendar, ShieldAlert, BadgeInfo, CheckCircle, TrendingDown, Plus, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface DebtTrackerProps {
  debts: Debt[];
  onAddDebt: (debt: Omit<Debt, 'id'>) => void;
  onPayDebt: (id: string, amount: number) => void;
}

export default function DebtTracker({ debts, onAddDebt, onPayDebt }: DebtTrackerProps) {
  const [showForm, setShowForm] = useState(false);
  const [creditor, setCreditor] = useState('');
  const [name, setName] = useState('Personal Loan');
  const [principal, setPrincipal] = useState('');
  const [balance, setBalance] = useState('');
  const [rate, setRate] = useState('');
  const [date, setDate] = useState('');
  const [plan, setPlan] = useState('Standard Repayment');

  const [payingDebtId, setPayingDebtId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');

  const preSets = ['Credit Facility', 'Personal Loan', 'Momo Loan (Qwikloan)', 'Bank Credit Card', 'Car Loan', 'Mortgage'];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const pVal = parseFloat(principal);
    const bVal = parseFloat(balance);
    const rVal = parseFloat(rate);

    if (isNaN(pVal) || isNaN(bVal) || pVal <= 0) return;

    onAddDebt({
      name,
      creditor: creditor || 'Private Creditor',
      principal: pVal,
      balanceRemaining: bVal > pVal ? pVal : bVal,
      interestRate: isNaN(rVal) ? 0 : rVal,
      dueDate: date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      repaymentPlan: plan,
    });

    setCreditor('');
    setPrincipal('');
    setBalance('');
    setRate('');
    setShowForm(false);
  };

  const handlePayApply = (id: string) => {
    const amt = parseFloat(payAmount);
    if (!isNaN(amt) && amt > 0) {
      onPayDebt(id, amt);
      setPayAmount('');
      setPayingDebtId(null);
    }
  };

  // Determine optimal strategy (Aggregate Avalanche vs Snowball)
  // Avalanche: Pay highest interest rate first.
  // Snowball: Pay lowest balance first.
  const getPayoffStrategyDetails = () => {
    if (debts.length === 0) return null;
    
    const sortedByInterest = [...debts].sort((a,b) => b.interestRate - a.interestRate);
    const sortedByBalance = [...debts].sort((a,b) => a.balanceRemaining - b.balanceRemaining);

    return {
      avalancheTarget: sortedByInterest[0],
      snowballTarget: sortedByBalance[0]
    };
  };

  const strategyTargets = getPayoffStrategyDetails();

  return (
    <div className="space-y-6" id="fincoach-liabilities-ledger">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-sans mt-0 my-0">Debt Portfolios & Payoff Tracks</h3>
          <p className="text-xs text-slate-500 mt-1">Track remaining liabilities, due dates, interest margins & payoff roads</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="mt-2 md:mt-0 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm animate-pulse-subtle"
        >
          <Plus className="w-4 h-4 text-emerald-450" />
          <span>New Debt Ledger</span>
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-slate-50 p-5 rounded-3xl border border-slate-200"
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Debtor Creditor Entity</label>
              <input
                type="text"
                required
                placeholder="E.g. Fidelity, MTN Qwikloan"
                value={creditor}
                onChange={(e) => setCreditor(e.target.value)}
                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Facility Classification</label>
              <select
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs text-slate-805 focus:outline-none focus:bg-white"
              >
                {preSets.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Principal Amount (GHS)</label>
              <input
                type="number"
                required
                placeholder="GHS 2,500"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Remaining Balance (GHS)</label>
              <input
                type="number"
                required
                placeholder="GHS 1,800"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs text-slate-808 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Interest Rate (% Annual)</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="12%"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs text-slate-808 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Facility Due date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-200 p-2.5 text-xs text-slate-808 focus:outline-none rounded-xl"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Amortization / Payoff Plan Description</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="E.g. GHS 150 automatic rollover from MoMo monthly"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 p-3 rounded-xl text-xs text-slate-808 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold font-sans transition-all cursor-pointer shadow"
                >
                  Log Facility
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* Strategy Advisor and Portfolio layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left strategies column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h4 className="text-xs font-bold uppercase text-rose-700 bg-rose-50 border border-rose-100 flex items-center gap-1.5 mt-0 mb-4 px-3 py-1.5 rounded-full w-fit">
              <BadgeInfo className="w-4 h-4 text-rose-600" />
              <span>FinCoach Recommendation</span>
            </h4>
            
            {debts.length === 0 ? (
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                No active loans registered. Keep this slate clear! If you add loans, our analyzer schedules optimal Avalanche or Snowball strategies to minimize paid interest limits.
              </p>
            ) : (
              <div className="space-y-4 text-xs leading-relaxed">
                {strategyTargets && (
                  <>
                    <div className="bg-rose-50/55 p-4 rounded-2xl border border-rose-105">
                      <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider block mb-1">🚀 Core Avalanche focus</span>
                      <p className="text-slate-600 font-sans mt-1 mb-0">
                        Target {strategyTargets.avalancheTarget.creditor} ({strategyTargets.avalancheTarget.interestRate}% Interest) first. Clearing highest interest rates first yields the largest mathematical arbitrage.
                      </p>
                    </div>

                    <div className="bg-indigo-50/55 p-4 rounded-2xl border border-indigo-105">
                      <span className="text-[10px] font-extrabold text-indigo-850 uppercase tracking-wider block mb-1">🌸 Core Snowball focus</span>
                      <p className="text-slate-600 font-sans mt-1 mb-0">
                        Target {strategyTargets.snowballTarget.creditor} (GHS {strategyTargets.snowballTarget.balanceRemaining.toLocaleString()} remaining) first. Clearing smallest balances first yields immediate cognitive wins, boosting streak habits.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Debt Ledger list */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3 mb-4 font-sans mt-0">Active Debts Ledger Records</h3>

          {debts.length === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle className="w-9 h-9 text-emerald-600 mx-auto mb-2.5 animate-bounce" />
              <p className="text-sm font-extrabold text-slate-900">Absolute Financial Zero-Debt Status</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed font-sans">
                Fantastic! You are currently operating at 100% solvency without any active credit obligations. This raises your Net Worth quotient quotient extremely quickly!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {debts.map((item) => {
                const ratio = item.principal > 0 ? ((item.principal - item.balanceRemaining) / item.principal) * 100 : 0;
                const isPaying = payingDebtId === item.id;

                return (
                  <div key={item.id} className="p-4 bg-slate-50/45 border border-slate-105 rounded-2xl hover:border-slate-200 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900 font-sans">{item.creditor}</span>
                          <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 uppercase tracking-tight">{item.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-1.5">Due date: {item.dueDate} | Interest Rate: {item.interestRate}% APR</span>
                      </div>

                      <div className="text-right mt-2 md:mt-0">
                        <span className="text-[10px] font-bold text-slate-550 block">Balance remaining:</span>
                        <span className="text-sm font-extrabold text-slate-900">GHS {item.balanceRemaining.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-[11px] text-slate-550 font-sans mb-3">
                      <div>Original: GHS {item.principal.toLocaleString()}</div>
                      <div className="text-right">Repayment Plan: {item.repaymentPlan}</div>
                    </div>

                    {/* Progress slider bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500"
                        style={{ width: `${Math.min(100, Math.max(0, ratio))}%` }}
                      />
                    </div>

                    {isPaying ? (
                      <div className="flex gap-2 text-xs leading-none justify-end">
                        <input
                          type="number"
                          placeholder="Pay Amount (GHS)"
                          value={payAmount}
                          onChange={(e) => setPayAmount(e.target.value)}
                          className="w-32 bg-white border border-slate-250 px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white rounded-xl focus:border-indigo-400 focus:outline-none"
                        />
                        <button
                          onClick={() => handlePayApply(item.id)}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold font-sans text-xs rounded-xl cursor-pointer"
                        >
                          Send Payment
                        </button>
                        <button
                          onClick={() => setPayingDebtId(null)}
                          className="text-slate-450 hover:text-slate-800 text-xs px-1 cursor-pointer font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setPayingDebtId(item.id)}
                          className="py-1.5 px-3.5 rounded-xl border border-rose-500/15 text-[10px] font-sans font-bold uppercase tracking-wider text-rose-700 bg-rose-50/40 hover:bg-rose-50 hover:text-rose-900 cursor-pointer"
                        >
                          Log Payment Outgo
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
