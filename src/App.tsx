import { useState, useEffect } from 'react';
import { Wallet, Transaction, SavingsGoal, Debt, BudgetAllocation, BudgetMethod, AppNotification, Achievement, Challenge, Category } from './types';
import Dashboard from './components/Dashboard';
import WalletSystem from './components/WalletSystem';
import TransactionForm from './components/TransactionForm';
import BudgetingEngine from './components/BudgetingEngine';
import SavingsGoals from './components/SavingsGoals';
import DebtTracker from './components/DebtTracker';
import AICoach from './components/AICoach';
import SecurityLock from './components/SecurityLock';
import TransactionLedger from './components/TransactionLedger';
import MonthlyReporter from './components/MonthlyReporter';
import { LayoutDashboard, Wallet as WalletIcon, Sliders, Target, AlertCircle, Sparkles, Flame, Coins, ShieldCheck, Lock, Unlock, Database, ScrollText, Sun, Moon, X, Plus, Trash2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DEMO_WALLETS: Wallet[] = [
  { id: 'cash', name: 'Physical Cash Wallet', balance: 450.00, inflow: 1200.00, outflow: 750.00, color: 'text-emerald-400' },
  { id: 'momo', name: 'MTN Mobile Money', balance: 1850.50, inflow: 3400.00, outflow: 1549.50, color: 'text-amber-400' },
  { id: 'bank', name: 'GCB Bank Account', balance: 5200.00, inflow: 6500.00, outflow: 1300.00, color: 'text-indigo-400' },
];

const DEMO_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'income', category: 'Salary & Income', amount: 5000.00, note: 'Monthly Salary Paycheck GCB', date: '2026-06-15', walletDest: 'bank' },
  { id: '2', type: 'expense', category: 'Rent & Housing', amount: 1200.00, note: 'Hostel Rent Settlement', date: '2026-06-01', walletSource: 'bank' },
  { id: '3', type: 'expense', category: 'Utilities', amount: 250.00, note: 'ECG Post-Paid Power Bill', date: '2026-06-03', walletSource: 'momo' },
  { id: '4', type: 'expense', category: 'Food & Dining', amount: 35.00, note: 'Bought Waakye and Egg', date: '2026-06-18', walletSource: 'cash' },
  { id: '5', type: 'transfer', category: 'Transfer', amount: 500.00, note: 'GCB Bank to MTN MoMo Topup', date: '2026-06-16', walletSource: 'bank', walletDest: 'momo' },
  { id: '6', type: 'expense', category: 'Transportation', amount: 45.00, note: 'Uber Commute Accra Central', date: '2026-06-19', walletSource: 'momo' },
  { id: '7', type: 'income', category: 'Side Hustle & Business', note: 'Cosmetics sales profit margin', amount: 450.00, date: '2026-06-10', walletDest: 'momo' },
  
  // Historical May 2026 entries for comprehensive statement testing
  { id: 'm1', type: 'income', category: 'Salary & Income', amount: 5000.00, note: 'Monthly Salary Paycheck GCB (May)', date: '2026-05-15', walletDest: 'bank' },
  { id: 'm2', type: 'expense', category: 'Rent & Housing', amount: 1200.00, note: 'Hostel Rent Settlement May', date: '2026-05-01', walletSource: 'bank' },
  { id: 'm3', type: 'expense', category: 'Utilities', amount: 220.00, note: 'ECG Power Bill May', date: '2026-05-03', walletSource: 'momo' },
  { id: 'm4', type: 'expense', category: 'Food & Dining', amount: 180.00, note: 'May Food Groceries Stock', date: '2026-05-12', walletSource: 'cash' },
  { id: 'm5', type: 'expense', category: 'Transportation', amount: 60.50, note: 'Bolt ride to airport', date: '2026-05-20', walletSource: 'momo' },
  { id: 'm6', type: 'income', category: 'Side Hustle & Business', amount: 300.00, note: 'May Consulting fees', date: '2026-05-25', walletDest: 'momo' },
];

