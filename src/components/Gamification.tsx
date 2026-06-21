import { useState } from 'react';
import { Achievement, Challenge } from '../types';
import { Award, Flame, Trophy, Coins, Check, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface GamificationProps {
  score: number;
  achievements: Achievement[];
  challenges: Challenge[];
  accruedPoints?: number;
  savingsStreak?: number;
  onCompleteChallenge: (id: string, points: number) => void;
}

export default function Gamification({
  score,
  achievements,
  challenges,
  accruedPoints = 350,
  savingsStreak = 3,
  onCompleteChallenge,
}: GamificationProps) {
  return (
    <div className="space-y-6" id="fincoach-gamified-habits">
      {/* Top statistics banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 p-5 rounded-2xl border border-indigo-500/15 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-indigo-400/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-sans block">Wealth Arena Rank Score</span>
              <span className="text-xl font-sans font-black text-white">{score} / 100</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-tr from-slate-900 to-emerald-950 p-5 rounded-2xl border border-emerald-500/15 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-emerald-400/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Flame className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-sans block">Monthly Savings Streak</span>
              <span className="text-xl font-sans font-black text-white">{savingsStreak} Months</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-tr from-slate-900 to-amber-950 p-5 rounded-2xl border border-amber-500/15 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-amber-400/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-sans block">Malt Points Ledger Balance</span>
              <span className="text-xl font-sans font-black text-white">{accruedPoints} QP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Challenges */}
        <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-5">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
            <h3 className="text-sm font-bold text-white font-sans mt-0">Monthly Savings Challenges</h3>
            <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase">Active quests</span>
          </div>

          <div className="space-y-3">
            {challenges.map((item) => {
              const ratio = item.target > 0 ? (item.progress / item.target) * 100 : 0;
              return (
                <div key={item.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-850">
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <div>
                      <span className="font-bold text-white block">{item.name}</span>
                      <p className="text-[10px] text-slate-400 m-0 mt-0.5">{item.description}</p>
                    </div>

                    <div className="text-right">
                      {item.completed ? (
                        <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/20 rounded-full uppercase">Acquired</span>
                      ) : (
                        <button
                          onClick={() => onCompleteChallenge(item.id, item.rewardPoints)}
                          className="py-1 px-2 text-[9px] font-mono font-black text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 hover:text-white transition-all cursor-pointer uppercase"
                        >
                          +{item.rewardPoints} points
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900 mb-2">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.min(100, ratio)}%` }} />
                  </div>

                  <span className="text-[9px] font-mono text-slate-500 uppercase block text-right">Progress: {item.progress} / {item.target} {item.unit}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestones & Badges unlocked */}
        <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-5">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
            <h3 className="text-sm font-bold text-white font-sans mt-0">Aspirational Badges & Milestones</h3>
            <span className="text-[10px] text-slate-500 font-mono">Unlock metrics based on networth scores</span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 max-h-[300px] overflow-y-auto pr-1">
            {achievements.map((item) => (
              <div
                key={item.id}
                className={`p-3 border rounded-xl flex items-center gap-3 transition-all ${
                  item.unlocked
                    ? 'bg-slate-950/40 border-slate-850 text-slate-200'
                    : 'bg-slate-950/10 border-slate-900/60 text-slate-550 opacity-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                  item.unlocked ? 'bg-indigo-500/10 text-indigo-300' : 'bg-slate-900 text-slate-600'
                }`}>
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block">{item.name}</span>
                  <span className="text-[9px] text-slate-500 block leading-tight mt-0.5">{item.description}</span>
                  {item.unlocked && (
                    <span className="text-[8px] font-mono text-emerald-400 block mt-1 uppercase tracking-wider font-semibold">Unlocked!</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
