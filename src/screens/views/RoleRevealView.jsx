import React, { useState } from 'react';
import { Skull, Heart, Eye, Users } from 'lucide-react';
import { acknowledgeRole } from '../../lib/roomService';

const ROLE_ICONS = { mafia: Skull, doctor: Heart, elder: Eye, citizen: Users };
const ROLE_COLORS = { mafia: '#dc2626', doctor: '#10b981', elder: '#8b5cf6', citizen: '#f59e0b' };
const ROLE_GRADIENTS = {
  mafia: 'from-red-950 via-red-900 to-black',
  doctor: 'from-emerald-950 via-emerald-900 to-black',
  elder: 'from-violet-950 via-violet-900 to-black',
  citizen: 'from-amber-950 via-amber-900 to-black',
};

export default function RoleRevealView({ room, me, roomCode, L, isRTL }) {
  const [revealed, setRevealed] = useState(false);
  const [acked, setAcked] = useState(false);
  
  const role = me.role;
  const RoleIcon = ROLE_ICONS[role];
  const color = ROLE_COLORS[role];
  const gradient = ROLE_GRADIENTS[role];
  
  const handleAcknowledge = async () => {
    setAcked(true);
    await acknowledgeRole(roomCode, me.id).catch(console.error);
  };
  
  const acknowledgedCount = room.rolesAcknowledged ? Object.keys(room.rolesAcknowledged).length : 0;
  const totalPlayers = room.players ? Object.keys(room.players).length : 0;
  
  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'} 
      className={`min-h-screen bg-gradient-to-b ${revealed ? gradient : 'from-[#0a0612] via-[#1a0a2e] to-black'} flex flex-col items-center justify-center p-6 transition-all duration-1000 relative`}
      style={{ fontFamily: isRTL ? "'Amiri', serif" : "'Cormorant Garamond', serif" }}
    >
      <div className="max-w-md w-full text-center">
        {!revealed ? (
          <>
            <div className="text-white/60 text-sm uppercase tracking-[0.3em] mb-4">{L.youAre}</div>
            <h2 className="text-5xl text-white mb-12 font-light">{me.name}</h2>
            <button
              onClick={() => setRevealed(true)}
              className="w-full py-6 bg-black/60 backdrop-blur-md border-2 border-amber-500/40 rounded-lg text-amber-200 text-xl tracking-wider hover:bg-black/80 transition-all"
            >
              {L.tapToReveal}
            </button>
          </>
        ) : (
          <>
            <div className="text-white/60 text-sm uppercase tracking-[0.3em] mb-6">{L.yourRole}</div>
            <div 
              className="mb-8 inline-block p-8 rounded-full" 
              style={{ background: `radial-gradient(circle, ${color}40 0%, transparent 70%)` }}
            >
              <RoleIcon size={80} className="text-white" strokeWidth={1.5} />
            </div>
            <h2 
              className="text-6xl text-white mb-6 font-bold tracking-wide" 
              style={{ textShadow: `0 0 30px ${color}80` }}
            >
              {L[role]}
            </h2>
            <p className="text-white/80 text-lg mb-12 italic leading-relaxed px-4">{L[`${role}Desc`]}</p>
            
            {acked ? (
              <div className="py-4">
                <div className="text-white/60 mb-2">{L.waitForOthers}</div>
                <div className="text-amber-200 text-2xl">{acknowledgedCount} / {totalPlayers}</div>
              </div>
            ) : (
              <button
                onClick={handleAcknowledge}
                className="w-full py-4 bg-black/60 backdrop-blur-md border border-white/30 rounded-lg text-white text-lg hover:bg-black/80 transition"
              >
                {L.hideRole} →
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