const DEMO_BUDGETS: BudgetAllocation[] = [
  { category: 'Rent & Housing', allocated: 1500, spent: 1200 },
  { category: 'Utilities', allocated: 400, spent: 250 },
  { category: 'Food & Dining', allocated: 800, spent: 580 },
  { category: 'Transportation', allocated: 500, spent: 345 },
  { category: 'Healthcare', allocated: 300, spent: 120 },
  { category: 'Entertainment', allocated: 400, spent: 320 },
  { category: 'Tithes', allocated: 500, spent: 400 },
  { category: 'Miscellaneous', allocated: 400, spent: 210 },
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', emoji: '🍔', type: 'expense' },
  { id: '2', name: 'Transportation', emoji: '🚗', type: 'expense' },
  { id: '3', name: 'Utilities', emoji: '💡', type: 'expense' },
  { id: '4', name: 'Rent & Housing', emoji: '🏠', type: 'expense' },
  { id: '5', name: 'Entertainment', emoji: '🍿', type: 'expense' },
  { id: '6', name: 'Healthcare', emoji: '🏥', type: 'expense' },
  { id: '7', name: 'Debt Repayment', emoji: '💳', type: 'expense' },
  { id: '8', name: 'Tithes', emoji: '⛪', type: 'expense' },
  { id: '9', name: 'Miscellaneous', emoji: '🔮', type: 'expense' },
  
  { id: '10', name: 'Salary & Income', emoji: '💼', type: 'income' },
  { id: '11', name: 'Side Hustle & Business', emoji: '🚀', type: 'income' },
  { id: '12', name: 'Savings & Investments', emoji: '📈', type: 'income' },
  { id: '13', name: 'Miscellaneous', emoji: '🔮', type: 'income' },
];

const DEMO_GOALS: SavingsGoal[] = [
  { id: '1', name: 'Emergency Fund', targetAmount: 15000, currentAmount: 3800, targetDate: '2026-12-31', autoContribution: 500 },
  { id: '2', name: 'Business Capital Expansion', targetAmount: 25000, currentAmount: 1800, targetDate: '2027-06-30', autoContribution: 800 },
  { id: '3', name: 'New Car', targetAmount: 60000, currentAmount: 12000, targetDate: '2028-01-15', autoContribution: 1000 },
];

const DEMO_DEBTS: Debt[] = [
  { id: '1', name: 'Momo Loan (Qwikloan)', principal: 1500, balanceRemaining: 750, interestRate: 15.0, dueDate: '2026-07-15', repaymentPlan: 'Deducted directly from MOMO ledger monthly', creditor: 'MTN Partner Bank' },
  { id: '2', name: 'Credit Facility', principal: 8000, balanceRemaining: 4500, interestRate: 12.5, dueDate: '2026-10-31', repaymentPlan: 'GHS 450 monthly bank transfer', creditor: 'Fidelity credit' },
];

const DEMO_NOTIFICATIONS: AppNotification[] = [
  { id: '1', type: 'limit', title: 'Budget Bound Alert', message: 'You have reached 83% of your Transportation allocation limit.', date: '2026-06-20', read: false },
  { id: '2', type: 'balance', title: 'Low balance warning', message: 'Physical cash reserves dipped below GHS 50.', date: '2026-06-19', read: false },
  { id: '3', type: 'bill', title: 'Liabilities Repayment Upcoming', message: 'Fidelity credit GHS 450 due in 10 days.', date: '2026-06-20', read: false },
];

const DEMO_ACHIEVEMENTS: Achievement[] = [
  { id: '1', name: 'Solvency Cadet', description: 'Log a first multi-wallet transaction ledger entry', unlocked: true, icon: 'Award' },
  { id: '2', name: 'Frugal Shield Master', description: 'Maintain three months of positive savings rate balances', unlocked: true, icon: 'ShieldCheck' },
  { id: '3', name: 'Asset Aggregator', description: 'Achieve positive net worth quotient limits', unlocked: true, icon: 'TrendingUp' },
  { id: '4', name: 'Cascade Killer', description: 'Successfully repay a liabilities ledger', unlocked: false, icon: 'Flame' },
  { id: '5', name: 'AI Scholar', description: 'Diagnostic audit from AI coaching desk', unlocked: false, icon: 'Sparkles' },
];

const DEMO_CHALLENGES: Challenge[] = [
  { id: '1', name: 'Waakye Freeze Nudge', description: 'Cut entertainment spending by 25% this cycle to earn points', rewardPoints: 120, progress: 1, target: 4, unit: 'Weeks', completed: false },
  { id: '2', name: 'Emergency Fortress', description: 'Deposit GHS 500 into your Emergency Fund', rewardPoints: 200, progress: 200, target: 500, unit: 'GHS', completed: false },
  { id: '3', name: 'Solvency Champion', description: 'Post 5 manual transaction logs this week', rewardPoints: 80, progress: 5, target: 5, unit: 'Transactions', completed: true },
];

// LIVE WORKSPACE DEFAULTS (Ready to receive data)
const LIVE_DEFAULT_WALLETS: Wallet[] = [
  { id: 'cash', name: 'Physical Cash Wallet', balance: 0.00, inflow: 0.00, outflow: 0.00, color: 'text-emerald-400' },
  { id: 'momo', name: 'MTN Mobile Money', balance: 0.00, inflow: 0.00, outflow: 0.00, color: 'text-amber-400' },
  { id: 'bank', name: 'GCB Bank Account', balance: 0.00, inflow: 0.00, outflow: 0.00, color: 'text-indigo-400' },
];

