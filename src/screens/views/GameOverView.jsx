import React, { useMemo } from 'react';
import { Skull, Shield, Heart, Eye, Users } from 'lucide-react';

const ROLE_ICONS = { mafia: Skull, doctor: Heart, elder: Eye, citizen: Users };
const ROLE_COLORS = { mafia: '#dc2626', doctor: '#10b981', elder: '#8b5cf6', citizen: '#f59e0b' };

export default function GameOverView({ room, me, roomCode, L, isRTL, onLeave }) {
  const isMafiaWin = room.winner === 'mafia';
  const players = room.players ? Object.values(room.players) : [];
  const doctor = players.find(p => p.role === 'doctor');
  const elder = players.find(p => p.role === 'elder');
  const stats = room.stats || {};
  
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, () => ({
      size: isMafiaWin ? Math.random() * 4 + 2 : Math.random() * 3 + 1,
      top: Math.random() * 100,
      left: Math.random() * 100,
      opacity: Math.random() * 0.6 + 0.3,
      duration: isMafiaWin ? Math.random() * 4 + 4 : Math.random() * 3 + 2,
    }));
  }, [isMafiaWin]);
  
  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'} 
      className="min-h-screen flex flex-col items-center justify-start p-4 pt-8 pb-8 relative overflow-hidden"
      style={{ 
        fontFamily: isRTL ? "'Amiri', serif" : "'Cormorant Garamond', serif",
        background: isMafiaWin 
          ? 'radial-gradient(ellipse at center top, #450a0a 0%, #1c0505 40%, #000 100%)'
          : 'radial-gradient(ellipse at center top, #064e3b 0%, #042f21 40%, #000 100%)'
      }}
    >
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isMafiaWin
            ? 'radial-gradient(circle at 50% 30%, rgba(220, 38, 38, 0.3) 0%, transparent 60%)'
            : 'radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.25) 0%, transparent 60%)',
          animation: 'pulse-bg 3s ease-in-out infinite'
        }}
      />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: isMafiaWin ? '#dc2626' : '#fbbf24',
              top: `${p.top}%`,
              left: `${p.left}%`,
              opacity: p.opacity,
              animation: isMafiaWin 
                ? `fall ${p.duration}s linear infinite` 
                : `twinkle-victory ${p.duration}s ease-in-out infinite`,
              boxShadow: isMafiaWin ? '0 0 4px #dc2626' : '0 0 8px #fbbf24',
            }}
          />
        ))}
      </div>
      
      <div className="max-w-md w-full text-center relative z-10">
        <div className="mb-6 relative inline-block">
          {isMafiaWin ? (
            <Skull 
              size={120} 
              className="text-red-500 mx-auto" 
              strokeWidth={1}
              style={{ 
                filter: 'drop-shadow(0 0 40px rgba(220, 38, 38, 0.8)) drop-shadow(0 0 80px rgba(220, 38, 38, 0.4))',
                animation: 'pulse-icon 2s ease-in-out infinite'
              }}
            />
          ) : (
            <Shield 
              size={120} 
              className="text-emerald-400 mx-auto" 
              strokeWidth={1}
              style={{ 
                filter: 'drop-shadow(0 0 40px rgba(16, 185, 129, 0.8)) drop-shadow(0 0 80px rgba(16, 185, 129, 0.4))',
                animation: 'pulse-icon 2s ease-in-out infinite'
              }}
            />
          )}
        </div>
        
        <h2 
          className={`text-7xl font-black mb-2 tracking-wider ${isMafiaWin ? 'text-red-300' : 'text-emerald-300'}`} 
          style={{ 
            textShadow: isMafiaWin 
              ? '0 0 30px #dc2626, 0 0 60px #dc2626, 0 4px 20px rgba(0,0,0,0.8)' 
              : '0 0 30px #10b981, 0 0 60px #10b981, 0 4px 20px rgba(0,0,0,0.8)',
            animation: 'title-appear 0.8s ease-out'
          }}
        >
          {isMafiaWin ? L.mafiaWins : L.citizensWin}
        </h2>
        
        <p className={`text-lg italic mb-8 ${isMafiaWin ? 'text-red-200/70' : 'text-emerald-200/70'}`}>
          {isMafiaWin ? L.mafiaWinsDesc : L.citizensWinDesc}
        </p>
        
        <div className="bg-black/70 backdrop-blur-md border border-amber-500/30 rounded-lg p-4 mb-4 text-left">
          <div className="text-amber-200 text-sm uppercase tracking-wider mb-3 text-center font-bold">
            📈 {L.gameStats}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white/5 rounded p-2">
              <span className="text-white/70">🎲 {L.rounds}</span>
              <span className="text-white font-bold">{room.round}</span>
            </div>
            
            {doctor && (
              <div className="bg-emerald-950/30 border border-emerald-700/30 rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-emerald-300 font-bold flex items-center gap-2">
                    <Heart size={14} /> {doctor.name} ({L.doctor})
                  </span>
                </div>
                <div className="text-sm text-white/70 space-y-1">
                  <div className="flex justify-between">
                    <span>{L.protections}</span>
                    <span className="text-white">{stats.doctorSaves || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{L.livesSaved}</span>
                    <span className={`font-bold ${(stats.doctorSuccessful || 0) > 0 ? 'text-emerald-300' : 'text-white/40'}`}>
                      {stats.doctorSuccessful || 0} {(stats.doctorSaves || 0) > 0 && `/ ${stats.doctorSaves}`}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {elder && (
              <div className="bg-violet-950/30 border border-violet-700/30 rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-violet-300 font-bold flex items-center gap-2">
                    <Eye size={14} /> {elder.name} ({L.elder})
                  </span>
                </div>
                <div className="text-sm text-white/70 space-y-1">
                  <div className="flex justify-between">
                    <span>{L.investigations}</span>
                    <span className="text-white">{stats.elderInvestigations || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{L.mafiaFound}</span>
                    <span className={`font-bold ${(stats.elderCorrectMafia || 0) > 0 ? 'text-red-300' : 'text-white/40'}`}>
                      {stats.elderCorrectMafia || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{L.citizensCleared}</span>
                    <span className="text-white">{stats.elderCorrectCitizen || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg p-4 mb-6">
          <div className="text-white/60 text-sm uppercase tracking-wider mb-3 text-center">
            🎭 {L.rolesRevealed}
          </div>
          <div className="space-y-2">
            {players.map(p => {
              const Icon = ROLE_ICONS[p.role];
              const color = ROLE_COLORS[p.role];
              return (
                <div key={p.id} className="flex items-center justify-between py-2 px-3 bg-white/5 rounded">
                  <div className="flex items-center gap-3">
                    <Icon size={18} style={{ color }} />
                    <span className={`${p.alive ? 'text-white' : 'text-white/40 line-through'}`}>{p.name}</span>
                  </div>
                  <span style={{ color }} className="text-sm font-bold">{L[p.role]}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        <button
          onClick={onLeave}
          className="w-full py-4 bg-gradient-to-r from-violet-900 to-purple-900 border border-violet-500/40 rounded-lg text-white text-xl tracking-wide hover:from-violet-800 transition-all shadow-lg"
        >
          {L.newGame}
        </button>
      </div>
    </div>
  );
}
