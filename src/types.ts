export type WalletType = 'cash' | 'momo' | 'bank';

export interface Category {
  id: string;
  name: string;
  emoji: string;
  type: 'expense' | 'income';
}

export interface Wallet {
  id: WalletType;
  name: string;
  balance: number;
  inflow: number;
  outflow: number;
  color: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string; // e.g. "Food", "Transport", "Salary", "Transfer"
  amount: number;
  note: string;
  date: string; // ISO date string or YYYY-MM-DD
  walletSource?: WalletType; // For expenses, transfers
  walletDest?: WalletType;   // For transfers, income
}

export type BudgetMethod = 'manual' | '50/30/20' | '70/20/10' | 'custom';

export interface BudgetAllocation {
  category: string;
  allocated: number;
  spent: number;
}

export interface Budget {
  method: BudgetMethod;
  customPercentages?: Record<string, number>; // For custom budget rule
}

export interface Debt {
  id: string;
  name: string;
  principal: number;
  balanceRemaining: number;
  interestRate: number; // in %
  dueDate: string;
  repaymentPlan: string;
  creditor: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  autoContribution: number; // monthly allocation
  imageUrl?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  icon: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  rewardPoints: number;
  progress: number;
  target: number;
  unit: string;
  completed: boolean;
}

export interface FinancialHealth {
  netWorth: number;
  savingsRate: number; // as % of income
  cashFlow: number; // Income - Expense this month
  emergencyFundStatus: number; // months of essential expenses covered
  debtRatio: number; // total debt to total monthly income ratio (%)
  financialScore: number; // 0-100 score
}

export interface AppNotification {
  id: string;
  type: 'limit' | 'balance' | 'bill' | 'reminder' | 'tip';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface MonthlyReport {
  id: string;
  month: string; // e.g. "2026-06"
  createdAt: string;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  topExpenseCategory: string;
  categoryBreakdown: Record<string, { spent: number; count: number }>;
  aiSummary: string;
  score: number;
  criticalInsights: string[];
  riskyIndicators: string[];
  budgetMethod: string;
  totalSavingsAllocation: number;
}