const LIVE_DEFAULT_BUDGETS: BudgetAllocation[] = [
  { category: 'Rent & Housing', allocated: 0, spent: 0 },
  { category: 'Utilities', allocated: 0, spent: 0 },
  { category: 'Food & Dining', allocated: 0, spent: 0 },
  { category: 'Transportation', allocated: 0, spent: 0 },
  { category: 'Healthcare', allocated: 0, spent: 0 },
  { category: 'Entertainment', allocated: 0, spent: 0 },
  { category: 'Miscellaneous', allocated: 0, spent: 0 },
];

const LIVE_DEFAULT_CHALLENGES: Challenge[] = [
  { id: '1', name: 'Daily Wage Budget Shield', description: 'Keep daily purchases beneath the limit budget target', rewardPoints: 100, progress: 0, target: 5, unit: 'Days', completed: false },
  { id: '2', name: 'Emergency Seed Capsule', description: 'Save your initial GHS 100 in target reserves', rewardPoints: 150, progress: 0, target: 100, unit: 'GHS', completed: false },
  { id: '3', name: 'Multi-ledger Solvency Integration', description: 'Perform 3 balanced wallet allocations', rewardPoints: 80, progress: 0, target: 3, unit: 'Registrations', completed: false }
];

const LIVE_DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: '1', name: 'Solvency Cadet', description: 'Log a first multi-wallet transaction ledger entry', unlocked: false, icon: 'Award' },
  { id: '2', name: 'Frugal Shield Master', description: 'Maintain three months of positive savings rate balances', unlocked: false, icon: 'ShieldCheck' },
  { id: '3', name: 'Asset Aggregator', description: 'Achieve positive net worth quotient limits', unlocked: false, icon: 'TrendingUp' },
  { id: '4', name: 'Cascade Killer', description: 'Successfully repay a liabilities ledger', unlocked: false, icon: 'Flame' },
  { id: '5', name: 'AI Scholar', description: 'Diagnostic audit from AI coaching desk', unlocked: false, icon: 'Sparkles' },
];

