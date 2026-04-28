import React from 'react';
import { Skull, Shield } from 'lucide-react';
import { startDiscussion } from '../../lib/roomService';

export default function DayView({ room, me, roomCode, L, isRTL }) {
  const killedId = room.nightResult?.killedId;
  const killedPlayer = killedId ? room.players[killedId] : null;
  const isHost = me.isHost;
  
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-b from-amber-900/30 via-orange-950/40 to-black flex flex-col items-center justify-center p-6" style={{ fontFamily: isRTL ? "'Amiri', serif" : "'Cormorant Garamond', serif" }}>
      <div className="max-w-md w-full text-center">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 mx-auto mb-8 shadow-[0_0_80px_30px_rgba(251,146,60,0.4)]"></div>
        <h2 className="text-4xl text-white mb-2 font-light tracking-wide">{L.morning}</h2>
        <p className="text-amber-200/70 mb-12 italic">{L.day} {room.round}</p>
        
        {killedPlayer ? (
          <div className="bg-black/60 backdrop-blur-md border border-red-900/40 rounded-lg p-6 mb-8">
            <Skull size={48} className="text-red-400 mx-auto mb-3" strokeWidth={1.5} />
            {isRTL ? (
              <p className="text-2xl text-white">
                <span className="font-bold">{killedPlayer.name}</span>
                <span className="text-red-300 italic ml-2"> ودّع 👋</span>
              </p>
            ) : (
              <>
                <p className="text-2xl text-white"><span className="font-medium">{killedPlayer.name}</span></p>
                <p className="text-white/60 italic mt-1">{L.eliminated}</p>
              </>
            )}
          </div>
        ) : (
          <div className="bg-black/60 backdrop-blur-md border border-emerald-900/40 rounded-lg p-6 mb-8">
            <Shield size={48} className="text-emerald-400 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-xl text-white italic">{L.attemptFailed}</p>
          </div>
        )}
        
        {isHost ? (
          <button
            onClick={() => startDiscussion(roomCode)}
            className="w-full py-4 bg-gradient-to-r from-amber-700 to-orange-800 border border-amber-500/40 rounded-lg text-white text-xl tracking-wide hover:from-amber-600 hover:to-orange-700 transition-all"
          >
            {L.discussion} →
          </button>
        ) : (
          <div className="py-3 bg-black/40 border border-white/10 rounded text-white/40 text-sm italic">
            {isRTL ? 'المضيف يبدأ النقاش' : 'Host will start discussion'}
          </div>
        )}
      </div>
    </div>
  );
}
