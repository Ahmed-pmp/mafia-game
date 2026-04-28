import React from 'react';
import { submitVote } from '../../lib/roomService';
import { getShuffledList } from '../../lib/gameLogic';

export default function VotingView({ room, me, roomCode, L, isRTL, now }) {
  const players = room.players ? Object.values(room.players) : [];
  const aliveCount = players.filter(p => p.alive).length;
  const votes = room.votes || {};
  const myVote = votes[me.id];
  const timer = room.timerEndsAt ? Math.max(0, Math.ceil((room.timerEndsAt - now) / 1000)) : 0;
  
  const seed = (parseInt(me.id.replace(/\D/g, '').slice(-4) || '0') + 1) * 1000 + (room.round || 1);
  const targets = getShuffledList(players.filter(p => p.alive && p.id !== me.id), seed);
  
  const handleVote = (targetId) => {
    if (myVote) return;
    submitVote(roomCode, me.id, targetId);
  };
  
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-b from-[#1a0a2e] via-black to-black p-4 pt-8" style={{ fontFamily: isRTL ? "'Amiri', serif" : "'Cormorant Garamond', serif" }}>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <p className="text-white/60 text-sm">{me.name}</p>
          <h2 className="text-3xl text-white font-light tracking-wide">{L.voteFor}</h2>
          <div className="text-amber-200/80 text-xl mt-2">{timer}s</div>
        </div>
        
        {!me.alive ? (
          <div className="py-8 text-white/40 italic text-center">{L.observer}</div>
        ) : myVote ? (
          <div className="py-8 text-white/60 text-center">
            <p>{isRTL ? 'تم التصويت' : 'Vote submitted'}</p>
            <p className="text-sm italic mt-2">{L.waitForOthers}</p>
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {targets.map(p => (
              <button
                key={p.id}
                onClick={() => handleVote(p.id)}
                className="w-full py-3 px-4 rounded-lg border border-white/10 bg-black/40 text-white/80 hover:bg-red-950/40 hover:border-red-700/50 transition text-left"
              >
                {p.name}
              </button>
            ))}
            <button onClick={() => handleVote('skip')} className="w-full py-3 px-4 rounded-lg border border-white/10 bg-black/20 text-white/50 hover:bg-black/40 transition">
              {L.skipVote}
            </button>
          </div>
        )}
        
        <p className="text-white/40 text-sm text-center italic">
          {Object.keys(votes).length} / {aliveCount} voted
        </p>
      </div>
    </div>
  );
}
