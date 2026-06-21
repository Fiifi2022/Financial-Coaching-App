import * as React from 'react';
import { useState } from 'react';
import { MonthlyReport, Transaction, Wallet, SavingsGoal, Debt } from '../types';
import { Calendar, FileText, Sparkles, Plus, Trash2, Printer, Check, Info, TrendingUp, TrendingDown, ArrowLeft, Target, AlertTriangle } from 'lucide-react';

interface MonthlyReporterProps {
  transactions: Transaction[];
  wallets: Wallet[];
  goals: SavingsGoal[];
  debts: Debt[];
  budgetMethod: string;
}

export default function MonthlyReporter({
  transactions,
  wallets,
  goals,
  debts,
  budgetMethod
}: MonthlyReporterProps) {
  // Load archived reports from localStorage
  const [savedReports, setSavedReports] = useState<MonthlyReport[]>(() => {
    const saved = localStorage.getItem('fincoach_monthly_reports');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    // Default to current month: YYYY-MM
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  const [isDrafting, setIsDrafting] = useState(false);
  const [activeReport, setActiveReport] = useState<MonthlyReport | null>(null);
  const [draftResult, setDraftResult] = useState<MonthlyReport | null>(null);

  // Helper: Format YYYY-MM to human readable (e.g. June 2026)
  const formatMonthLabel = (yyyymm: string) => {
    const [year, month] = yyyymm.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Get unique months present in transactions to suggest them, plus the current month
  const getSuggestedMonths = () => {
    const months = new Set<string>();
    
    // Always include current month
    const now = new Date();
    const currentStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    months.add(currentStr);

    transactions.forEach(t => {
      if (t.date) {
        // Parse date (either YYYY-MM-DD or ISO)
        const parts = t.date.split('-');
        if (parts.length >= 2) {
          months.add(`${parts[0]}-${parts[1]}`);
        }
      }
    });

    return Array.from(months).sort().reverse();
  };

  const calculateMonthStats = (monthStr: string) => {
    const monthTransactions = transactions.filter(t => {
      if (!t.date) return false;
      return t.date.startsWith(monthStr);
    });

    const totalIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savingsRate = totalIncome > 0 
      ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
      : 0;

    // Category breakdown
    const categoryBreakdown: Record<string, { spent: number; count: number }> = {};
    const expenseTransactions = monthTransactions.filter(t => t.type === 'expense');
    
    expenseTransactions.forEach(t => {
      if (!categoryBreakdown[t.category]) {
        categoryBreakdown[t.category] = { spent: 0, count: 0 };
      }
      categoryBreakdown[t.category].spent += t.amount;
      categoryBreakdown[t.category].count += 1;
    });

    let topExpenseCategory = 'None/Default';
    let maxSpent = -1;
    Object.keys(categoryBreakdown).forEach(cat => {
      if (categoryBreakdown[cat].spent > maxSpent) {
        maxSpent = categoryBreakdown[cat].spent;
        topExpenseCategory = cat;
      }
    });

    return {
      totalIncome,
      totalExpenses,
      savingsRate,
      topExpenseCategory,
      categoryBreakdown,
      itemCount: monthTransactions.length,
      expenseCount: expenseTransactions.length
    };
  };

  // Run reports analyzer utilizing server endpoint or fallback calculations
  const handleDraftReport = async () => {
    setIsDrafting(true);
    setDraftResult(null);

    const stats = calculateMonthStats(selectedMonth);

    try {
      // Trigger API coaching model proxy passing exact records matching selectedMonth
      const response = await fetch('/api/coaching/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallets,
          transactions: transactions.filter(t => t.date && t.date.startsWith(selectedMonth)),
          goals,
          debts,
          totalIncome: stats.totalIncome,
          totalExpenses: stats.totalExpenses,
          budgetMethod: budgetMethod
        })
      });

      if (!response.ok) {
        throw new Error('API server failed');
      }

      const advice = await response.json();
      
      const draft: MonthlyReport = {
        id: `re-${Date.now()}`,
        month: selectedMonth,
        createdAt: new Date().toISOString(),
        totalIncome: stats.totalIncome,
        totalExpenses: stats.totalExpenses,
        savingsRate: stats.savingsRate,
        topExpenseCategory: stats.topExpenseCategory,
        categoryBreakdown: stats.categoryBreakdown,
        aiSummary: advice.weeklyReport || "Draft successfully completed.",
        score: advice.score || 70,
        criticalInsights: advice.criticalInsights || ["Avoid discretionary small leaks.", "Boost MoMo storage buffer."],
        riskyIndicators: advice.riskyIndicators || ["Higher entertainment spending logged than allocated."],
        budgetMethod: budgetMethod,
        totalSavingsAllocation: stats.totalIncome - stats.totalExpenses > 0 ? stats.totalIncome - stats.totalExpenses : 0
      };

      setDraftResult(draft);
    } catch (err) {
      console.warn("Fallback to deterministic local analyzer:", err);
      // Construct a very sophisticated deterministic fallback structure
      let computedScore = 65;
      const insights = [];
      const risks = [];

      const profit = stats.totalIncome - stats.totalExpenses;
      const ratio = stats.totalIncome > 0 ? (stats.totalExpenses / stats.totalIncome) : 1;

      if (ratio < 0.4) {
        computedScore += 25;
        insights.push("Superior surplus balance! Saved more than 60% of absolute month inflows.");
      } else if (ratio < 0.7) {
        computedScore += 15;
        insights.push("Steady cashflow control. Good alignment with behavioral budgeting goals.");
      } else {
        computedScore -= 10;
        insights.push("Heavy cash drainage. Over 75% of incoming wages were consumed before locking down targets.");
        risks.push("Narrow emergency buffers. High risk of reliance on loans or MoMo overdrafts.");
      }

      if (stats.topExpenseCategory !== 'None/Default') {
        insights.push(`Your top expense drawer was "${stats.topExpenseCategory}", demanding critical attention next month.`);
      }

      if (goals.length > 0) {
        insights.push(`Your active investment capsule list (${goals.length} target pots) remain funded from multi-wallet balances.`);
      }

      if (debts.some(d => d.balanceRemaining > 0)) {
        computedScore -= 5;
        risks.push("Active debt obligations require structured payment schemes to avoid penalty margins.");
      }

      const generatedSummary = `Summary for ${formatMonthLabel(selectedMonth)}: Throughout this month, GHS ${stats.totalIncome.toLocaleString()} was logged as income against GHS ${stats.totalExpenses.toLocaleString()} total expenses. This maintained a net monthly savings rate of ${stats.savingsRate}%. By utilizing the ${budgetMethod} configuration, your funds are active, but optimizing ${stats.topExpenseCategory || 'Miscellaneous'} spend offers strong support to accelerate goal achievements.`;

      const draft: MonthlyReport = {
        id: `re-${Date.now()}`,
        month: selectedMonth,
        createdAt: new Date().toISOString(),
        totalIncome: stats.totalIncome,
        totalExpenses: stats.totalExpenses,
        savingsRate: stats.savingsRate,
        topExpenseCategory: stats.topExpenseCategory,
        categoryBreakdown: stats.categoryBreakdown,
        aiSummary: generatedSummary,
        score: Math.max(10, Math.min(100, computedScore)),
        criticalInsights: insights.length > 0 ? insights : ["Track daily transactions diligently with AI categorization."],
        riskyIndicators: risks.length > 0 ? risks : ["Discretionary spending needs closer checks."],
        budgetMethod: budgetMethod,
        totalSavingsAllocation: profit > 0 ? profit : 0
      };

      setDraftResult(draft);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSaveReport = () => {
    if (!draftResult) return;

    // Check if a report for this month already exists, and overwrite it or confirm
    const filtered = savedReports.filter(r => r.month !== draftResult.month);
    const updated = [draftResult, ...filtered];
    
    setSavedReports(updated);
    localStorage.setItem('fincoach_monthly_reports', JSON.stringify(updated));
    setDraftResult(null);
    setActiveReport(draftResult); // Open it directly for reading
  };

  const handleDeleteReport = (reportId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!confirm("Are you sure you want to drop this archived report?")) return;

    const filtered = savedReports.filter(r => r.id !== reportId);
    setSavedReports(filtered);
    localStorage.setItem('fincoach_monthly_reports', JSON.stringify(filtered));
    if (activeReport?.id === reportId) {
      setActiveReport(null);
    }
  };

  return (
    <div className="space-y-6" id="monthly-reporter-container">
      {activeReport ? (
        // Detailed Report Reading view
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <button
              onClick={() => setActiveReport(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg w-fit"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Reports</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-50 border border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Statement</span>
              </button>
              
              <button
                onClick={(e) => {
                  handleDeleteReport(activeReport.id, e);
                  setActiveReport(null);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 dark:border-rose-900 hover:border-transparent px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Printable Report Inner Area */}
          <div className="space-y-8 print:p-6" id="printable-report-area">
            <div className="text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-dashed border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-black text-indigo-500 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded uppercase tracking-widest block w-fit mx-auto sm:mx-0 mb-2">
                  FinCoach Active Ledger Document
                </span>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white my-0">
                  {formatMonthLabel(activeReport.month)}
                </h1>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  Drafted on {new Date(activeReport.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })} at {new Date(activeReport.createdAt).toLocaleTimeString()}
                </p>
              </div>

              {/* score circle */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
                <div className="relative flex items-center justify-center">
                  <svg className="w-16 h-16 transform -rotate-95">
                    <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="6" />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="transparent"
                      stroke="currentColor"
                      className="text-emerald-500"
                      strokeWidth="6"
                      strokeDasharray={175}
                      strokeDashoffset={175 - (175 * activeReport.score) / 100}
                    />
                  </svg>
                  <span className="absolute text-sm font-black text-slate-900 dark:text-white">{activeReport.score}</span>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Health Index</div>
                  <div className="text-xs font-black text-emerald-500">
                    {activeReport.score >= 80 ? 'EXCELLENT' : activeReport.score >= 60 ? 'HEALTHY' : 'VULNERABLE'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-5 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Net Earned (Inflow)</span>
                <span className="text-xl font-black text-slate-900 dark:text-white block mt-1 font-sans">
                  GHS {activeReport.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Logged Credits</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-5 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Net Spent (Outflow)</span>
                <span className="text-xl font-black text-slate-900 dark:text-white block mt-1 font-sans text-rose-500">
                  GHS {activeReport.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-rose-500 font-bold mt-1">
                  <TrendingDown className="w-3 h-3" />
                  <span>Logged Debits</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-5 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Savings Retention</span>
                <span className="text-xl font-black text-slate-900 dark:text-white block mt-1 font-sans">
                  GHS {(activeReport.totalIncome - activeReport.totalExpenses).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-indigo-500 font-bold block mt-1">
                  Rate: {activeReport.savingsRate}%
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-5 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Wastage Center</span>
                <span className="text-lg font-black text-slate-900 dark:text-white block mt-1 font-sans truncate">
                  {activeReport.topExpenseCategory}
                </span>
                <span className="text-[10px] text-amber-500 font-bold block mt-1">
                  Highest volume load
                </span>
              </div>
            </div>

            {/* AI Narrative Section */}
            <div className="bg-[#f0f4ff] dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 p-6 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h3 className="text-sm font-black my-0 uppercase tracking-wider font-sans text-indigo-500 dark:text-indigo-400">
                  FinCoach Professional Analysis
                </h3>
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-350 leading-relaxed font-normal">
                {activeReport.aiSummary}
              </p>
            </div>

            {/* Splitted Insights and Risks Drawer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-5 rounded-2xl space-y-3">
                <h4 className="text-xs uppercase font-extrabold text-emerald-500 tracking-wider flex items-center gap-1.5 mt-0 mb-2">
                  <Check className="w-4 h-4" />
                  <span>Success Milestones & Streaks</span>
                </h4>
                {activeReport.criticalInsights.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No achievements log captured.</p>
                ) : (
                  <ul className="space-y-2 pl-0 list-none my-0">
                    {activeReport.criticalInsights.map((insight, index) => (
                      <li key={index} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-500 text-xs mt-0.5">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-5 rounded-2xl space-y-3">
                <h4 className="text-xs uppercase font-extrabold text-amber-500 tracking-wider flex items-center gap-1.5 mt-0 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Identified Risk Dangers</span>
                </h4>
                {activeReport.riskyIndicators.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Excellent! Zero risk patterns identified.</p>
                ) : (
                  <ul className="space-y-2 pl-0 list-none my-0">
                    {activeReport.riskyIndicators.map((risk, index) => (
                      <li key={index} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <span className="text-amber-500 text-xs mt-0.5">⚠️</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Custom categories expenditure distribution list */}
            <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs uppercase font-extrabold text-slate-500 tracking-widest my-0">
                Month Category Breakdown list
              </h4>
              <div className="space-y-2">
                {Object.keys(activeReport.categoryBreakdown).length === 0 ? (
                  <p className="text-xs text-slate-400 italic font-mono text-center py-4">No expense entries found for this segment.</p>
                ) : (
                  Object.keys(activeReport.categoryBreakdown).map(cat => {
                    const info = activeReport.categoryBreakdown[cat];
                    const percent = activeReport.totalExpenses > 0 
                      ? Math.round((info.spent / activeReport.totalExpenses) * 100) 
                      : 0;

                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-800 dark:text-slate-300">{cat} ({info.count} entries)</span>
                          <span className="text-slate-900 dark:text-white font-black">
                            GHS {info.spent.toLocaleString()} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Itemized Transaction Statement Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 bg-white dark:bg-slate-900 shadow-lg relative print:shadow-none print:border-none">
              {/* Official Document Stamp Watermark */}
              <div className="absolute top-6 right-8 opacity-10 print:opacity-30 pointer-events-none hidden sm:block">
                <div className="border-4 border-indigo-600 text-indigo-600 font-black text-xs uppercase tracking-widest px-4 py-2 rotate-12 rounded-xl">
                  FinCoach Verified Ledger
                </div>
              </div>

              {/* Statement Corporate-styled Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-100 dark:border-slate-805 pb-5">
                <div className="space-y-1">
                  <span className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase font-mono">
                    OFFICIAL CORRESPONDENCE / ACCOUNT STATEMENT
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white font-sans mt-0.5">
                    Certified Transaction Ledger Statement
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-500 pt-1 font-medium">
                    <div>
                      <span className="text-slate-400">Account Owner:</span> <strong className="text-slate-750 dark:text-slate-300">Enoch Ohene Darko</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Statement UID:</span> <strong className="text-slate-750 dark:text-slate-300 font-mono">LGR-{activeReport.month}-894C</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Statement Period:</span> <strong className="text-slate-755 dark:text-slate-250">{formatMonthLabel(activeReport.month)} Cycle</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Official Currency:</span> <strong className="text-slate-800 dark:text-white">Ghanaian Cedi (GHS)</strong>
                    </div>
                  </div>
                </div>

                {/* Exporter Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 print:hidden self-start sm:self-center">
                  <button
                    onClick={() => {
                      // Custom CSV generation logic
                      const filteredTxs = transactions
                        .filter(t => t.date && t.date.startsWith(activeReport.month))
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                      
                      const headers = ["Date", "Type", "Category", "Memo/Note", "Source Wallet", "Destination Wallet", "Amount (GHS)"];
                      const rows = filteredTxs.map(t => [
                        t.date,
                        t.type,
                        t.category,
                        t.note || '',
                        t.walletSource || '',
                        t.walletDest || '',
                        t.amount
                      ]);
                      
                      const csvContent = "data:text/csv;charset=utf-8," 
                        + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
                      
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", `FinCoach_Statement_${activeReport.month}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-indigo-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                    title="Export Ledger in CSV format for Microsoft Excel"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Excel CSV</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md whitespace-nowrap"
                    title="Open document view and printer dialog"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Ledger</span>
                  </button>
                </div>
              </div>

              {/* Balance Summary Ledger Overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-950 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-850">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Beginning Balance</span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-350 block mt-0.5 font-mono">
                    GHS 0.00
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Starting reference</p>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-emerald-500 block tracking-wider">Total Credit Deposits</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block mt-0.5 font-mono">
                    +GHS {activeReport.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">
                    {transactions.filter(t => t.date && t.date.startsWith(activeReport.month) && t.type === 'income').length} credit entries
                  </p>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-rose-500 block tracking-wider">Total Debit Settled</span>
                  <span className="text-sm font-black text-rose-600 dark:text-rose-455 block mt-0.5 font-mono">
                    -GHS {activeReport.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <p className="text-[10px] text-slate-505 font-semibold mt-1">
                    {transactions.filter(t => t.date && t.date.startsWith(activeReport.month) && t.type === 'expense').length} debit entries
                  </p>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-indigo-500 block tracking-wider">Statement Ending Balance</span>
                  <span className="text-sm font-black text-indigo-650 dark:text-indigo-400 block mt-0.5 font-mono">
                    GHS {(activeReport.totalIncome - activeReport.totalExpenses).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Current unspent surplus balance</p>
                </div>
              </div>
              
              {/* Itemized Transaction list table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider my-0">
                    Settled Entries Transaction Log Ledger
                  </h4>
                  <span className="text-[10px] font-semibold text-slate-400 font-mono">
                    Showing {transactions.filter(t => t.date && t.date.startsWith(activeReport.month)).length} ledger items
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-850 text-[10px] uppercase font-bold text-slate-400">
                        <th className="py-3 px-2">Settle Date</th>
                        <th className="py-3 px-2">Type</th>
                        <th className="py-3 px-2">Memo/Note Descriptor</th>
                        <th className="py-3 px-2">Category</th>
                        <th className="py-3 px-2">Wallet Channel Route</th>
                        <th className="py-3 px-2 text-right">Settled Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.filter(t => t.date && t.date.startsWith(activeReport.month)).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400 italic">No formal entry logs settled in this account state during the cycle.</td>
                        </tr>
                      ) : (
                        transactions
                          .filter(t => t.date && t.date.startsWith(activeReport.month))
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((t, index) => {
                            const isInc = t.type === 'income';
                            const isExp = t.type === 'expense';
                            const indexStr = String(index + 1).padStart(2, '0');
                            return (
                              <tr key={t.id} className="border-b border-slate-100 dark:border-slate-850/40 hover:bg-slate-50/50 dark:hover:bg-slate-850/10 transition-colors">
                                <td className="py-3.5 px-2 font-mono font-bold text-slate-500 shrink-0 whitespace-nowrap">
                                  <span className="text-[10px] text-slate-300 mr-2 font-mono">{indexStr}</span>
                                  {t.date}
                                </td>
                                <td className="py-3.5 px-2">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                    isInc 
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                      : isExp 
                                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-455' 
                                        : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                  }`}>
                                    {t.type}
                                  </span>
                                </td>
                                <td className="py-3.5 px-2">
                                  <span className="font-bold text-slate-850 dark:text-white block">{t.note || 'Unspecified Transfer Memo'}</span>
                                </td>
                                <td className="py-3.5 px-2">
                                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-full font-bold">
                                    {t.category}
                                  </span>
                                </td>
                                <td className="py-3.5 px-2 font-bold font-mono text-[10px] uppercase">
                                  {isInc ? (
                                    <span className="text-emerald-600 dark:text-emerald-400">➔ {t.walletDest || 'main'}</span>
                                  ) : isExp ? (
                                    <span className="text-amber-600">{t.walletSource || 'main'} ➔ Out</span>
                                  ) : (
                                    <span className="text-slate-500">{t.walletSource || 'main'} ➔ {t.walletDest || 'main'}</span>
                                  )}
                                </td>
                                <td className={`py-3.5 px-2 text-right font-black font-mono text-xs ${
                                  isInc ? 'text-emerald-600 dark:text-emerald-400' : isExp ? 'text-rose-600 dark:text-rose-455' : 'text-slate-700 dark:text-slate-300'
                                }`}>
                                  {isInc ? '+' : isExp ? '-' : ''}GHS {t.amount.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-805 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-400 font-semibold font-mono">
                  <span>Authorized Digital Auditor: FinCoach Autonomous Compliance System</span>
                  <span>Digitally Audited on: {new Date(activeReport.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Standard Grid with Draft builder and saved archives
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Draft Report Settings Column */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <h3 className="text-sm font-black tracking-tight text-slate-900 dark:text-white my-0 font-sans">
                  Monthly Statement Drafter
                </h3>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Archive precise diagnostic reports, scoring markers, and cash flow retention notes for your history logs.
              </p>

              {/* Month Selector dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select Calendar Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    setDraftResult(null);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-2.5 text-xs text-slate-900 dark:text-slate-100 font-bold rounded-xl focus:border-indigo-500 focus:outline-none"
                >
                  {getSuggestedMonths().map(m => (
                    <option key={m} value={m}>
                      {formatMonthLabel(m)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Month Quick view indicators before draft */}
              <div className="border border-dashed border-slate-200 dark:border-slate-800 p-3.5 rounded-xl space-y-2 bg-slate-50/50 dark:bg-slate-950/20">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Unarchived Log Indicators</div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-center">
                    <span className="text-[9px] text-slate-400 block uppercase">In</span>
                    <span className="text-xs font-black text-emerald-500">
                      +{calculateMonthStats(selectedMonth).totalIncome.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-slate-400 block uppercase">Out</span>
                    <span className="text-xs font-black text-rose-500">
                      -{calculateMonthStats(selectedMonth).totalExpenses.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-slate-400 block uppercase">Save</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {calculateMonthStats(selectedMonth).savingsRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Action trigger button */}
              <button
                onClick={handleDraftReport}
                disabled={isDrafting}
                className="w-full py-3 px-4 flex items-center justify-center gap-2 text-xs font-bold text-white bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 disabled:opacity-40 rounded-xl transition-all cursor-pointer shadow-md active:scale-95 text-center"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isDrafting ? 'Extracting Records & Drafting...' : '✨ Draft Monthly Report'}</span>
              </button>
            </div>

            {/* Ready draft block */}
            {draftResult && (
              <div className="bg-slate-50 dark:bg-slate-950 border border-emerald-500/20 rounded-3xl p-5 space-y-4 shadow-lg animate-fade-in relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                    Draft Prepared Ready
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">Score: {draftResult.score}/100</span>
                </div>

                <div className="text-xs text-slate-700 dark:text-slate-350 line-clamp-4 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {draftResult.aiSummary}
                </div>

                <button
                  onClick={handleSaveReport}
                  className="w-full py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Lock & Store to Archive</span>
                </button>
              </div>
            )}
          </div>

          {/* Historical statements log feed list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-150 dark:border-slate-800">
              <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white my-0 font-sans">
                Archived Reports Drawer
              </h3>
              <span className="text-xs bg-slate-100 dark:bg-slate-850 text-slate-650 font-mono font-bold px-2.5 py-1 rounded-full">
                {savedReports.length} stored reports
              </span>
            </div>

            {savedReports.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white my-0">No archived monthly reports yet</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    Select a calendar month on the left panel, and click "Draft Monthly Report" to trigger calculations and archive your summaries permanently.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedReports.map(report => (
                  <div
                    key={report.id}
                    onClick={() => setActiveReport(report)}
                    className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 p-5 rounded-3xl shadow-sm transition-all cursor-pointer relative group-all group overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-850">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white my-0 leading-tight">
                          {formatMonthLabel(report.month)}
                        </h4>
                        <span className="text-[9px] text-slate-400 font-mono block mt-1">
                          Created {new Date(report.createdAt).toLocaleDateString(undefined, { dateStyle: 'short' })}
                        </span>
                      </div>
                      <span className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-400 font-black flex items-center justify-center text-xs border border-indigo-500/20">
                        {report.score}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Inflows</span>
                        <span className="text-xs font-black text-emerald-500">
                          +{report.totalIncome.toLocaleString()} GHS
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Outflows</span>
                        <span className="text-xs font-black text-rose-500">
                          -{report.totalExpenses.toLocaleString()} GHS
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-[10px]">
                      <span className="text-indigo-400 font-extrabold uppercase tracking-widest group-hover:underline">
                        Read Statement →
                      </span>
                      <button
                        onClick={(e) => handleDeleteReport(report.id, e)}
                        className="p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
