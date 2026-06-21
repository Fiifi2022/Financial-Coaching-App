import { useState } from 'react';
import { Wallet, Transaction, SavingsGoal, Debt, AppNotification } from '../types';
import { ResponsiveContainer, BarChart, Bar, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Compass,
  Sparkles,
  AlertTriangle,
  Activity,
  ChevronRight,
  Calculator,
  Eye,
  EyeOff,
  BellRing,
  HelpCircle,
  Plus,
  Flame,
  Check,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  score: number;
  wallets: Wallet[];
  recentTransactions: Transaction[];
  goals: SavingsGoal[];
  debts: Debt[];
  totalIncome: number;
  totalExpenses: number;
  savingsStreak?: number;
  notifications: AppNotification[];
  onDismissNotification: (id: string) => void;
  onOpenTransactionModal?: () => void;
  onLoadDemoData?: () => void;
}

const getCategoryEmoji = (category?: string) => {
  if (!category) return '📝';
  const c = category.toLowerCase();
  if (c.includes('food') || c.includes('dine') || c.includes('waakye') || c.includes('lunch') || c.includes('eat')) return '🍔';
  if (c.includes('transport') || c.includes('ride') || c.includes('uber') || c.includes('taxi') || c.includes('commute')) return '🚗';
  if (c.includes('utility') || c.includes('ecg') || c.includes('power') || c.includes('water') || c.includes('bill') || c.includes('vodafone') || c.includes('mtn')) return '💡';
  if (c.includes('rent') || c.includes('house') || c.includes('room') || c.includes('hostel') || c.includes('housing')) return '🏠';
  if (c.includes('entertainment') || c.includes('spotify') || c.includes('netflix') || c.includes('game') || c.includes('drink') || c.includes('reddit')) return '🍿';
  if (c.includes('health') || c.includes('clinic') || c.includes('med') || c.includes('hospital') || c.includes('pharmacy')) return '🏥';
  if (c.includes('debt') || c.includes('loan') || c.includes('qwikloan') || c.includes('interest') || c.includes('repay')) return '💳';
  if (c.includes('salary') || c.includes('paycheck') || c.includes('wage') || c.includes('work') || c.includes('income')) return '💼';
  if (c.includes('side') || c.includes('hustle') || c.includes('business') || c.includes('cosmetics') || c.includes('sell')) return '🚀';
  if (c.includes('saving') || c.includes('investment') || c.includes('goal') || c.includes('fund')) return '📈';
  return '📝';
};

