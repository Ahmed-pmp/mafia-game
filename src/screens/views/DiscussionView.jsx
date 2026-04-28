import React from 'react';
import { Crown } from 'lucide-react';
import { skipDiscussion } from '../../lib/roomService';

export default function DiscussionView({ room, me, roomCode, L, isRTL, now }) {
  const isHost = me.isHost;
  const players = room.players ? Object.values(room.players) : [];
  const timer = room.timerEndsAt ? Math.max(0, Math.ceil((room.timerEndsAt - now) / 1000)) : 0;
  
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-b from-amber-900/20 via-black to-black flex flex-col items-center justify-center p-6" style={{ fontFamily: isRTL ? "'Amiri', serif" : "'Cormorant Garamond', serif" }}>
      <div className="max-w-md w-full text-center mt-12">
        <h2 className="text-4xl text-white mb-3 font-light tracking-wide">{L.discussion}</h2>
        <p className="text-white/50 italic mb-8">{L.discussionDesc}</p>
        <div className="text-8xl text-amber-200 font-thin mb-8 tracking-wider">{timer}</div>
        
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4 mb-6">
          <div className="text-white/60 text-sm uppercase tracking-wider mb-3">{L.alive}</div>
          <div className="grid grid-cols-3 gap-2">
            {players.filter(p => p.alive).map(p => (
              <div key={p.id} className="py-2 bg-white/5 rounded text-white/80 text-sm">{p.name}</div>
            ))}
          </div>
        </div>
        
        {isHost ? (
          <button
            onClick={() => skipDiscussion(roomCode)}
            className="w-full py-4 bg-gradient-to-r from-amber-700 to-amber-900 border-2 border-amber-400 rounded-lg text-white text-lg font-bold tracking-wide hover:from-amber-600 hover:to-amber-800 transition shadow-lg flex items-center justify-center gap-2"
          >
            <Crown size={20} className="text-amber-200" />
            <span>{L.skipDiscussion} →</span>
          </button>
        ) : (
          <div className="py-3 bg-black/40 border border-white/10 rounded text-white/40 text-sm italic">
            {isRTL ? 'المضيف يتحكم بالمتابعة' : 'Host controls when to continue'}
          </div>
        )}
      </div>
    </div>
  );
}
