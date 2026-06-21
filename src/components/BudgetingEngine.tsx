import { useState } from 'react';
import { BudgetMethod, BudgetAllocation, Category } from '../types';
import { Sliders, Check, ShieldCheck, DollarSign, Bookmark, ArrowRight, Settings, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface BudgetingEngineProps {
  method: BudgetMethod;
  totalIncome: number;
  allocations: BudgetAllocation[];
  onChangeMethod: (m: BudgetMethod) => void;
  onUpdateAllocated: (category: string, amount: number) => void;
  customPercentages?: Record<string, number>;
  onUpdateCustomPercentages?: (p: Record<string, number>) => void;
  categories: Category[];
  onAddCategory?: (name: string, emoji: string, type: 'expense' | 'income') => void;
  onDeleteCategory?: (id: string) => void;
}

export default function BudgetingEngine({
  method,
  totalIncome,
  allocations,
  onChangeMethod,
  onUpdateAllocated,
  customPercentages = { Needs: 50, Wants: 30, Savings: 20 },
  onUpdateCustomPercentages,
  categories,
  onAddCategory,
  onDeleteCategory,
}: BudgetingEngineProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempAmount, setTempAmount] = useState<string>('');
  const [showBudgetTutorial, setShowBudgetTutorial] = useState<boolean>(true);

  // Priority order for Essential Expense Allocation Engine
  const priorityList = [
    { name: 'Rent & Housing', priority: 1, desc: 'Primary survival asset shelter' },
    { name: 'Utilities', priority: 2, desc: 'Water, ECG Power grids & core bundles' },
    { name: 'Food & Dining', priority: 3, desc: 'Basic raw groceries & nutritional fuel' },
    { name: 'Transportation', priority: 4, desc: 'Commute and transit fees' },
    { name: 'Healthcare', priority: 5, desc: 'Therapy, pharmacy, and medical risk controls' },
    { name: 'Debt Repayment', priority: 6, desc: 'Amortization payloads and credit facilities' },
    { name: 'Emergency Fund', priority: 7, desc: 'Liquidity buffer protecting 6 months safety' },
    { name: 'Savings & Investments', priority: 8, desc: 'Asset compound reserves and share accounts' },
    { name: 'Entertainment', priority: 9, desc: 'Lifestyle, movies, and late-night drinks' },
    { name: 'Miscellaneous', priority: 10, desc: 'Ancillary and transactional safety nets' },
  ];

  // Helper values based on method selection
  const getRuleAllocations = () => {
    if (method === '50/30/20') {
      return {
        Needs: totalIncome * 0.5,
        Wants: totalIncome * 0.3,
        Savings: totalIncome * 0.2,
      };
    } else if (method === '70/20/10') {
      return {
        Needs: totalIncome * 0.7,
        Wants: totalIncome * 0.2, // Wants map closer, wait: "70 Living, 20 Savings, 10 Investments"
        Savings: totalIncome * 0.3, // combine savings & investments
      };
    } else if (method === 'custom') {
      return {
        Needs: totalIncome * ((customPercentages.Needs || 50) / 100),
        Wants: totalIncome * ((customPercentages.Wants || 30) / 100),
        Savings: totalIncome * ((customPercentages.Savings || 20) / 100),
      };
    }
    return null;
  };

  const recommendedAllocations = getRuleAllocations();

  const handleEditClick = (category: string, currentVal: number) => {
    setEditingCategory(category);
    setTempAmount(currentVal.toString());
  };

  const handleSaveClick = (category: string) => {
    const val = parseFloat(tempAmount);
    if (!isNaN(val) && val >= 0) {
      onUpdateAllocated(category, val);
    }
    setEditingCategory(null);
  };

  // Safe percentage updates mapping
  const handleCustomPctChange = (key: 'Needs' | 'Wants' | 'Savings', val: number) => {
    if (onUpdateCustomPercentages) {
      const nextPct = { ...customPercentages, [key]: val };
      // normalize sum to 100 roughly
      onUpdateCustomPercentages(nextPct);
    }
  };

  return (
    <div className="space-y-6" id="fincoach-budget-allocation-module">
      {/* Selector of allocation principles */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-sans mt-0 my-0">Budget Allocation Engine</h3>
            <p className="text-xs text-slate-500 mt-1">Automate or customize target savings rate priorities</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
            {(['manual', '50/30/20', '70/20/10', 'custom'] as BudgetMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => onChangeMethod(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold uppercase transition-all border cursor-pointer ${
                  method === m
                    ? 'bg-slate-900 border-transparent text-white shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-650 border-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {method === 'custom' && onUpdateCustomPercentages && (
          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 animate-fade-in text-xs">
            <div>
              <label className="text-[10px] text-slate-500 font-sans font-bold uppercase block mb-1">Needs Target (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={customPercentages.Needs || 50}
                onChange={(e) => handleCustomPctChange('Needs', parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-slate-250 p-3 text-xs text-slate-900 font-bold rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-sans font-bold uppercase block mb-1">Wants Target (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={customPercentages.Wants || 30}
                onChange={(e) => handleCustomPctChange('Wants', parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-slate-250 p-3 text-xs text-slate-900 font-bold rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-sans font-bold uppercase block mb-1">Savings Target (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={customPercentages.Savings || 20}
                onChange={(e) => handleCustomPctChange('Savings', parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-slate-250 p-3 text-xs text-emerald-600 font-bold rounded-xl focus:border-indigo-550 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Informational nudge summary */}
        {recommendedAllocations && (
          <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-slate-500">Total Monthly Allocation Pool based on income:</span>
              <div className="text-lg font-extrabold text-slate-900 font-sans mt-1">
                GHS {totalIncome.toLocaleString()}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 text-right">
              <div>
                <span className="text-[10px] text-slate-450 block uppercase font-bold">Needs Target</span>
                <span className="text-xs font-bold text-slate-800">GHS {recommendedAllocations.Needs.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-450 block uppercase font-bold">Wants Target</span>
                <span className="text-xs font-bold text-slate-800">GHS {recommendedAllocations.Wants.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-450 block uppercase font-bold text-emerald-600">Savings Target</span>
                <span className="text-xs font-bold text-emerald-600">GHS {recommendedAllocations.Savings.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Toggleable Pocket Lesson */}
        <div className="mt-4 pt-4 border-t border-slate-150">
          <button
            onClick={() => setShowBudgetTutorial(!showBudgetTutorial)}
            className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-805 transition-all cursor-pointer bg-indigo-50/50 px-3.5 py-2 rounded-xl"
          >
            <span>💡 {showBudgetTutorial ? "Hide Beginner Guideline" : "Show Beginner Guideline"}</span>
          </button>
          
          {showBudgetTutorial && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 bg-indigo-50/25 border border-indigo-100/60 p-5 rounded-2xl text-xs text-slate-700 leading-relaxed space-y-3"
            >
              <div className="flex items-center gap-1.5 font-sans font-extrabold text-slate-850">
                <span>📚 Pocket Guide: Needs vs. Wants Breakdown</span>
              </div>
              <p className="my-0">
                Are you confused about what's essential? Standard financial models divide your lifestyle categories so you can cut costs safely when times get tough:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1.5">
                <div className="p-3.5 bg-white border border-indigo-100/40 rounded-xl">
                  <span className="font-bold text-slate-900 block mb-1">✔️ Core Needs (Set high priorities)</span>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500">
                    <li><strong>Rent & Housing:</strong> Hostel setups or home settlement are 100% needs.</li>
                    <li><strong>Utilities:</strong> ECG Prepaid power, core data, bundle water is a survival need.</li>
                    <li><strong>Food & Dining:</strong> Simple market ingredients, basic rice & eggs are needs.</li>
                  </ul>
                </div>
                <div className="p-3.5 bg-white border border-indigo-100/40 rounded-xl">
                  <span className="font-bold text-slate-900 block mb-1">❌ Dynamic Wants (Trimmable options)</span>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500">
                    <li><strong>Entertainment:</strong> Lounges, movie theaters, premium gaming, sports tickets.</li>
                    <li><strong>Food (Extras):</strong> Late-night fast-food deliveries, high-end cafe meals.</li>
                    <li><strong>Comfort:</strong> Ride-hailing taxi loops when simpler commutes are open and safe.</li>
                  </ul>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 italic mt-1.5 my-0">
                💡 <strong>Smart Hack:</strong> Try updating your allocated limits in the left panel. If you find yourself in a tight cash flow spot, shrink your <strong>Wants</strong> allocation down first to unlock immediate capital for emergency buffers!
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left pane: Active Allocated Budget vs Spent */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3 mb-4 font-sans mt-0">Budget Ledger Allocations</h3>

          <div className="space-y-4">
            {allocations.map((alloc) => {
              const isEditing = editingCategory === alloc.category;
              const ratio = alloc.allocated > 0 ? (alloc.spent / alloc.allocated) * 100 : 0;
              const isOverspent = alloc.spent > alloc.allocated && alloc.allocated > 0;

              return (
                <div key={alloc.category} className="p-4 bg-slate-55/65 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900 font-sans">{alloc.category}</span>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                        <span className="text-[11px] text-slate-500 font-sans">{alloc.spent} spent of {alloc.allocated} GHS</span>
                        <span className="hidden sm:inline text-slate-300">•</span>
                        <span className={`text-[11px] font-bold ${isOverspent ? 'text-rose-600 animate-pulse' : (alloc.allocated - alloc.spent) < (alloc.allocated * 0.2) ? 'text-amber-600' : 'text-emerald-600'}`}>
                          GHS {parseFloat((alloc.allocated - alloc.spent).toFixed(2))} Remaining
                        </span>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={tempAmount}
                          onChange={(e) => setTempAmount(e.target.value)}
                          className="w-20 bg-white border border-slate-250 p-1.5 rounded-lg text-xs text-right text-emerald-650 font-bold focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveClick(alloc.category)}
                          className="p-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg hover:bg-emerald-100 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditClick(alloc.category, alloc.allocated)}
                        className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-xl cursor-pointer"
                      >
                        Adjust Limit
                      </button>
                    )}
                  </div>

                  {/* Progressive indicator bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${isOverspent ? 'bg-rose-500' : ratio > 80 ? 'bg-amber-500' : 'bg-indigo-600'}`}
                      style={{ width: `${Math.min(100, ratio)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right pane: Prioritized Essential Allocation Engine (Financial Coach) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-950 font-sans my-0">Essential Allocation Engine</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              Behavioral Finance Rule: Protect survival pools and loan amortizations first. When a monthly deposit enters, distribute resources strictly along the priority queue below before lifestyle limit configurations.
            </p>

            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {priorityList.map((item, idx) => {
                const mappedAlloc = allocations.find(a => a.category.toLowerCase().includes(item.name.toLowerCase().split(' ')[0]));
                const isConfigured = mappedAlloc && mappedAlloc.allocated > 0;
                
                return (
                  <div
                    key={item.priority}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                      isConfigured
                        ? 'bg-emerald-50/45 border-emerald-100 text-slate-900'
                        : 'bg-slate-50/45 border-slate-100 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isConfigured ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {item.priority}
                      </div>
                      <div>
                        <span className="font-bold block tracking-tight">{item.name}</span>
                        <span className="text-[10px] text-slate-400 block leading-none mt-1">{item.desc}</span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      {isConfigured ? (
                        <>
                          <span className="text-[10px] font-sans font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">Allocated GHS {mappedAlloc.allocated}</span>
                          <span className={`text-[10px] font-mono font-bold mt-1 ${mappedAlloc.allocated - mappedAlloc.spent <= 0 ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`}>
                            GHS {parseFloat((mappedAlloc.allocated - mappedAlloc.spent).toFixed(2))} Left
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold">Unfunded</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC CATEGORY MANAGEMENT CENTER */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mt-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-sans my-0">Category Column & Ledger Manager</h3>
            <p className="text-xs text-slate-500 mt-1">Configure, add, or delete your customized spending/income columns</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Expense Categories */}
          <div className="space-y-4">
            <span className="text-xs font-black uppercase text-indigo-650 block">📊 Expense Categories ({categories.filter(c => c.type === 'expense').length})</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-1">
              {categories.filter(c => c.type === 'expense').map(cat => (
                <div key={cat.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-slate-300 transition-all text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base select-none">{cat.emoji}</span>
                    <span className="font-bold text-slate-800">{cat.name}</span>
                  </div>
                  {onDeleteCategory && !['Rent & Housing', 'Utilities', 'Food & Dining', 'Transportation', 'Healthcare', 'Tithes', 'Miscellaneous'].includes(cat.name) && (
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      className="text-rose-550 hover:text-rose-700 p-1 hover:bg-rose-50 rounded-lg cursor-pointer transition-all border-0 bg-transparent flex items-center justify-center"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5 hover:scale-110 active:scale-95 transition-transform" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Income Categories */}
          <div className="space-y-4">
            <span className="text-xs font-black uppercase text-emerald-600 block">💫 Income Categories ({categories.filter(c => c.type === 'income').length})</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-1">
              {categories.filter(c => c.type === 'income').map(cat => (
                <div key={cat.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-slate-300 transition-all text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base select-none">{cat.emoji}</span>
                    <span className="font-bold text-slate-800">{cat.name}</span>
                  </div>
                  {onDeleteCategory && !['Salary & Income', 'Side Hustle & Business', 'Savings & Investments', 'Miscellaneous'].includes(cat.name) && (
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      className="text-rose-550 hover:text-rose-700 p-1 hover:bg-rose-50 rounded-lg cursor-pointer transition-all border-0 bg-transparent flex items-center justify-center"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5 hover:scale-110 active:scale-95 transition-transform" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inline quick creator form in Ledger tab too! */}
        <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50/10 p-4 rounded-2xl border border-slate-100">
          <span className="text-[10px] uppercase font-black text-slate-500 block mb-3">➕ Add Custom Category Column</span>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const name = fd.get('catName') as string;
              const emoji = fd.get('catEmoji') as string;
              const type = fd.get('catType') as 'expense' | 'income';
              if (name && name.trim() && onAddCategory) {
                onAddCategory(name.trim(), emoji || '📝', type);
                e.currentTarget.reset();
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end"
          >
            <div>
              <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1 font-sans">Category Column Name</label>
              <input
                required
                name="catName"
                type="text"
                placeholder="e.g. Back Tithes, Gas, Subscriptions"
                className="w-full bg-white dark:bg-slate-900 border border-slate-205 p-2 text-xs text-slate-900 dark:text-slate-100 rounded-xl focus:border-indigo-550 focus:outline-none shadow-sm"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1 font-sans">Emoji Accent</label>
              <input
                name="catEmoji"
                type="text"
                maxLength={2}
                placeholder="⛪"
                defaultValue="⛪"
                className="w-full bg-white dark:bg-slate-900 border border-slate-205 p-2 text-xs text-slate-900 dark:text-slate-100 text-center rounded-xl focus:border-indigo-550 focus:outline-none shadow-sm"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1 font-sans">Type Classification</label>
              <select
                name="catType"
                className="w-full bg-white dark:bg-slate-900 border border-slate-205 p-2 text-xs text-slate-950 dark:text-slate-100 rounded-xl focus:border-indigo-550 focus:outline-none shadow-sm font-semibold"
              >
                <option value="expense">Expense Column (Budgeted)</option>
                <option value="income">Income Column (Ledger)</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer border-0"
            >
              Append New Column
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