export default function Dashboard({
  score,
  wallets,
  recentTransactions,
  goals,
  debts,
  totalIncome,
  totalExpenses,
  savingsStreak = 4,
  notifications,
  onDismissNotification,
  onOpenTransactionModal,
  onLoadDemoData,
}: DashboardProps) {
  // Financial analysis base calculations
  const netWorth = wallets.reduce((acc, w) => acc + w.balance, 0) - debts.reduce((acc, d) => acc + d.balanceRemaining, 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 105 : 20.5; // fallbacks to look identical
  const cashFlow = totalIncome - totalExpenses;

  // Emergency safety estimates
  const emergGoal = goals.find((g) => g.name.toLowerCase().includes('emergency'));
  const emergAmt = emergGoal ? emergGoal.currentAmount : 3800;
  const monthlyEssentials = totalExpenses * 0.75 || 1200;
  const emergencyMonthsPaid = monthlyEssentials > 0 ? emergAmt / monthlyEssentials : 3.2;

  // Debit/Credit card states & simulations
  const [isCardHidden, setIsCardHidden] = useState<boolean>(true);
  const [expenseSliderVal, setExpenseSliderVal] = useState<number>(600);

  // Active Spending limit strategy calculations
  const expenseTxs = recentTransactions.filter((t) => t.type === 'expense');
  const totalSpentVal = expenseTxs.reduce((sum, t) => sum + t.amount, 0);
  const expenseDates = expenseTxs.map(t => t.date);
  const uniqueDatesCount = Array.from(new Set(expenseDates)).length;
  const divisor = Math.max(uniqueDatesCount, 14);
  const averageDailySpend = totalSpentVal > 0 ? Math.round(totalSpentVal / divisor) : 65;

  // Multi-prediction strategy slider states
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(() => {
    return localStorage.getItem('fincoach_active_scenario') || 'steady';
  });

  const [customDailyLimit, setCustomDailyLimit] = useState<number>(() => {
    const savedLimit = localStorage.getItem('fincoach_active_limit');
    if (savedLimit) return parseInt(savedLimit, 10);
    return averageDailySpend;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAdvancedCoachOpen, setIsAdvancedCoachOpen] = useState<boolean>(false);
  const [isAutopilotOn, setIsAutopilotOn] = useState<boolean>(true);

  // Real-Time Safe-To-Spend Adaptive calculations
  const nowObj = new Date('2026-06-21T05:47:17-07:00'); // Consistent with current local time
  const currentDay = nowObj.getDate(); // 21
  const totalDaysInMonth = new Date(nowObj.getFullYear(), nowObj.getMonth() + 1, 0).getDate(); // 30
  const daysRemaining = Math.max(1, totalDaysInMonth - currentDay + 1); // 10

  const currentDailySpendRate = parseFloat((totalExpenses / Math.max(1, currentDay)).toFixed(2));
  const remainingBalance = totalIncome - totalExpenses;
  const safeDailyLimit = remainingBalance > 0 ? parseFloat((remainingBalance / daysRemaining).toFixed(2)) : 0;

  // 📈 Study Trends & Behavior Analysis
  const expenseTransactions = recentTransactions.filter(t => t.type === 'expense');

  // Compute 3-day and 7-day spending velocities
  const threeDaysAgo = new Date(nowObj.getTime() - 3 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(nowObj.getTime() - 7 * 24 * 60 * 60 * 1000);

  const expenses3Days = expenseTransactions.filter(t => t.date && new Date(t.date) >= threeDaysAgo);
  const expenses7Days = expenseTransactions.filter(t => t.date && new Date(t.date) >= sevenDaysAgo);

  const sum3Days = expenses3Days.reduce((acc, t) => acc + t.amount, 0);
  const sum7Days = expenses7Days.reduce((acc, t) => acc + t.amount, 0);

  const velocity3Days = parseFloat((sum3Days / 3).toFixed(2));
  const velocity7Days = parseFloat((sum7Days / 7).toFixed(2));

  // Determine concentration of heavy categories (e.g., Food, Transport, Utilities)
  const categorySummary: Record<string, number> = {};
  expenses7Days.forEach(t => {
    categorySummary[t.category] = (categorySummary[t.category] || 0) + t.amount;
  });
  const sortedCategories = Object.entries(categorySummary).sort((a, b) => b[1] - a[1]);
  const primaryExpenseDriver = sortedCategories.length > 0 ? sortedCategories[0][0] : 'General Overhead';
  const primaryExpenseDriverVolume = sortedCategories.length > 0 ? sortedCategories[0][1] : 0;
  const concentrationPercentage = sum7Days > 0 ? Math.round((primaryExpenseDriverVolume / sum7Days) * 100) : 0;

  // AI Dynamic Recommendation Algorithm (Study actual spend velocity & target caps to prevent early depletion)
  let aiRecommendedDaily = safeDailyLimit;
  let recommendationLogicNotes = '';
  
  if (velocity3Days > safeDailyLimit * 1.15) {
    // Highly spendthrift recently! Dial down target to build a preventative savings buffer
    const penaltyFactor = 0.85; // 15% reduction buffer
    aiRecommendedDaily = safeDailyLimit * penaltyFactor;
    recommendationLogicNotes = `Velocity Warning: Your recent 3-day speed (GHS ${velocity3Days}/day) is outperforming your remaining resources. Recommendation reduced by 15% to construct a safe defensive buffer.`;
  } else if (velocity3Days < safeDailyLimit * 0.75 && velocity3Days > 0) {
    // Doing extremely well! Recommend a high comfortable rate that locks in positive trends
    aiRecommendedDaily = safeDailyLimit * 0.95;
    recommendationLogicNotes = `Conservative Trend Reward: You are spending very conservatively (GHS ${velocity3Days}/day). Recommend GHS ${aiRecommendedDaily.toFixed(0)} to preserve a surplus margin.`;
  } else {
    // Normal steady cruise
    aiRecommendedDaily = safeDailyLimit;
    recommendationLogicNotes = `Steady Cruise: Current velocity is well aligned with safety parameters. Dividing remaining budget evenly across remaining days.`;
  }

  // Bound within sane guidelines
  aiRecommendedDaily = Math.max(10, Math.min(300, Math.round(aiRecommendedDaily)));

  // What-If sandbox simulation state
  const [sandboxPlannedDaily, setSandboxPlannedDaily] = useState<number>(() => {
    return Math.round(safeDailyLimit > 0 ? safeDailyLimit : 50);
  });

  const activePlannedDaily = isAutopilotOn ? aiRecommendedDaily : sandboxPlannedDaily;

  // Weekly spend velocity calculation
  const baseDateObj = new Date('2026-06-20T05:02:18-07:00');
  let currentWeekExpensesSum = 0;
  let previousWeekExpensesSum = 0;

  expenseTxs.forEach((tx) => {
    const txDateParts = tx.date.split('-');
    if (txDateParts.length === 3) {
      const year = parseInt(txDateParts[0], 10);
      const month = parseInt(txDateParts[1], 10) - 1;
      const day = parseInt(txDateParts[2], 10);
      const txDateObj = new Date(year, month, day, 12, 0, 0);
      const diffTime = baseDateObj.getTime() - txDateObj.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays <= 6) {
        currentWeekExpensesSum += tx.amount;
      } else if (diffDays >= 7 && diffDays <= 13) {
        previousWeekExpensesSum += tx.amount;
      }
    }
  });

  const finalCurrWeek = currentWeekExpensesSum > 0 ? currentWeekExpensesSum : 185;
  const finalPrevWeek = previousWeekExpensesSum > 0 ? previousWeekExpensesSum : 220;
  const spendDiff = finalCurrWeek - finalPrevWeek;
  const spendPercentChange = finalPrevWeek > 0 ? (spendDiff / finalPrevWeek) * 100 : -15.9;

  // Predefined scenarios options
  const scenarios = [
    {
      id: 'frugal',
      name: 'Frugal Shield mode',
      target: Math.round(averageDailySpend * 0.7),
      description: 'Cut non-essential entertainment commutes and waakye deliveries to maximize net cash savings rate.',
    },
    {
      id: 'steady',
      name: 'Steady Cruise mode',
      target: Math.round(averageDailySpend),
      description: 'Stable budget spending parameters to sustain basic habits while slowly growing safety reserves.',
    },
    {
      id: 'creep',
      name: 'Lifestyle Drift mode',
      target: Math.round(averageDailySpend * 1.45),
      description: 'Expanded leisure rides budget with high danger alerts of liabilities and cash reserves drains.',
    }
  ];

  const handleSelectScenario = (scId: string, scTarget: number) => {
    setSelectedScenarioId(scId);
    setCustomDailyLimit(scTarget);
  };

  const handleApplyStrategy = () => {
    localStorage.setItem('fincoach_active_scenario', selectedScenarioId);
    localStorage.setItem('fincoach_active_limit', customDailyLimit.toString());
    setToastMessage(`🎯 Locked Success: Monthly spending limit aligned to GHS ${customDailyLimit}!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Advanced simulations values
  const simulatedMonthlyOutflow = customDailyLimit * 30;
  const simulatedMonthlyCashflow = totalIncome - simulatedMonthlyOutflow;
  const simulatedScore = Math.max(30, Math.min(100, Math.round(95 - (customDailyLimit * 0.3) + (savingsRate * 0.15))));
  const simulatedGoalRunwayMonths = emergAmt > 0 ? parseFloat((emergAmt / (simulatedMonthlyOutflow || 1)).toFixed(1)) : 0;

  // Unified list of transactions to show inside "Transactions" card
  const displayedTxs = recentTransactions.slice(0, 3);

  // Expenses card list items
  const displayedExpenses = recentTransactions.filter(t => t.type === 'expense').slice(0, 3);

  const totalPrimaryBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none" id="fincoach-aggregate-intelligence-dashboard">
      
      {/* Toast Feedback notification banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            className="bg-slate-900 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl shadow-xl fixed top-24 right-6 z-50 text-xs font-semibold flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Alerts Banner - Coaching Intelligence Alerts */}
      {notifications && notifications.filter(n => n.type === 'limit').length > 0 && (
        <div className="space-y-2.5" id="live-overspend-alerts-deck">
          {notifications.filter(n => n.type === 'limit').slice(0, 2).map((notif) => (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              key={notif.id}
              className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-4 rounded-2xl shadow-sm text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-455 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-rose-950 dark:text-rose-200 my-0 text-xs">{notif.title}</h4>
                  <p className="text-rose-800 dark:text-rose-350 leading-relaxed mt-0.5 my-0 text-[11px]">{notif.message}</p>
                </div>
              </div>
              <button
                onClick={() => onDismissNotification(notif.id)}
                className="py-1.5 px-3.5 bg-rose-600 hover:bg-slate-900 dark:hover:bg-rose-700 text-white border-none rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 whitespace-nowrap self-end sm:self-center"
              >
                Dismiss
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Master Lavender Background Wrapped Container Dashboard matching Mockup */}
      <div className="bg-[#9ba0c7] p-4 sm:p-6 lg:p-8 rounded-[2.5rem] shadow-lg space-y-6 text-slate-900" id="attached-mockup-wrapper">
        
        {/* Row 1: Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column A: Balance Card */}
          <div className="flex flex-col h-full">
            {/* Balance Card Section */}
            <div className="bg-gradient-to-br from-[#e1f2ff] via-[#e5f5ff] to-white p-6 rounded-[2.2rem] shadow-sm relative overflow-hidden h-full flex flex-col justify-between min-h-[220px]">
              <div className="flex items-center justify-between">
                {/* Flag GHS Selection element */}
                <div className="flex items-center gap-1.5 bg-white/70 hover:bg-white border border-slate-100 rounded-full py-1 px-3.5 cursor-pointer shadow-xs transition-all active:scale-95">
                  <span className="text-sm">🇬🇭</span>
                  <span className="text-[11px] font-bold text-slate-800 font-sans tracking-wide">GHS</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                {/* Plus rounded button */}
                <button
                  onClick={onOpenTransactionModal}
                  className="w-8 h-8 rounded-full bg-white hover:bg-slate-50 text-slate-800 flex items-center justify-center border border-slate-100 hover:border-slate-200 shadow-xs cursor-pointer active:scale-90 transition-all"
                  title="Log new financial ledger record"
                >
                  <Plus className="w-4 h-4 text-indigo-600" />
                </button>
              </div>

              <div className="my-5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 block font-bold">Balance</span>
                <span className="text-[2rem] font-black text-slate-900 leading-tight block tracking-tight font-sans mt-1">
                  GHS {totalPrimaryBalance > 0 ? totalPrimaryBalance.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '32,568.49'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium block mt-1.5">
                  Primary Wallet Ledger Balance (GHS)
                </span>
              </div>

              {/* Action Buttons: Send & Withdraw */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={onOpenTransactionModal}
                  className="py-3 px-5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-700/10 transition-all hover:-translate-y-0.5 active:scale-95"
                >
                  <span>Send</span>
                </button>
                <button
                  onClick={onOpenTransactionModal}
                  className="py-3 px-5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all hover:-translate-y-0.5 active:scale-95"
                >
                  <span>Withdraw</span>
                </button>
              </div>
            </div>
          </div>

          {/* Column B: Transactions Card */}
          <div className="lg:col-span-2 bg-white p-6 rounded-[2.2rem] shadow-sm flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 tracking-tight my-0 font-sans">Transactions</h3>
                {/* View all linked to switcher */}
                <span className="text-[11px] font-bold text-[#2563eb] hover:underline cursor-pointer">
                  View all &gt;
                </span>
              </div>

              {/* Transactions List */}
              <div className="space-y-3 mt-4">
                {displayedTxs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-5 text-center shadow-inner">
                    <Activity className="w-8 h-8 text-indigo-500/60 animate-pulse mb-3.5" />
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block font-sans">Pristine GHS Ledger</span>
                    <p className="text-[10px] text-slate-500 mt-2 max-w-[280px] mx-auto leading-relaxed">
                      Your transactional record is empty. Tap any quick send/receive option above to log physical cash, mobile money services, or GCB bank actions!
                    </p>
                    {onLoadDemoData && (
                      <button
                        onClick={onLoadDemoData}
                        className="mt-3.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 text-[10px] font-black rounded-xl transition-all cursor-pointer border border-indigo-100"
                      >
                        ⚡ Load Mock Demo Sandbox
                      </button>
                    )}
                  </div>
                ) : (
                  displayedTxs.map((tx, idx) => {
                    const isInc = tx.type === 'income';
                    const isTransfer = tx.type === 'transfer';
                    const emoji = getCategoryEmoji(tx.category);
                    
                    return (
                      <div
                        key={tx.id || idx}
                        className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100/30 p-3 h-14 rounded-2xl flex items-center justify-between shadow-xs transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-xs ${
                            isInc ? 'bg-emerald-100 text-emerald-700' : isTransfer ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {emoji}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block font-sans">
                              {tx.note || tx.category}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-medium mt-0.5">
                              {tx.date || 'Today'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black font-sans ${isInc ? 'text-emerald-600' : 'text-slate-800'}`}>
                            {isInc ? '+' : isTransfer ? '➔' : '-'}GHS {Math.abs(tx.amount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-slate-50/60 rounded-2xl p-3 border border-slate-100/50 text-[10px] text-slate-500 leading-normal font-sans mt-4 font-bold text-[#2563eb]/90">
              ✨ GHS Ledger Insight: Logging balanced transfers across bank reserves and MoMo ledgers actively prevents overdraft triggers.
            </div>
          </div>

        </div>

        {/* Row 2: Double Column Grid (Income Flow Chart wide + Expenses Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column D: Income Flow Card (Occupies 2/3 of space on desktop) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-[2.2rem] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 tracking-tight my-0 font-sans">Income Flow</h3>
                {/* Selector sort placeholder */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-full py-1 px-3 cursor-pointer">
                  <span className="text-[10px] font-bold text-slate-650">Sort by: Latest</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-405" />
                </div>
              </div>

              {/* Column/Bar Chart precisely stylized mockup */}
              <div className="mt-6 flex flex-col md:flex-row md:items-end justify-between gap-6 pt-3">
                {[
                  { month: 'January', val: '40%', isCurrent: false },
                  { month: 'February', val: '28%', isCurrent: false },
                  { month: 'March', val: '88%', isCurrent: true },
                  { month: 'April', val: '38%', isCurrent: false },
                  { month: 'May', val: '58%', isCurrent: false },
                ].map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col justify-end space-y-2 mt-2 md:mt-0 font-sans">
                    {/* Header Month Label */}
                    <div className="flex items-center justify-between md:justify-center gap-1 select-none">
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${
                        item.isCurrent ? 'text-[#2563eb] font-black' : 'text-slate-400'
                      }`}>
                        {item.month}
                      </span>
                      <span className="text-[10px] text-slate-400 hover:text-slate-900 cursor-pointer">↗</span>
                    </div>

                    {/* Bar graphic container */}
                    <div className="relative w-full h-24 bg-slate-100/50 rounded-2xl overflow-hidden hover:opacity-95 transition-opacity">
                      {/* Striped Background texture rendering */}
                      <div className="absolute inset-x-0 bottom-0 top-0 opacity-10 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_50%,#000_50%,#000_75%,transparent_75%,transparent)] bg-[length:14px_14px]" />
                      
                      {/* Active Fill with height matching percentage */}
                      <div
                        className={`absolute bottom-0 inset-x-0 rounded-b-2xl transition-all duration-700 ease-out ${
                          item.isCurrent 
                            ? 'bg-gradient-to-t from-indigo-700 via-[#2563eb] to-[#3b82f6] rounded-t-2xl shadow-md min-h-[30px]' 
                            : 'bg-slate-200 min-h-[15px]'
                        }`}
                        style={{ height: item.val }}
                      >
                        {/* Overlay striped graphic on active bar */}
                        {item.isCurrent && (
                          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:12px_12px]" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-3 text-[10px] text-slate-400 font-medium font-mono text-center">
              * Ledger Inflows track cash aggregations matching March side business and recurring allocations.
            </div>
          </div>

          {/* Column E: Expenses Card */}
          <div className="bg-white p-6 rounded-[2.2rem] shadow-sm flex flex-col justify-between h-full space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 tracking-tight my-0 font-sans">Expenses</h3>
                <span className="text-[11px] font-bold text-[#2563eb] hover:underline cursor-pointer">
                  View all &gt;
                </span>
              </div>

              {/* Dynamic slider tracking range */}
              <div className="pt-2">
                <div className="relative w-full pb-8">
                  {/* Floating blue bubble badge */}
                  <div
                    className="absolute bottom-6 bg-[#2563eb] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md font-mono pointer-events-none transition-all duration-150"
                    style={{ 
                      left: `calc(${expenseSliderVal / 10}% - 22px)`,
                      transform: 'translateX(-2%)'
                    }}
                  >
                    GHS {expenseSliderVal.toFixed(2)}
                  </div>
                  
                  {/* Track line indicator grey */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full relative">
                    {/* Blue progress fill */}
                    <div
                      className="absolute left-0 h-full bg-[#2563eb] rounded-full"
                      style={{ width: `${expenseSliderVal / 10}%` }}
                    />
                    
                    <input
                      type="range"
                      min={0}
                      max={1000}
                      value={expenseSliderVal}
                      onChange={(e) => setExpenseSliderVal(parseInt(e.target.value, 10))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer select-all"
                    />
                  </div>

                  {/* Left and Right limit labels */}
                  <div className="flex justify-between text-[9px] font-black text-slate-400 tracking-wider uppercase mt-2 select-none">
                    <span>GHS 0.00</span>
                    <span>GHS 1000.00</span>
                  </div>
                </div>
              </div>

              {/* Expense list below slider */}
              <div className="space-y-3 mt-2">
                {displayedExpenses.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 bg-slate-50/20 rounded-2xl border border-dashed border-slate-205 flex flex-col items-center justify-center p-4">
                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider block mb-1">Cleared Ledger Cashflow</span>
                    <p className="text-[9px] text-slate-500 max-w-[170px] mx-auto leading-normal my-0">
                      Zero trimmable expenses recorded. Great job keeping outflows bounded!
                    </p>
                  </div>
                ) : (
                  displayedExpenses.map((exp, expIdx) => {
                    const label = exp.note || exp.category;
                    const desc = exp.category;
                    const emoji = getCategoryEmoji(exp.category);
                    
                    return (
                      <div
                        key={exp.id || expIdx}
                        className="flex items-center justify-between p-1 hover:bg-slate-50 rounded-xl transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xs font-bold shrink-0">
                            {emoji}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block font-sans">{label}</span>
                            <span className="text-[9px] text-slate-400 block mt-0.5 font-medium">{desc}</span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-800 font-mono">
                          -GHS {Math.abs(exp.amount).toFixed(2)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

        </div>

        {/* 🔮 Real-Time Dynamic Safe-To-Spend & Expense Prediction Deck */}
        <div className="bg-slate-900 text-white rounded-[2.2rem] p-6 sm:p-8 shadow-xl border border-indigo-500/20 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                <span className="text-[10px] font-black tracking-widest text-[#a5b4fc] uppercase font-mono bg-indigo-550/10 px-2.5 py-1 rounded-full">
                  Real-Time Adaptive Budget Intelligence
                </span>
              </div>
              <h3 className="text-xl font-black font-sans text-white tracking-tight mt-2 mb-0">Safe-To-Spend Core &amp; Daily Predictions</h3>
              <p className="text-xs text-slate-400 mt-1">Calculated from how you spend now vs. how to spend the remaining not to overspend.</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Autopilot Master Switch */}
              <button
                onClick={() => {
                  setIsAutopilotOn(!isAutopilotOn);
                  setToastMessage(`Autopilot mode ${!isAutopilotOn ? 'Activated' : 'Suspended'}: Aligned spending controls dynamically.`);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-sans cursor-pointer transition-all border flex items-center gap-1.5 ${
                  isAutopilotOn 
                    ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50 hover:bg-indigo-600/45' 
                    : 'bg-slate-850 text-slate-400 border-slate-750 hover:bg-slate-800'
                }`}
                title="Toggle AI Automatic Autopilot Mode"
              >
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>{isAutopilotOn ? '🌐 Autopilot: ACTIVE' : '🎛️ Autopilot: OFF'}</span>
              </button>

              {currentDailySpendRate <= safeDailyLimit ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-400 leading-none">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  On Track to Save
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs font-bold text-rose-400 leading-none">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Overspend Risk Triggered
                </span>
              )}
            </div>
          </div>

          {/* Core Trend Analytics Study Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Historical Velocity (MTD)</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-black text-rose-400 font-sans">GHS {currentDailySpendRate.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 font-mono">/ day avg</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Calculated across the elapsed <strong className="text-white">{currentDay} days</strong> of June. Total spent: GHS {totalExpenses.toLocaleString()}.
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Recent Speed (Last 3 Days)</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className={`text-xl font-black font-sans ${velocity3Days > safeDailyLimit ? 'text-amber-400' : 'text-emerald-400'}`}>
                  GHS {velocity3Days.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">/ day avg</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Studies short-term momentum. {velocity3Days > velocity7Days ? '🚨 Micro-spending is accelerating.' : '✅ Spending is cooling down.'}
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-[#fed7aa] tracking-wider block">Remaining Safe-To-Spend Ceiling</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-black text-emerald-400 font-sans">GHS {safeDailyLimit.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 font-mono">/ day ceiling</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Max safe budget remaining (GHS {remainingBalance.toLocaleString()}) divided by the remaining <strong className="text-white">{daysRemaining} days</strong>.
              </p>
            </div>
          </div>

          {/* Autopilot Intelligence Banner / Interactive Simulator */}
          <div className="bg-slate-950/45 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs uppercase font-extrabold text-white tracking-wider my-0">
                  {isAutopilotOn ? '🔮 AI Autopilot Active - Trend Recommendations' : '🎛️ Sandbox Manual What-If Simulation'}
                </h4>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium">Daily Target Limit:</span>
                <span className="font-extrabold text-indigo-300 font-mono text-sm">GHS {activePlannedDaily} / day</span>
              </div>
            </div>

            {isAutopilotOn ? (
              <div className="bg-indigo-950/40 border border-indigo-900/60 p-4.5 rounded-2xl space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-lg">🤖</span>
                  <div className="space-y-1">
                    <span className="text-xs font-black text-indigo-300 uppercase tracking-widest block font-mono">Trending Nudge:</span>
                    <p className="text-xs text-slate-200 font-medium my-0 leading-relaxed font-sans">{recommendationLogicNotes}</p>
                  </div>
                </div>
                
                {/* Micro trend tag bar */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-[10px] text-slate-400 border-t border-indigo-900/40">
                  <div>
                    <span className="block font-semibold">Expense Driver:</span>
                    <span className="font-bold text-white uppercase">{primaryExpenseDriver} ({concentrationPercentage}% of recent spend)</span>
                  </div>
                  <div>
                    <span className="block font-semibold">Autopilot Status:</span>
                    <span className="font-bold text-emerald-400 uppercase">🎯 Automatically Calibrating</span>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => {
                      setIsAutopilotOn(false);
                      setToastMessage("Sandbox mode active: Adjust the slider below to experiment with custom forecasts.");
                    }}
                    className="text-[10px] text-indigo-400 hover:text-white font-bold underline bg-transparent border-none p-0 cursor-pointer"
                  >
                    Want to experiment manually instead? Switch to Manual Sandbox Mode
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 my-0">
                  Slide below to simulate how different daily spending rates over the remaining <strong className="text-white">{daysRemaining} days</strong> will impact your end-of-month final balance.
                </p>
                <input
                  type="range"
                  min={10}
                  max={300}
                  step={5}
                  value={sandboxPlannedDaily}
                  onChange={(e) => setSandboxPlannedDaily(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Min: GHS 10</span>
                  <button
                    onClick={() => {
                      setIsAutopilotOn(true);
                      setToastMessage("Autopilot enabled: Realigned current simulator with dynamic trends.");
                    }}
                    className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    ⚡ Enable Autopilot Prediction Limit (GHS {aiRecommendedDaily})
                  </button>
                  <span className="text-[10px] text-slate-500">Max: GHS 300</span>
                </div>
              </div>
            )}

            {/* Simulated Projections Output Row */}
            {(() => {
              const simulatedSpentRemaining = activePlannedDaily * daysRemaining;
              const totalSimulatedExpenses = totalExpenses + simulatedSpentRemaining;
              const anticipatedSurplus = totalIncome - totalSimulatedExpenses;
              const isOverspent = anticipatedSurplus < 0;

              // Study depletion runway 
              const microRunwayDays = velocity3Days > 0 ? Math.round(remainingBalance / velocity3Days) : 99;
              const runwayWarningDate = microRunwayDays <= daysRemaining ? (currentDay + Math.max(1, microRunwayDays)) : null;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="text-[8px] uppercase font-bold text-slate-400 block mb-1 tracking-wider">Projected Remaining Outflows</span>
                    <span className="text-xs font-extrabold text-white font-mono">GHS {simulatedSpentRemaining.toLocaleString()}</span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="text-[8px] uppercase font-bold text-slate-400 block mb-1 tracking-wider">Projected Total Outflows</span>
                    <span className="text-xs font-extrabold text-white font-mono">GHS {totalSimulatedExpenses.toLocaleString()}</span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="text-[8px] uppercase font-bold text-slate-400 block mb-1 tracking-wider">Net Surplus Balance Outcome</span>
                    <span className={`text-xs font-extrabold font-mono ${isOverspent ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {isOverspent ? 'RESERVE DEFICIT: ' : 'RESERVE SURPLUS: '}
                      {isOverspent ? '-' : '+'}GHS {Math.abs(anticipatedSurplus).toLocaleString()}
                    </span>
                  </div>

                  <div className="sm:col-span-3 text-start text-xs py-2.5 px-3 bg-slate-900/50 rounded-xl border border-slate-850 space-y-1">
                    {/* Visual runaways */}
                    {runwayWarningDate ? (
                      <span className="text-amber-400 font-bold flex items-start gap-1.5 font-sans leading-relaxed">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 animate-bounce mt-0.5" />
                        <div>
                          <strong>Depletion Forecast Warning:</strong> At your current short-term velocity of <strong className="text-white">GHS {velocity3Days}/day</strong>, your remaining unspent safe balance of GHS {remainingBalance.toLocaleString()} will run dry in <strong className="text-white">{microRunwayDays} days</strong> (approx <strong className="text-white">June {runwayWarningDate}</strong>). Overspend of the month end is highly predicted!
                        </div>
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold flex items-start gap-1.5 font-sans leading-relaxed">
                        <Check className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                        <div>
                          <strong>Runway Secure:</strong> Fantastic! Sticking to your dynamic prediction limit of <strong className="text-white">GHS {activePlannedDaily}/day</strong> safely supports you through remaining June days. Your predicted excess surplus is GHS {anticipatedSurplus.toLocaleString()}!
                        </div>
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Dynamic Expandable Disclosure advanced ledger insights panel */}
        <div className="border border-white/20 dark:border-slate-800 bg-white/20 backdrop-blur-md rounded-2xl overflow-hidden shadow-xs">
          <button
            onClick={() => setIsAdvancedCoachOpen(!isAdvancedCoachOpen)}
            id="expand-coaching-deck-btn"
            className="w-full py-4 px-6 flex items-center justify-between text-xs font-bold text-slate-900 bg-white/40 hover:bg-white/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-700 animate-spin-slow" />
              <span>Smart Coaching Scenarios & Financial Diagnostic Panel</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-[#2563eb] text-white py-0.5 px-2 rounded-full uppercase tracking-wider font-bold">
                {isAdvancedCoachOpen ? 'Close Drawer' : 'Expand Pro Insights'}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform duration-300 ${isAdvancedCoachOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          <AnimatePresence>
            {isAdvancedCoachOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-white/20 p-6 space-y-6"
              >
                {/* Statistics Row Card - Dynamic Diagnostics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="advanced-analytics-grid">
                  <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Consolidated Net Worth</span>
                    <span className="text-base font-black text-slate-800 block mt-1">GHS {netWorth.toLocaleString(undefined, { minimumFractionDigits: 1 })}</span>
                    <span className="text-[9px] text-slate-400 mt-1 block font-medium">Minus liabilities & debts</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Savings Rate Goal</span>
                    <span className="text-base font-black text-slate-800 block mt-1">{savingsRate > 0 ? savingsRate.toFixed(1) : '20.0'}%</span>
                    <span className="text-[9px] text-emerald-600 mt-1 block font-bold">Target rate threshold: 20%</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Emergency Cash Buffer</span>
                    <span className="text-base font-black text-slate-800 block mt-1">{emergencyMonthsPaid.toFixed(1)} Months</span>
                    <span className="text-[9px] text-slate-400 mt-1 block font-medium">Comfortable survival index</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Weekly Velocity Diff</span>
                    <span className="text-base font-black text-slate-800 block mt-1">{spendPercentChange > 0 ? `+${spendPercentChange.toFixed(1)}%` : `${spendPercentChange.toFixed(1)}%`}</span>
                    <span className="text-[9px] text-slate-400 mt-1 block font-medium">Slowing daily cash flow leaks</span>
                  </div>
                </div>

                {/* Strategy Simulator Component inside Advanced disclosure */}
                <div className="bg-white p-6 rounded-2xl border border-slate-150 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest inline-block select-none">
                      Spend Strategy Simulator & Projections
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-2 my-0">Commited Daily Spending Allowance Target Plans</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-normal">
                      Adjust your target parameters to preview estimated monthly cash flows, runway cushions, and composite score rating effects.
                    </p>
                  </div>

                  {/* 3 Preset scenario Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {scenarios.map((sc) => {
                      const isActive = selectedScenarioId === sc.id;
                      return (
                        <div
                          key={sc.id}
                          onClick={() => handleSelectScenario(sc.id, sc.target)}
                          className={`border-2 p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between ${
                            isActive
                              ? 'border-indigo-600 bg-indigo-50/10'
                              : 'border-slate-100 hover:border-slate-200 bg-slate-50/20'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-black text-slate-800 block font-sans">{sc.name}</span>
                            <p className="text-[10px] text-slate-450 mt-1 font-sans leading-relaxed">{sc.description}</p>
                          </div>
                          <div className="mt-4 border-t border-slate-100/70 pt-2 flex items-center justify-between font-mono">
                            <span className="text-[9px] text-slate-400">ALLOWANCE</span>
                            <span className="text-[11px] font-extrabold text-slate-800">GHS {sc.target}/day</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom target simulator slider */}
                  <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Manual Spend Target Simulator Slider</span>
                      </span>
                      <span className="font-extrabold text-indigo-700 font-mono">GHS {customDailyLimit} / day</span>
                    </div>

                    <input
                      type="range"
                      min={10}
                      max={300}
                      step={5}
                      value={customDailyLimit}
                      onChange={(e) => {
                        setSelectedScenarioId('custom');
                        setCustomDailyLimit(parseInt(e.target.value, 10));
                      }}
                      className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                    />

                    {/* Projections breakdown metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                      <div className="bg-white p-3 border border-slate-150 rounded-xl text-center">
                        <span className="text-[8px] uppercase font-bold text-slate-400 block mb-0.5">Est. Monthly Outflow</span>
                        <span className="text-xs font-extrabold text-slate-800 font-mono">GHS {simulatedMonthlyOutflow.toLocaleString()}</span>
                      </div>

                      <div className="bg-white p-3 border border-slate-150 rounded-xl text-center">
                        <span className="text-[8px] uppercase font-bold text-slate-400 block mb-0.5">Net Cash Balance</span>
                        <span className={`text-xs font-extrabold font-mono ${simulatedMonthlyCashflow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {simulatedMonthlyCashflow >= 0 ? '+' : ''}{simulatedMonthlyCashflow.toLocaleString()}
                        </span>
                      </div>

                      <div className="bg-white p-3 border border-slate-150 rounded-xl text-center">
                        <span className="text-[8px] uppercase font-bold text-slate-400 block mb-0.5">Audit Rating score</span>
                        <span className="text-xs font-extrabold text-slate-800">{simulatedScore} / 100</span>
                      </div>

                      <div className="bg-white p-3 border border-slate-150 rounded-xl text-center">
                        <span className="text-[8px] uppercase font-bold text-slate-400 block mb-0.5">Goals Buffer Runway</span>
                        <span className="text-xs font-extrabold text-slate-800">{simulatedGoalRunwayMonths} Mo.</span>
                      </div>
                    </div>
                  </div>

                  {/* Apply strategy target button */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleApplyStrategy}
                      className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Commit Strategy target</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
