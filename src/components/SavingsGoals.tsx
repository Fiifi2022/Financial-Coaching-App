import React, { useState, FormEvent } from 'react';
import { SavingsGoal } from '../types';
import { Target, Plus, Calendar, Sparkles, TrendingUp, Compass, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onContribute: (id: string, amount: number) => void;
}

export default function SavingsGoals({ goals, onAddGoal, onContribute }: SavingsGoalsProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('Emergency Fund');
  const [target, setTarget] = useState('');
  const [date, setDate] = useState('');
  const [contrib, setContrib] = useState('');
  
  const [selectedContributionGoal, setSelectedContributionGoal] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');

  const preSets = [
    'Emergency Fund',
    'New Car',
    'House Deposit',
    'Education',
    'Travel',
    'Wedding',
    'Business Capital',
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const targetAmt = parseFloat(target);
    const monthlyAlloc = parseFloat(contrib);
    if (isNaN(targetAmt) || targetAmt <= 0) return;

    onAddGoal({
      name,
      targetAmount: targetAmt,
      currentAmount: 0,
      targetDate: date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      autoContribution: isNaN(monthlyAlloc) ? 0 : monthlyAlloc,
    });

    setTarget('');
    setContrib('');
    setShowForm(false);
  };

  const handleApplyContribution = (id: string) => {
    const val = parseFloat(contributionAmount);
    if (!isNaN(val) && val > 0) {
      onContribute(id, val);
      setContributionAmount('');
      setSelectedContributionGoal(null);
    }
  };

  return (
    <div className="space-y-6" id="fincoach-savings-aspirations">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-sans mt-0 my-0">Wealth Architecture & Goals</h3>
          <p className="text-xs text-slate-500 mt-1">Configure target funds, due timelines & auto contributions</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="mt-2 md:mt-0 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4 text-emerald-450" />
          <span>New Goal Capsule</span>
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
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Goal Classification</label>
              <select
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
              >
                {preSets.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Target Amount (GHS)</label>
              <input
                type="number"
                required
                placeholder="GHS 10,000"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs text-slate-800 font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Auto Monthly Contrib (GHS)</label>
              <input
                type="number"
                placeholder="GHS 350"
                value={contrib}
                onChange={(e) => setContrib(e.target.value)}
                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs text-slate-800 font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Target Date</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none rounded-xl"
                />
                <button
                  type="submit"
                  className="px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow"
                >
                  Create
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* Grid of Active Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const ratio = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          const monthsLeft = goal.autoContribution > 0 
            ? Math.ceil((goal.targetAmount - goal.currentAmount) / goal.autoContribution)
            : 0;
          const isDirectlyContributing = selectedContributionGoal === goal.id;

          return (
            <div
              key={goal.id}
              className="bg-white border border-slate-200 text-slate-900 p-6 rounded-3xl flex flex-col justify-between shadow-sm hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block font-sans">{goal.name}</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-450" />
                        <span>Timeline: {goal.targetDate}</span>
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-700 bg-emerald-55 px-2.5 py-1 rounded-full border border-emerald-110">
                    {ratio.toFixed(0)}% Filed
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Accumulated Balance</span>
                    <span className="text-sm font-extrabold text-slate-900">{goal.currentAmount.toLocaleString()} GHS</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Total Target Cap</span>
                    <span className="text-sm font-extrabold text-slate-500">{goal.targetAmount.toLocaleString()} GHS</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-4.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    style={{ width: `${Math.min(100, ratio)}%` }}
                  />
                </div>
              </div>

              {/* Smart coaching nudge specific to this goal */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-4.5 text-xs leading-relaxed relative overflow-hidden">
                <div className="absolute top-3.5 right-3.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-emerald-750 font-sans font-bold block mb-1">Coach Nudge Capsule</span>
                <p className="text-slate-600 m-0">
                  {goal.autoContribution > 0 
                    ? `At GHS ${goal.autoContribution} monthly auto transfers, you'll clear this goal in ~${monthsLeft} months. Shaving GHS 120 from Lifestyle limits can achieve this 1.5 months ahead.`
                    : 'Configure an auto-contribution plan to systemize your compound progress and unlock the Frugal Shield badge!'
                  }
                </p>
              </div>

              {isDirectlyContributing ? (
                <div className="flex gap-2 animate-fade-in text-xs">
                  <input
                    type="number"
                    placeholder="GHS Amount"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-250 px-3 py-2 text-xs text-slate-900 font-bold focus:bg-white rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleApplyContribution(goal.id)}
                    className="px-4 py-2 bg-slate-900 text-white font-sans font-bold text-xs rounded-xl hover:bg-slate-850 cursor-pointer shadow"
                  >
                    Confirm Drop
                  </button>
                  <button
                    onClick={() => setSelectedContributionGoal(null)}
                    className="text-xs text-slate-450 hover:text-slate-850 px-1 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedContributionGoal(goal.id)}
                  className="w-full py-3 rounded-2xl bg-slate-900 text-white hover:bg-slate-850 text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Compass className="w-4 h-4 text-emerald-450" />
                  <span>Deposit Reserve Principal</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
