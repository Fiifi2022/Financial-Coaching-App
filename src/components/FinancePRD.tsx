import { useState } from 'react';
import { FileText, Users, Bookmark, Database, Terminal, Compass, Layout } from 'lucide-react';
import { motion } from 'motion/react';

export default function FinancePRD() {
  const [activeTab, setActiveTab] = useState<'prd' | 'personas' | 'stories' | 'db' | 'api' | 'roadmap'>('prd');

  const tabs = [
    { id: 'prd', label: 'PRD Spec', icon: FileText },
    { id: 'personas', label: 'User Gen & Personas', icon: Users },
    { id: 'stories', label: 'User Stories', icon: Bookmark },
    { id: 'db', label: 'Postgres DB Schema', icon: Database },
    { id: 'api', label: 'REST API Specs', icon: Terminal },
    { id: 'roadmap', label: 'Dev Roadmaps', icon: Compass },
  ] as const;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden" id="prd-documentation-hub">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-5 mb-6">
        <div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">Senior Product & Engineering Hub</span>
          <h2 className="text-xl font-sans font-bold text-slate-900 tracking-tight mt-2 my-0">Fintech Blueprints & Architecture Docs</h2>
        </div>
        <div className="text-xs text-slate-500 font-medium border border-slate-150 bg-slate-50 px-3.5 py-1.5 rounded-xl mt-2 md:mt-0 flex items-center gap-1.5 shadow-sm">
          <Layout className="w-4 h-4 text-emerald-605 animate-pulse" />
          <span>Framer & Tailwind Precision Spec</span>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 border border-slate-100 p-1.5 rounded-2xl mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border border-slate-200 text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-950 border border-transparent hover:bg-slate-100/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-slate-450'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="min-h-[420px]">
        {activeTab === 'prd' && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="bg-slate-50 border border-slate-105 p-6 rounded-2xl">
              <h3 className="text-base font-bold text-slate-950 font-sans mt-0 mb-2">Product Requirements Document (PRD) — FinCoach MVP</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4 font-sans">
                This blueprint governs the development of a next-generation behaviorally-fluent personal finance assistant. Grounded in research by behavioral economists, our objective is to shift personal wealth habits by designing friction points around impulsive behaviors while reducing friction for automated allocations.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                <div className="bg-white p-4 border border-slate-105 rounded-xl shadow-sm">
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1">1. Functional Objectives</h4>
                  <ul className="text-xs text-slate-650 space-y-2 list-disc pl-4 leading-relaxed font-sans">
                    <li><strong>Multi-wallet ledger system</strong> tracking liquid physical Cash, Mobile Money, and formal Bank ledgers seamlessly with non-expense, flow-isolated transfers.</li>
                    <li><strong>Smart Auto-Categorization API</strong> to translate natural language into distinct target allocations.</li>
                    <li><strong>Prioritized Essential Engine</strong> directing flows into housing, utilities, and emergency security before lifestyle categories are touched.</li>
                    <li><strong>Active Financial AI Mentor</strong> conducting behavior audits and computing a 0-100 score.</li>
                  </ul>
                </div>
                <div className="bg-white p-4 border border-slate-105 rounded-xl shadow-sm">
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1">2. Non-Functional Criteria</h4>
                  <ul className="text-xs text-slate-650 space-y-2 list-disc pl-4 leading-relaxed font-sans">
                    <li><strong>Sub-second UI Reactions</strong> using local cache synchronization backed by persistent storage.</li>
                    <li><strong>Secured client structures</strong> using multi-factor client locking (biometric and PIN simulations).</li>
                    <li><strong>Adaptive Accessibility</strong> via modern light/dark contrast standards and fully responsive layout configurations.</li>
                    <li><strong>Highly decoupled schemas</strong> allowing clear separation of ledgers from insights.</li>
                  </ul>
                </div>
              </div>

              <div className="bg-emerald-50/20 border border-emerald-100 rounded-xl p-4 mt-4">
                <h4 className="text-xs font-bold text-emerald-850 font-sans mt-0 mb-1">Behavioral Economics Model</h4>
                <p className="text-xs text-slate-650 leading-relaxed font-sans">
                  The application acts as a nudge engine. By enforcing a prioritized flow (Rent/Food/Health before lifestyle limits can be configured), it prevents the "present bias" where a user discounts future financial security for immediate wants. Dynamic streaks reward savings discipline, aligning dopamine triggers with positive net-worth changes.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'personas' && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-4">
            <div className="bg-slate-50 border border-slate-105 p-6 rounded-2xl">
              <h3 className="text-base font-bold text-slate-950 font-sans mt-0 mb-2">Target Market & User Personas</h3>
              <p className="text-xs text-slate-500 mb-5 font-sans">
                We design for two core user profiles who model distinct spending cultures, financial pressures, and literacy goals.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white p-5 border border-slate-105 rounded-2xl relative shadow-sm">
                  <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded uppercase">Technologist</span>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                    <span className="text-sm font-extrabold text-blue-600">KO</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-0 mb-1">Kofi Osei — "The High-Earning Spender"</h4>
                  <span className="text-[10px] font-bold text-slate-400">Age: 28 • Software Engineer • Accra, Ghana</span>
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed font-sans">
                    <strong>Context:</strong> Kofi earns GHS 8,500 monthly from local contracts and side gigs. Income streams hit his Bank and MoMo ledgers. However, he suffers from "lifestyle creep", ordering expensive delivery meals (waakye, fast food) and entertaining groups.
                  </p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed font-sans">
                    <strong>Core Pain:</strong> Despite high income, Kofi finds himself with under GHS 300 in savings by month-end. He cannot secure a rent deposit or maintain an emergency cushion.
                  </p>
                </div>

                <div className="bg-white p-5 border border-slate-105 rounded-2xl relative shadow-sm">
                  <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded uppercase">Retailer</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                    <span className="text-sm font-extrabold text-emerald-600">AM</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-0 mb-1">Amma Mensah — "The Side Hustler"</h4>
                  <span className="text-[10px] font-bold text-slate-400">Age: 34 • Cosmetics Shop Owner • Kumasi, Ghana</span>
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed font-sans">
                    <strong>Context:</strong> Amma operates mostly in physical cash and MoMo. Her revenue swings dramatically from GHS 2,000 to GHS 6,550 based on retail seasons. She pays school fees for 2 kids and buys inventories weekly.
                  </p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed font-sans">
                    <strong>Core Pain:</strong> Her personal money mixes with her cosmetics shop cash. She struggles to understand her exact profitability and constantly fears utility shutoffs or school fee delays.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'stories' && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-4">
            <div className="bg-slate-50 border border-slate-105 p-6 rounded-2xl">
              <h3 className="text-base font-bold text-slate-950 font-sans mt-0 mb-3">Agile User Stories</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-655 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-150 text-slate-550 font-semibold">
                      <th className="py-2.5">User Role</th>
                      <th className="py-2.5">Requirement (I want to...)</th>
                      <th className="py-2.5">Benefit (So that...)</th>
                      <th className="py-2.5">Acceptance Standards</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    <tr>
                      <td className="py-3.5 pr-2"><span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase">Ghanian Professional</span></td>
                      <td className="py-3 text-slate-700">Distribute money easily across Physical Cash, Bank, and MoMo ledgers.</td>
                      <td className="py-3 text-slate-700">I maintain separate, accurate liquid pools and avoid default leakage.</td>
                      <td className="py-3 text-slate-500">Liquid balance displays instantly update upon adding transfers, isolation tests confirm transfers do not trigger expense reports.</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 pr-2"><span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase">Side Hustle Designer</span></td>
                      <td className="py-3 text-slate-700 font-sans">Type any casual note like "ECG billing GHS 250" or "Bought waakye".</td>
                      <td className="py-3 text-slate-700 font-sans">I do not waste time managing manual taxonomy lists.</td>
                      <td className="py-3 text-slate-500 font-sans">API auto-extracts values and maps them directly to Utilities or Food & Dining categories.</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 pr-2"><span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase">Financial Advisor</span></td>
                      <td className="py-3 text-slate-700 font-sans">Force auto budgeting rules like 50/30/20 or custom percentages.</td>
                      <td className="py-3 text-slate-700 font-sans">Discretionary capital is strictly secondary to long-term deposits.</td>
                      <td className="py-3 text-slate-500 font-sans">The Allocation engine shows step-by-step prioritizing (needs are cleared first, suggestions flag underfunded categories).</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 pr-2"><span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase">Indebted Entrepreneur</span></td>
                      <td className="py-3 text-slate-700 font-sans">Add and track long-term loans and credits with due dates.</td>
                      <td className="py-3 text-slate-700 font-sans">I calculate direct paydowns and clear accounts systematically.</td>
                      <td className="py-3 text-slate-500 font-sans">Debt ratio updating in real-time, due date warnings generate visual flags in notification boards.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'db' && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-4">
            <div className="bg-slate-50 border border-slate-105 p-6 rounded-2xl">
              <h3 className="text-base font-bold text-slate-950 font-sans mt-0 mb-1">PostgreSQL Database Schema Architecture</h3>
              <p className="text-xs text-slate-500 mb-4 font-sans">
                Designed with standard DDL, proper index creation, foreign keys, and constraint checks to ensure referential integrity.
              </p>

              <div className="font-mono text-[11px] bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto border border-slate-800 leading-relaxed max-h-96">
                <pre>{`-- Create standard Wallet enumeration types
CREATE TYPE wallet_platform_type AS ENUM ('cash', 'momo', 'bank');
CREATE TYPE tx_type AS ENUM ('income', 'expense', 'transfer');

-- 1. Create Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    pin_hash VARCHAR(60) NOT NULL, -- bcrypt
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    has_biometrics BOOLEAN DEFAULT FALSE,
    current_points INTEGER DEFAULT 0
);

-- 2. Create Wallets Table
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_type wallet_platform_type NOT NULL,
    provider_name VARCHAR(100) NOT NULL, -- e.g. "MTN MoMo", "GCB Bank"
    balance NUMERIC(15, 2) DEFAULT 0.00 CHECK (balance >= 0.00),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, wallet_type, provider_name)
);

-- 3. Create Transactions Ledger
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type tx_type NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0.00),
    category VARCHAR(100) NOT NULL,
    note TEXT,
    wallet_source_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
    wallet_dest_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_source_exists_for_outflow CHECK (
        (type = 'income') OR (wallet_source_id IS NOT NULL)
    ),
    CONSTRAINT check_dest_exists_for_inflow CHECK (
        (type = 'expense') OR (wallet_dest_id IS NOT NULL)
    )
);

-- Create Indexes for performance
CREATE INDEX idx_transactions_user_timestamp ON transactions(user_id, timestamp DESC);
CREATE INDEX idx_wallets_user ON wallets(user_id);

-- 4. Create Savings Goals Table
CREATE TABLE savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL CHECK (target_amount > 0.00),
    current_amount NUMERIC(15, 2) DEFAULT 0.00,
    target_date DATE NOT NULL,
    monthly_auto_contrib NUMERIC(15, 2) DEFAULT 0.00
);

-- 5. Create Debts Table
CREATE TABLE debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    creditor_name VARCHAR(255) NOT NULL,
    principal_amount NUMERIC(15, 2) NOT NULL_CHECK,
    balance_remaining NUMERIC(15, 2) NOT NULL,
    interest_rate_percent NUMERIC(5, 2) DEFAULT 0.00,
    due_date DATE,
    repayment_plan VARCHAR(255)
);`}</pre>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'api' && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-4">
            <div className="bg-slate-50 border border-slate-105 p-6 rounded-2xl">
              <h3 className="text-base font-bold text-slate-950 font-sans mt-0 mb-3">Enterprise REST API Specification</h3>
              
              <div className="space-y-4">
                <div className="border border-slate-150 rounded-2xl p-4 bg-white font-mono text-xs shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded font-extrabold uppercase text-[10px]">POST</span>
                    <span className="text-slate-900 font-bold flex-1">/api/gemini/categorize</span>
                  </div>
                  <p className="text-slate-505 text-[11px] mb-2 font-sans">
                    Leverages server-side Gemini flash reasoning to extract numerical and logical structures from semantic text notes.
                  </p>
                  <pre className="text-slate-105 bg-slate-900 p-2.5 rounded-xl text-[10px] overflow-x-auto border border-slate-800 leading-relaxed">
{`// REQUEST BODY (application/json)
{
  "text": "Bought waakye for GHS 25 at the stall near circle"
}

// SUCCESS RESPONSE (200 OK)
{
  "category": "Food & Dining",
  "amount": 25.00,
  "confidenceScore": 0.98,
  "note": "Waakye near circle",
  "priorityRank": 3
}`}
                  </pre>
                </div>

                <div className="border border-slate-150 rounded-2xl p-4 bg-white font-mono text-xs shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded font-extrabold uppercase text-[10px]">POST</span>
                    <span className="text-slate-900 font-bold flex-1">/api/coaching/analyze</span>
                  </div>
                  <p className="text-slate-505 text-[11px] mb-2 font-sans">
                    Runs the Financial Coaching AI context scanner inside Express, analyzing balances and historical transactions.
                  </p>
                  <pre className="text-slate-105 bg-slate-900 p-2.5 rounded-xl text-[10px] overflow-x-auto border border-slate-800 leading-relaxed">
{`// REQUEST BODY (application/json)
{
  "wallets": [...],
  "transactions": [...],
  "goals": [...],
  "debts": [...]
}

// SUCCESS RESPONSE (200 OK)
{
  "score": 72,
  "weeklyReport": "You are making steady progress, but transport outpaced allocations by 25%.",
  "criticalInsights": [
    "Your GHS 1,500 emergency fund covers 1.5 months; prioritize reaching 6 months.",
    "Debt payload stands at 35% of total income. Initiate Avalanche repayments target on Fidelity credit first."
  ],
  "riskyIndicators": ["High recurring discretionary food expenses during late-night cycles."],
  "savingPotentialGHS": 450
}`}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'roadmap' && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-4">
            <div className="bg-slate-50 border border-slate-105 p-6 rounded-2xl">
              <h3 className="text-base font-bold text-slate-950 font-sans mt-0 mb-3">Software Development Roadmap & Milestones</h3>

              <div className="relative border-l border-slate-205 pl-6 ml-3 space-y-6">
                <div>
                  <div className="absolute w-3 h-3 bg-emerald-600 rounded-full -left-1.5 border-4 border-slate-200" />
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded">Milestone 1 — Complete MVP Core (CURRENT)</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1 mb-1 font-sans">State Synchronizer & Local Storage Ledgers</h4>
                  <p className="text-xs text-slate-605 leading-relaxed font-sans">
                    Set up triple-walled isolated structure (Cash, Bank, MoMo). Support all types: income, expense, and non-expense transfers. Program prioritized budgeting engine (needs-focus, 50/30/20), interactive graphs, loan schedules, gamified metrics & unlock badges. Connect live, server-side Gemini reasoning to categorize notes and run proactive coach consultations.
                  </p>
                </div>

                <div>
                  <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-1.5 border-4 border-slate-200" />
                  <span className="text-[10px] font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 border border-blue-100 rounded">Milestone 2 — Scaling & Auth (V2 Roadmap)</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1 mb-1 font-sans">Cloud Sync, Real Postgres & Firebase Integration</h4>
                  <p className="text-xs text-slate-605 leading-relaxed font-sans">
                    Provision real live Firebase Authentication with biometric tokens. Move local state storage structures into PostgreSQL managed databases under Cloud SQL. Deploy row-level security policies (RLS) guaranteeing absolute user privacy boundaries.
                  </p>
                </div>

                <div>
                  <div className="absolute w-3 h-3 bg-indigo-650 rounded-full -left-1.5 border-4 border-slate-200" />
                  <span className="text-[10px] font-mono font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 border border-indigo-100 rounded">Milestone 3 — Intelligence Systems (V2 Roadmap)</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1 mb-1 font-sans">OpenAPI Real Plaid Bridges & Telemetry Grids</h4>
                  <p className="text-xs text-slate-605 leading-relaxed font-sans">
                    Build direct, live financial connections (MTN APIs, local banks GCB/Fidelity via Plaid and custom gateways) to automate transaction scraping. Feed neural analytics with deep streaming patterns to predict potential cash shortages up to 30 days in advance. Encourage friendly community savings pools via collaborative joint challenges.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
