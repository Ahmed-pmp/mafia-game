import React from 'react';
import { submitVoteDecision } from '../../lib/roomService';

export default function VoteDecisionView({ room, me, roomCode, L, isRTL, now }) {
  const players = room.players ? Object.values(room.players) : [];
  const aliveCount = players.filter(p => p.alive).length;
  const decisions = room.voteDecisions || {};
  const myDecision = decisions[me.id];
  const timer = room.timerEndsAt ? Math.max(0, Math.ceil((room.timerEndsAt - now) / 1000)) : 0;
  
  const handleVote = (decision) => {
    if (myDecision) return;
    submitVoteDecision(roomCode, me.id, decision);
  };
  
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-b from-[#0a0612] via-[#1a0a2e] to-black flex flex-col items-center justify-center p-6" style={{ fontFamily: isRTL ? "'Amiri', serif" : "'Cormorant Garamond', serif" }}>
      <div className="max-w-md w-full text-center">
        <p className="text-white/60 mb-2">{me.name}</p>
        <h2 className="text-4xl text-white mb-3 font-light tracking-wide">{L.voteDecision}</h2>
        <div className={`text-5xl font-thin mb-8 tracking-wider ${timer <= 3 ? 'text-red-400 animate-pulse' : 'text-amber-200'}`}>
          {timer}
        </div>
        
        {!me.alive ? (
          <div className="py-8 text-white/40 italic">{L.observer}</div>
        ) : myDecision ? (
          <div className="py-8 text-white/60">
            <p className="mb-2">{isRTL ? 'صوّتت' : 'You voted'}: <span className="text-white font-bold">{myDecision === 'yes' ? L.yes : L.no}</span></p>
            <p className="text-sm italic">{L.waitForOthers}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleVote('yes')} className="py-8 bg-gradient-to-b from-emerald-800 to-emerald-950 border border-emerald-500/40 rounded-lg text-white text-2xl hover:from-emerald-700 transition-all">
              {L.yes}
            </button>
            <button onClick={() => handleVote('no')} className="py-8 bg-gradient-to-b from-red-900 to-red-950 border border-red-500/40 rounded-lg text-white text-2xl hover:from-red-800 transition-all">
              {L.no}
            </button>
          </div>
        )}
        
        <p className="text-white/40 text-sm mt-8 italic">
          {Object.keys(decisions).length} / {aliveCount} voted
        </p>
      </div>
    </div>
  );
}