export default function App() {
  const [pinLocked, setPinLocked] = useState<boolean>(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab ] = useState<'dashboard' | 'wallets' | 'budget' | 'goals' | 'debts' | 'coach' | 'ledger' | 'reports'>('dashboard');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('fincoach_theme');
    return saved ? saved === 'dark' : true;
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const nextTheme = !prev;
      localStorage.setItem('fincoach_theme', nextTheme ? 'dark' : 'light');
      return nextTheme;
    });
  };

  // Preloaded with a unified Free User configuration (Demo Sandbox toggler removed)
  const isDemoMode = false;

  // Dynamic status states initialized based on the default premium template
  const [score, setScore] = useState<number>(() => {
    const saved = localStorage.getItem('fincoach_user_score');
    if (saved) return parseInt(saved, 10);
    return 84; // Pristine, high starter score
  });

  const [accruedPoints, setAccruedPoints] = useState<number>(() => {
    const saved = localStorage.getItem('fincoach_user_points');
    if (saved) return parseInt(saved, 10);
    return 450;
  });

  const [savingsStreak, setSavingsStreak] = useState<number>(() => {
    const saved = localStorage.getItem('fincoach_user_streak');
    if (saved) return parseInt(saved, 10);
    return 4;
  });

  // Persistent Ledger states loaded directly for user
  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const saved = localStorage.getItem('fincoach_user_wallets');
    if (saved) return JSON.parse(saved);
    return DEMO_WALLETS;
  });

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('fincoach_user_txs');
    if (saved) return JSON.parse(saved);
    return DEMO_TRANSACTIONS;
  });

  const [budgetMethod, setBudgetMethod] = useState<BudgetMethod>('50/30/20');
  const [customPercentages, setCustomPercentages] = useState<Record<string, number>>({ Needs: 50, Wants: 30, Savings: 20 });
  
  const [budgetAllocations, setBudgetAllocations] = useState<BudgetAllocation[]>(() => {
    const saved = localStorage.getItem('fincoach_user_allocations');
    if (saved) return JSON.parse(saved);
    return DEMO_BUDGETS;
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('fincoach_user_goals');
    if (saved) return JSON.parse(saved);
    return DEMO_GOALS;
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('fincoach_user_debts');
    if (saved) return JSON.parse(saved);
    return DEMO_DEBTS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('fincoach_user_notifications');
    if (saved) return JSON.parse(saved);
    return DEMO_NOTIFICATIONS;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('fincoach_user_achievements');
    if (saved) return JSON.parse(saved);
    return DEMO_ACHIEVEMENTS;
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem('fincoach_user_challenges');
    if (saved) return JSON.parse(saved);
    return DEMO_CHALLENGES;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('fincoach_user_categories');
    if (saved) return JSON.parse(saved);
    return DEFAULT_CATEGORIES;
  });

  // General statistics indicators
  const totalIncome = wallets.reduce((acc, w) => acc + w.inflow, 0);
  const totalExpenses = wallets.reduce((acc, w) => acc + w.outflow, 0);

  // Synchronize state mutations to LocalStorage automatically
  useEffect(() => {
    localStorage.setItem('fincoach_user_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('fincoach_user_wallets', JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem('fincoach_user_txs', JSON.stringify(recentTransactions));
  }, [recentTransactions]);

  useEffect(() => {
    localStorage.setItem('fincoach_user_goals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem('fincoach_user_debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('fincoach_user_allocations', JSON.stringify(budgetAllocations));
  }, [budgetAllocations]);

  useEffect(() => {
    localStorage.setItem('fincoach_user_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('fincoach_user_achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('fincoach_user_score', score.toString());
  }, [score]);

  useEffect(() => {
    localStorage.setItem('fincoach_user_points', accruedPoints.toString());
  }, [accruedPoints]);

  useEffect(() => {
    localStorage.setItem('fincoach_user_streak', savingsStreak.toString());
  }, [savingsStreak]);

  useEffect(() => {
    localStorage.setItem('fincoach_user_challenges', JSON.stringify(challenges));
  }, [challenges]);

  // Automatic budget calculations based on selected budget allocation method
  useEffect(() => {
    if (budgetMethod === 'manual') return;

    // Use a baseline income of 5000 if totalIncome is 0, so there's valid allocated data for default demo view
    const effectiveIncome = totalIncome > 0 ? totalIncome : 5000;

    let needsPct = 0.5;
    let wantsPct = 0.3;
    let savingsPct = 0.2;

    if (budgetMethod === '70/20/10') {
      needsPct = 0.7;
      wantsPct = 0.2;
      savingsPct = 0.1;
    } else if (budgetMethod === 'custom') {
      needsPct = (customPercentages.Needs || 50) / 100;
      wantsPct = (customPercentages.Wants || 30) / 100;
      savingsPct = (customPercentages.Savings || 20) / 100;
    }

    const needsPool = effectiveIncome * needsPct;
    const wantsPool = effectiveIncome * wantsPct;

    const expenseCategories = categories.filter(c => c.type === 'expense');
    
    // Categorize dynamic groups to divide allocations
    const needsCategories = expenseCategories.filter(c => {
      const name = c.name.toLowerCase();
      return name.includes('rent') || name.includes('utilities') || name.includes('food') || name.includes('transport') || name.includes('health') || name.includes('debt') || name.includes('tithe');
    });
    
    const wantsCategories = expenseCategories.filter(c => {
      const name = c.name.toLowerCase();
      return !(name.includes('rent') || name.includes('utilities') || name.includes('food') || name.includes('transport') || name.includes('health') || name.includes('debt') || name.includes('tithe'));
    });

    const needsShare = needsCategories.length > 0 ? parseFloat((needsPool / needsCategories.length).toFixed(2)) : 0;
    const wantsShare = wantsCategories.length > 0 ? parseFloat((wantsPool / wantsCategories.length).toFixed(2)) : 0;

    // Function to calculate actual spent for a category dynamically from transactions list
    const getSpentForCategory = (cat: string) => {
      const expenseTxs = recentTransactions.filter(t => t.type === 'expense');
      const firstWord = cat.toLowerCase().split(' ')[0];
      const total = expenseTxs
        .filter(t => t.category.toLowerCase() === cat.toLowerCase() || t.category.toLowerCase().includes(firstWord))
        .reduce((sum, t) => sum + t.amount, 0);
      return parseFloat(total.toFixed(2));
    };

    const newAllocations = expenseCategories.map(c => {
      const isNeed = needsCategories.some(nc => nc.id === c.id);
      const allocatedAmt = isNeed ? needsShare : wantsShare;
      return {
        category: c.name,
        allocated: allocatedAmt,
        spent: getSpentForCategory(c.name)
      };
    });

    setBudgetAllocations(newAllocations);
  }, [budgetMethod, totalIncome, customPercentages, recentTransactions, categories]);

  // Automated Conditional Notification System for Overspend Nudges
  useEffect(() => {
    const expenseTxs = recentTransactions.filter((t) => t.type === 'expense');
    if (expenseTxs.length === 0) return;

    // Determine the latest logged day with expenses
    const sortedExpenseDates = [...expenseTxs].map(t => t.date).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const latestDate = sortedExpenseDates[0] || new Date().toISOString().split('T')[0];

    // Compute actual daily spend for that latest date
    const actualDailySpend = expenseTxs
      .filter((t) => t.date === latestDate)
      .reduce((sum, t) => sum + t.amount, 0);

    // Compute historical baseline prediction divisor
    const totalSpentVal = expenseTxs.reduce((sum, t) => sum + t.amount, 0);
    const expenseDates = expenseTxs.map(t => t.date);
    const uniqueDatesCount = Array.from(new Set(expenseDates)).length;
    const divisor = Math.max(uniqueDatesCount, 14);
    const averageDailySpend = totalSpentVal > 0 ? parseFloat((totalSpentVal / divisor).toFixed(2)) : 65.00;

    // Retrieve active target limit (the selected scenario limit) from localStorage, or baseline
    const savedLimit = localStorage.getItem('fincoach_active_limit');
    const predictedDailySpend = savedLimit ? parseFloat(savedLimit) : averageDailySpend;

    // Real-Time Safe-To-Spend Adaptive calculations
    const nowObj = new Date();
    const currentDay = nowObj.getDate(); 
    const totalDaysInMonth = new Date(nowObj.getFullYear(), nowObj.getMonth() + 1, 0).getDate(); 
    const daysRemaining = Math.max(1, totalDaysInMonth - currentDay + 1); 

    const remainingBalance = totalIncome - totalExpenses;
    const safeDailyLimit = remainingBalance > 0 ? parseFloat((remainingBalance / daysRemaining).toFixed(2)) : 0;

    // Use safeDailyLimit if it is more restrictive, to help them not overspend remaining cash
    const effectiveLimit = (safeDailyLimit > 0 && safeDailyLimit < predictedDailySpend) ? safeDailyLimit : predictedDailySpend;
    const threshold = effectiveLimit * 1.2;

    if (actualDailySpend > threshold) {
      const notifId = `exceeded-limit-${latestDate}`;
      
      setNotifications(prev => {
        const alreadyExists = prev.some(n => n.id === notifId);
        if (alreadyExists) return prev;

        const overspendRatio = Math.round((actualDailySpend / effectiveLimit) * 100);
        const excessAmt = actualDailySpend - effectiveLimit;
        
        const tips = [
          `Your actual daily spend of GHS ${actualDailySpend} is ${overspendRatio}% of your GHS ${effectiveLimit.toFixed(2)} adaptive safe daily limit! Recalibrate by cutting non-essential convenience food services or postponing elective MoMo transfers.`,
          `Daily cap limit exceeded on ${latestDate} (GHS ${actualDailySpend} vs GHS ${effectiveLimit.toFixed(2)} predicted safe-to-spend limit, +${overspendRatio - 100}%). Secure your cash reserves by placing GHS ${Math.round(excessAmt)} of available cash into your Emergency Fund goal capsule right away.`,
          `Leakage alert: Spending on ${latestDate} is over your remaining safe-to-spend limit of GHS ${effectiveLimit.toFixed(2)} by GHS ${Math.round(excessAmt)}. AI Coach nudge: Settle your wallets, avoid luxury rides, and activate 'Frugal Shield' to rebuild cash solvency.`
        ];

        const selectedTip = tips[Math.floor(Math.random() * tips.length)];

        // Update score slightly
        setTimeout(() => setScore(prev => Math.max(35, prev - 3)), 0);

        const newNotification: AppNotification = {
          id: notifId,
          type: 'limit',
          title: `Overspent Alert: Exceeded Target (+${overspendRatio - 100}%)`,
          message: selectedTip,
          date: latestDate,
          read: false
        };

        return [newNotification, ...prev];
      });
    }
  }, [recentTransactions]);

  // Synchronize dynamic balances on adding income, expense or transfers
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const nextTx = { ...newTx, id: Math.random().toString() };
    setRecentTransactions((prev) => [nextTx, ...prev]);

    // Update affected wallet balances
    setWallets((prevWallets) => {
      return prevWallets.map((w) => {
        let nextBal = w.balance;
        let nextInflow = w.inflow;
        let nextOutflow = w.outflow;

        if (newTx.type === 'expense' && w.id === newTx.walletSource) {
          nextBal -= newTx.amount;
          nextOutflow += newTx.amount;
        } else if (newTx.type === 'income' && w.id === newTx.walletDest) {
          nextBal += newTx.amount;
          nextInflow += newTx.amount;
        } else if (newTx.type === 'transfer') {
          if (w.id === newTx.walletSource) {
            nextBal -= newTx.amount;
            nextOutflow += newTx.amount; // track as out of this specific wallet
          }
          if (w.id === newTx.walletDest) {
            nextBal += newTx.amount;
            nextInflow += newTx.amount; // track as in of this specific wallet
          }
        }

        return {
          ...w,
          balance: parseFloat(Math.max(0, nextBal).toFixed(2)),
          inflow: parseFloat(nextInflow.toFixed(2)),
          outflow: parseFloat(nextOutflow.toFixed(2)),
        };
      });
    });

    // Update actual spent in matching budgeting allocation category
    if (newTx.type === 'expense' && newTx.category) {
      setBudgetAllocations((prevAlloc) => {
        let matched = false;
        const nextAlloc = prevAlloc.map((a) => {
          const firstWord = newTx.category.toLowerCase().split(' ')[0];
          if (
            a.category.toLowerCase() === newTx.category.toLowerCase() ||
            a.category.toLowerCase().includes(firstWord)
          ) {
            matched = true;
            return { ...a, spent: parseFloat((a.spent + newTx.amount).toFixed(2)) };
          }
          return a;
        });

        // if not matched directly, add to Miscellaneous
        if (!matched) {
          return nextAlloc.map((a) => {
            if (a.category === 'Miscellaneous') {
              return { ...a, spent: parseFloat((a.spent + newTx.amount).toFixed(2)) };
            }
            return a;
          });
        }
        return nextAlloc;
      });
    }

    // Reward points for logging data!
    setAccruedPoints(prev => prev + 15);
  };

  const handleDeleteTransaction = (id: string) => {
    const tx = recentTransactions.find((t) => t.id === id);
    if (!tx) return;

    // 1. Reverse Wallet entries
    setWallets((prevWallets) => {
      return prevWallets.map((w) => {
        let nextBal = w.balance;
        let nextInflow = w.inflow;
        let nextOutflow = w.outflow;

        if (tx.type === 'expense' && w.id === tx.walletSource) {
          nextBal += tx.amount;
          nextOutflow -= tx.amount;
        } else if (tx.type === 'income' && w.id === tx.walletDest) {
          nextBal -= tx.amount;
          nextInflow -= tx.amount;
        } else if (tx.type === 'transfer') {
          if (w.id === tx.walletSource) {
            nextBal += tx.amount;
            nextOutflow -= tx.amount;
          }
          if (w.id === tx.walletDest) {
            nextBal -= tx.amount;
            nextInflow -= tx.amount;
          }
        }

        return {
          ...w,
          balance: parseFloat(Math.max(0, nextBal).toFixed(2)),
          inflow: parseFloat(Math.max(0, nextInflow).toFixed(2)),
          outflow: parseFloat(Math.max(0, nextOutflow).toFixed(2)),
        };
      });
    });

    // 2. Reverse Budget category allocations spent counters
    if (tx.type === 'expense' && tx.category) {
      setBudgetAllocations((prevAlloc) => {
        let matched = false;
        const nextAlloc = prevAlloc.map((a) => {
          const firstWord = tx.category.toLowerCase().split(' ')[0];
          if (
            a.category.toLowerCase() === tx.category.toLowerCase() ||
            a.category.toLowerCase().includes(firstWord)
          ) {
            matched = true;
            return { ...a, spent: parseFloat(Math.max(0, a.spent - tx.amount).toFixed(2)) };
          }
          return a;
        });

        if (!matched) {
          return nextAlloc.map((a) => {
            if (a.category === 'Miscellaneous') {
              return { ...a, spent: parseFloat(Math.max(0, a.spent - tx.amount).toFixed(2)) };
            }
            return a;
          });
        }
        return nextAlloc;
      });
    }

    // 3. Remove transaction from primary state list
    setRecentTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const nextG = { ...goal, id: Math.random().toString() };
    setSavingsGoals(prev => [...prev, nextG]);
    setAccruedPoints(prev => prev + 50);
  };

  const handleContributeToGoal = (id: string, amount: number) => {
    setSavingsGoals((prev) => {
      return prev.map((g) => {
        if (g.id === id) {
          return { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) };
        }
        return g;
      });
    });
    setAccruedPoints(prev => prev + 25);
  };

  const handleAddDebt = (debt: Omit<Debt, 'id'>) => {
    const nextD = { ...debt, id: Math.random().toString() };
    setDebts(prev => [...prev, nextD]);
  };

  const handlePayDebt = (id: string, amount: number) => {
    setDebts((prev) => {
      return prev.map((d) => {
        if (d.id === id) {
          const nextBal = Math.max(0, d.balanceRemaining - amount);
          if (nextBal === 0) {
            // Unlock "Cascade Killer" achievement on paid debt!
            setAchievements(prevAch => prevAch.map(a => a.id === '4' ? { ...a, unlocked: true } : a));
          }
          return { ...d, balanceRemaining: nextBal };
        }
        return d;
      });
    });
  };

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleCompleteChallenge = (id: string, pts: number) => {
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, completed: true, progress: c.target } : c));
    setAccruedPoints(prev => prev + pts);
  };

  const handleUpdateAllocatedBudget = (category: string, nextAllocatedVal: number) => {
    setBudgetAllocations(prev => prev.map(a => a.category === category ? { ...a, allocated: nextAllocatedVal } : a));
  };

  const handleAddCategory = (name: string, emoji: string, type: 'expense' | 'income') => {
    const newId = Date.now().toString();
    const newCat: Category = { id: newId, name, emoji, type };
    setCategories(prev => {
      if (prev.some(c => c.name.toLowerCase() === name.toLowerCase() && c.type === type)) {
        return prev;
      }
      return [...prev, newCat];
    });

    if (type === 'expense') {
      setBudgetAllocations(prev => {
        if (prev.some(a => a.category.toLowerCase() === name.toLowerCase())) {
          return prev;
        }
        return [...prev, { category: name, allocated: 0, spent: 0 }];
      });
    }
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const handleClearEverything = () => {
    setRecentTransactions([]);
    setWallets(LIVE_DEFAULT_WALLETS);
    setSavingsGoals([]);
    setDebts([]);
    setBudgetAllocations(LIVE_DEFAULT_BUDGETS);
    setNotifications([]);
    setScore(100);
    setAccruedPoints(0);
    setSavingsStreak(0);
    setChallenges(LIVE_DEFAULT_CHALLENGES);
    setAchievements(LIVE_DEFAULT_ACHIEVEMENTS);
    setCategories(DEFAULT_CATEGORIES);
    setIsResetConfirmOpen(false);
  };

  const handleLoadDemoData = () => {
    setRecentTransactions(DEMO_TRANSACTIONS);
    setWallets(DEMO_WALLETS);
    setBudgetAllocations(DEMO_BUDGETS);
    setSavingsGoals(DEMO_GOALS);
    setDebts(DEMO_DEBTS);
    setNotifications(DEMO_NOTIFICATIONS);
    setCategories(DEFAULT_CATEGORIES);
    setScore(84);
    setAccruedPoints(450);
    setSavingsStreak(4);
    setChallenges(DEMO_CHALLENGES);
    setAchievements(DEMO_ACHIEVEMENTS);
  };

  if (pinLocked) {
    return <SecurityLock onUnlock={() => setPinLocked(false)} />;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'light bg-slate-50 text-slate-900'} flex flex-col font-sans select-none relative pb-10 transition-colors duration-300`}>
      
      {/* Background radial meshes */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 -ml-32 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Primary Header Grid */}
      <header className={`border-b ${isDarkMode ? 'border-slate-900 bg-slate-950/80 text-white' : 'border-slate-200 bg-white/90 text-slate-900'} backdrop-blur-md sticky top-0 z-40 select-none shadow-xs`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-400 p-0.5 flex items-center justify-center shadow-md">
              <div className={`w-full h-full ${isDarkMode ? 'bg-slate-950 text-indigo-400' : 'bg-white text-indigo-600'} font-black rounded-[10px] flex items-center justify-center text-sm font-sans tracking-widest uppercase`}>FC</div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-base font-sans font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} leading-none tracking-tight`}>FinCoach Free Edition</h1>
                <span className={`text-[10px] font-mono font-bold border rounded px-1.5 py-0.5 uppercase tracking-wide ${isDarkMode ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-emerald-700 bg-emerald-50 border-emerald-200'}`}>Active Ledger</span>
              </div>
              <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} font-mono mt-0.5`}>Behavioral Wealth Assistant & Ledgers</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="text-right hidden sm:block border-l border-slate-800 pl-4">
              <span className="text-[9px] text-slate-500 uppercase font-mono tracking-wider block">Solvency score</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {score}/100
              </span>
            </div>

            <button
               onClick={toggleTheme}
               className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-850 hover:bg-slate-850 hover:border-slate-800 transition-all text-slate-400 hover:text-white cursor-pointer flex items-center justify-center gap-1.5"
               title={isDarkMode ? 'Switch to Normal Day Mode' : 'Switch to Night Theme'}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-bold text-slate-400 hidden md:inline">Normal Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-900" />
                  <span className="text-[10px] font-bold text-slate-900 hidden md:inline">Night Mode</span>
                </>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 select-none">
        
        {/* Left column navigation bar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 space-y-1.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-3.5 px-2">Navigation Deck</div>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl text-left transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40 border border-transparent'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-400" />
              <span>Diagnostic Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl text-left transition-all cursor-pointer ${
                activeTab === 'ledger'
                  ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40 border border-transparent'
              }`}
            >
              <ScrollText className="w-4 h-4 text-indigo-400" />
              <span className="flex items-center gap-1 w-full justify-between">
                <span>Everything Bought</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 font-mono px-2 py-0.5 rounded-full font-bold">
                  {recentTransactions.filter(t => t.type === 'expense').length}
                </span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('wallets')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl text-left transition-all cursor-pointer ${
                activeTab === 'wallets'
                  ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40 border border-transparent'
              }`}
            >
              <WalletIcon className="w-4 h-4 text-indigo-400" />
              <span>Multi-Wallet Ledgers</span>
            </button>

            <button
              onClick={() => setActiveTab('budget')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl text-left transition-all cursor-pointer ${
                activeTab === 'budget'
                  ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40 border border-transparent'
              }`}
            >
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Prioritized Budgets</span>
            </button>

            <button
              onClick={() => setActiveTab('goals')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl text-left transition-all cursor-pointer ${
                activeTab === 'goals'
                  ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40 border border-transparent'
              }`}
            >
              <Target className="w-4 h-4 text-indigo-400" />
              <span>Wealth Goal Capsules</span>
            </button>

            <button
              onClick={() => setActiveTab('debts')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl text-left transition-all cursor-pointer ${
                activeTab === 'debts'
                  ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40 border border-transparent'
              }`}
            >
              <AlertCircle className="w-4 h-4 text-indigo-400" />
              <span>Liabilities repayment</span>
            </button>

            <button
              onClick={() => setActiveTab('coach')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl text-left transition-all cursor-pointer ${
                activeTab === 'coach'
                  ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40 border border-transparent'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>AI Coaching Desk</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl text-left transition-all cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40 border border-transparent'
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Archived Statements</span>
            </button>
          </div>

          {/* Add Ledger Entry CTA button (Stylish pop-up launcher) */}
          <button
            onClick={() => setIsTransactionModalOpen(true)}
            id="add-ledger-log-btn"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-650/10 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 text-center mt-3"
          >
            <Plus className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
            <span>Add Ledger Log</span>
          </button>

          {/* Clear Everything & Reset All Data Button */}
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            id="clear-all-data-btn"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-rose-450 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-500 rounded-xl transition-all cursor-pointer text-center mt-2"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            <span>Clear Everything</span>
          </button>
        </div>

        {/* Right 3 columns main content viewer */}
        <div className="lg:col-span-3 space-y-6">
          
          {activeTab === 'dashboard' && (
            <Dashboard
              score={score}
              wallets={wallets}
              recentTransactions={recentTransactions}
              goals={savingsGoals}
              debts={debts}
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              savingsStreak={savingsStreak}
              notifications={notifications}
              onDismissNotification={handleDismissNotification}
              onOpenTransactionModal={() => setIsTransactionModalOpen(true)}
              onLoadDemoData={handleLoadDemoData}
            />
          )}

          {activeTab === 'wallets' && (
            <WalletSystem
              wallets={wallets}
              recentTransactions={recentTransactions}
              onAddTransaction={handleAddTransaction}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetingEngine
              method={budgetMethod}
              totalIncome={totalIncome}
              allocations={budgetAllocations}
              onChangeMethod={setBudgetMethod}
              onUpdateAllocated={handleUpdateAllocatedBudget}
              customPercentages={customPercentages}
              onUpdateCustomPercentages={setCustomPercentages}
              categories={categories}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {activeTab === 'goals' && (
            <SavingsGoals
              goals={savingsGoals}
              onAddGoal={handleAddGoal}
              onContribute={handleContributeToGoal}
            />
          )}

          {activeTab === 'debts' && (
            <DebtTracker
              debts={debts}
              onAddDebt={handleAddDebt}
              onPayDebt={handlePayDebt}
            />
          )}

          {activeTab === 'coach' && (
            <AICoach
              wallets={wallets}
              recentTransactions={recentTransactions}
              goals={savingsGoals}
              debts={debts}
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              budgetMethod={budgetMethod}
              notifications={notifications}
              onDismissNotification={handleDismissNotification}
            />
          )}

          {activeTab === 'ledger' && (
            <TransactionLedger
              transactions={recentTransactions}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'reports' && (
            <MonthlyReporter
              transactions={recentTransactions}
              wallets={wallets}
              goals={savingsGoals}
              debts={debts}
              budgetMethod={budgetMethod}
            />
          )}

        </div>

      </main>

      {/* Stylish, high-fidelity pop-up overlays for Quick Ledger Form */}
      {isTransactionModalOpen && (
        <div id="quick-ledger-modal-overlay" className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Coins className="w-4 h-4 text-indigo-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white my-0">New Ledger Log Entry</h3>
              </div>
              <button
                onClick={() => setIsTransactionModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <TransactionForm
                categories={categories}
                onAddCategory={handleAddCategory}
                onAddTransaction={(tx) => {
                  handleAddTransaction(tx);
                  setIsTransactionModalOpen(false);
                }}
                onClose={() => setIsTransactionModalOpen(false)}
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Reset Confirmation Overlay */}
      {isResetConfirmOpen && (
        <div id="reset-confirm-modal-overlay" className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2 text-rose-500">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white my-0">Confirm Wipe Ledger</h3>
              </div>
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8 text-rose-500" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">Are you absolutely sure?</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  This action is irreversible. All recorded transactions, custom wallet balances, budget allocations, debts list, and streak logs will be completely cleared.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer border border-slate-200 dark:border-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleClearEverything}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-all cursor-pointer shadow-md shadow-rose-950/20"
              >
                Wipe All Data
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
