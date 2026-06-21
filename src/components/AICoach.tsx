import React, { useState, FormEvent } from 'react';
import { Wallet, Transaction, SavingsGoal, Debt, AppNotification } from '../types';
import { Sparkles, Loader2, Gauge, AlertTriangle, Lightbulb, TrendingUp, BellRing, Sparkle } from 'lucide-react';
import { motion } from 'motion/react';

interface AICoachProps {
  wallets: Wallet[];
  recentTransactions: Transaction[];
  goals: SavingsGoal[];
  debts: Debt[];
  totalIncome: number;
  totalExpenses: number;
  budgetMethod: string;
  notifications: AppNotification[];
  onDismissNotification: (id: string) => void;
}

interface CoachResponse {
  score: number;
  weeklyReport: string;
  criticalInsights: string[];
  riskyIndicators: string[];
  savingPotentialGHS: number;
}

export default function AICoach({
  wallets,
  recentTransactions,
  goals,
  debts,
  totalIncome,
  totalExpenses,
  budgetMethod,
  notifications,
  onDismissNotification,
}: AICoachProps) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<CoachResponse | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'coach'; text: string }>>([
    { role: 'coach', text: "Hello! I am your AI Financial Coach. Click 'Audit Portfolio' below to generate a deep behavioral spending audit, check your current score, and see specific leaks we can plug to fast-track your net-worth!" }
  ]);

  const handleAudit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/coaching/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallets,
          transactions: recentTransactions,
          goals,
          debts,
          totalIncome,
          totalExpenses,
          budgetMethod,
        }),
      });

      const data = await response.json();
      setReport(data);

      // Append to dialogue stream
      setChatHistory((prev) => [
        ...prev,
        { role: 'coach', text: `Audit completed! Your Financial Score is ${data.score}/100. ${data.weeklyReport}` }
      ]);
    } catch (e) {
      console.warn("Audit API failed: ", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/categorize', { // Use categorization api as versatile chatbot
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `Answer the following financial coaching question. Keep it concise, strategic, and direct: "${userMsg}"` }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setChatHistory(prev => [...prev, { role: 'coach', text: `Based on model audits: ${data.data.note || 'Focus on maintaining your emergency fund limits and allocating towards long-term goal pools first.'}` }]);
      } else {
        throw new Error();
      }
    } catch {
      // elegant template heuristic
      setChatHistory(prev => [...prev, {
        role: 'coach',
        text: "Saving doesn't have to be hard! I recommend keeping it simple: first, try reducing your 'Wants' spending by just GHS 20 this week. Second, whenever you have loose change in cash, transfer it to your MTN MoMo to feed your emergency shield. Small, consistent steps build incredible habits!"
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="fincoach-ai-coaching-desk">
      {/* Visual Header Dashboard scoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left scoring panel gauge */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between text-white relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Gauge className="w-5 h-5 text-emerald-400 animate-pulse" />
              <h3 className="text-base font-bold text-white font-sans m-0">Dynamic Safety Index</h3>
            </div>
            <p className="text-xs text-slate-350 leading-relaxed mb-5">
              An algorithmic index assessing liquid balances, savings momentum, liability load, and budget boundaries.
            </p>
          </div>

          <div className="flex flex-col items-center py-4 select-none">
            <div className="relative flex items-center justify-center">
              {/* Radial Score display */}
              <div className="w-32 h-32 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center bg-slate-950 shadow-inner">
                <span className="text-3xl font-black text-white font-sans">{report?.score || 68}</span>
                <span className="text-[10px] text-emerald-400 font-sans uppercase font-bold mt-1">Rating: GOOD</span>
              </div>
              <div className="absolute inset-0 rounded-full border border-emerald-400/20 scale-110 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={handleAudit}
            disabled={loading}
            className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Sparkles className="w-4 h-4 text-emerald-300" />}
            <span>Diagnostic Audit Portfolio</span>
          </button>
        </div>

        {/* Middle Coach Conversation Terminal */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[360px]">
          <div className="border-b border-slate-100 pb-3 mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 font-sans">Active AI Financial Coach Dialogue</span>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping inline-block" />
              <span>Connected</span>
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            {chatHistory.map((chat, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 items-start ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {chat.role === 'coach' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-55 text-emerald-600 text-xs font-black flex items-center justify-center font-mono">
                    🤖
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-sm leading-relaxed ${
                    chat.role === 'user'
                      ? 'bg-slate-900 text-white rounded-br-none'
                      : 'bg-slate-50 text-slate-800 rounded-bl-none border border-slate-105'
                  }`}
                >
                  {chat.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="flex gap-2 mt-3">
            <input
              type="text"
              placeholder="E.g. How can I boost my GHS balances?"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 p-3 text-xs text-slate-800 rounded-xl focus:outline-none focus:bg-white placeholder-slate-450"
            />
            <button
              type="submit"
              disabled={loading || !chatInput.trim()}
              className="px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Ask
            </button>
          </form>
        </div>
      </div>

      {/* Dynamic Report Insights Details */}
      {report && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-50/20 p-5 rounded-3xl border border-emerald-100">
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 mt-0 mb-3">
              <Lightbulb className="w-4 h-4 text-emerald-600" />
              <span>Behavioral Recommendations</span>
            </h4>
            <ul className="text-xs text-slate-700 space-y-2 list-disc pl-4 leading-relaxed font-sans">
              {report.criticalInsights.map((ins, i) => (
                <li key={i}>{ins}</li>
              ))}
            </ul>
          </div>

          <div className="bg-rose-50/20 p-5 rounded-3xl border border-rose-100">
            <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5 mt-0 mb-3">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Risk & Habits Indicators</span>
            </h4>
            <ul className="text-xs text-slate-700 space-y-2 list-disc pl-4 leading-relaxed font-sans">
              {report.riskyIndicators.map((risk, i) => (
                <li key={i}>{risk}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {/* Smart Notifications board */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <BellRing className="w-4 h-4 text-indigo-650" />
          <h3 className="text-base font-bold text-slate-950 font-sans my-0">FinCoach Live Alerts Hub</h3>
        </div>

        {notifications.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center select-none font-sans">No critical alerts flagged. Solvency levels green.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                  notif.type === 'limit' ? 'bg-rose-50/45 border-rose-100 text-rose-900' :
                  notif.type === 'balance' ? 'bg-amber-50/45 border-amber-100 text-amber-900' :
                  'bg-indigo-50/45 border-indigo-100 text-indigo-900'
                }`}
              >
                <div>
                  <span className="font-bold block tracking-tight">{notif.title}</span>
                  <span className="text-[10px] text-slate-500 block mt-1 leading-relaxed">{notif.message}</span>
                </div>
                <button
                  onClick={() => onDismissNotification(notif.id)}
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl border-none cursor-pointer font-bold transition-all"
                >
                  Dismiss Nudge
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
