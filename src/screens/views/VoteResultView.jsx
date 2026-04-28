import React from 'react';
import { Skull, Shield } from 'lucide-react';
import { continueAfterVoteResult } from '../../lib/roomService';

export default function VoteResultView({ room, me, roomCode, L, isRTL }) {
  const isHost = me.isHost;
  const result = room.voteResult;
  const players = room.players ? Object.values(room.players) : [];
  const aliveAfter = players.filter(p => p.alive);
  
  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'} 
      className="min-h-screen bg-gradient-to-b from-amber-900/30 via-orange-950/40 to-black p-6 pt-12 pb-8" 
      style={{ fontFamily: isRTL ? "'Amiri', serif" : "'Cormorant Garamond', serif" }}
    >
      <div className="max-w-md mx-auto text-center">
        {result?.isTie || !result?.eliminatedId ? (
          <>
            <Shield size={64} className="text-amber-400 mx-auto mb-6" strokeWidth={1.5} />
            <h2 className="text-4xl text-white mb-3 font-light tracking-wide">{L.voteTied}</h2>
            <p className="text-white/60 italic mb-8 text-lg">{L.voteTiedDesc}</p>
          </>
        ) : (
          <>
            <Skull size={64} className="text-red-400 mx-auto mb-6" strokeWidth={1.5} />
            <p className="text-white/60 italic mb-2">{L.decided}</p>
            <h2 className="text-5xl text-white mb-3 font-bold tracking-wide" style={{ textShadow: '0 0 30px rgba(220,38,38,0.5)' }}>
              {result.eliminatedName}
            </h2>
            <p className="text-red-300/80 italic mb-8 text-xl">{L.eliminatedByVote}</p>
          </>
        )}
        
        {result?.breakdownList && result.breakdownList.length > 0 && (
          <div className="bg-black/60 backdrop-blur-md border border-amber-700/40 rounded-lg p-4 mb-6 text-left">
            <div className="text-amber-200/80 text-sm uppercase tracking-wider mb-3 text-center">
              📊 {L.voteBreakdown}
            </div>
            <div className="space-y-2">
              {result.breakdownList.map(item => (
                <div 
                  key={item.targetId} 
                  className={`p-3 rounded border ${
                    item.targetId === result?.eliminatedId 
                      ? 'bg-red-900/40 border-red-500/60' 
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold ${item.targetId === result?.eliminatedId ? 'text-red-200' : 'text-white'}`}>
                      {item.targetName}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-sm font-bold ${
                      item.targetId === result?.eliminatedId 
                        ? 'bg-red-600 text-white' 
                        : 'bg-amber-700/60 text-amber-100'
                    }`}>
                      {item.count} {item.count === 1 ? L.vote : L.votes}
                    </span>
                  </div>
                  <div className="text-white/60 text-xs">
                    {item.voters.join(isRTL ? '، ' : ', ')}
                  </div>
                </div>
              ))}
              {result.skippedVoters && result.skippedVoters.length > 0 && (
                <div className="p-3 rounded border bg-white/5 border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/60 italic">{L.skipped}</span>
                    <span className="px-2 py-0.5 rounded text-sm bg-white/10 text-white/60">
                      {result.skippedVoters.length}
                    </span>
                  </div>
                  <div className="text-white/40 text-xs">
                    {result.skippedVoters.join(isRTL ? '، ' : ', ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-4 mb-6">
          <div className="text-white/60 text-sm uppercase tracking-wider mb-3">
            {L.remaining} · {aliveAfter.length}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {aliveAfter.map(p => (
              <div key={p.id} className="py-2 bg-white/5 rounded text-white/80 text-sm">{p.name}</div>
            ))}
          </div>
        </div>
        
        {isHost ? (
          <button
            onClick={() => continueAfterVoteResult(roomCode)}
            className="w-full py-4 bg-gradient-to-r from-violet-900 to-purple-900 border border-violet-500/40 rounded-lg text-white text-xl tracking-wide hover:from-violet-800 transition-all"
          >
            {L.nightFalls} →
          </button>
        ) : (
          <div className="py-3 bg-black/40 border border-white/10 rounded text-white/40 text-sm italic">
            {isRTL ? 'المضيف يبدأ الليلة التالية' : 'Host will start next night'}
          </div>
        )}
      </div>
    </div>
  );
}
