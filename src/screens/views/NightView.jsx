import React, { useState } from 'react';
import { Moon, Skull, Heart, Eye, Check, X } from 'lucide-react';
import {
  sendMafiaMessage,
  setMafiaTarget,
  endMafiaChatEarly,
  setDoctorTarget,
  setElderTarget,
} from '../../lib/roomService';
import { getShuffledList } from '../../lib/gameLogic';

export default function NightView({ room, me, roomCode, L, isRTL, now }) {
  const subPhase = room.nightSubPhase;
  const isAliveMafia = me.alive && me.role === 'mafia';
  const isDoctor = me.role === 'doctor';
  const isElder = me.role === 'elder';
  
  const players = room.players ? Object.values(room.players) : [];
  const timer = room.timerEndsAt ? Math.max(0, Math.ceil((room.timerEndsAt - now) / 1000)) : 0;
  
  const seed = (parseInt(me.id.replace(/\D/g, '').slice(-4) || '0') + 1) * 1000 + (room.round || 1);
  
  if (subPhase === 'intro') {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-black flex flex-col items-center justify-center p-6" style={{ fontFamily: isRTL ? "'Amiri', serif" : "'Cormorant Garamond', serif" }}>
        <div className="text-center">
          <Moon size={80} className="text-amber-200/60 mx-auto mb-6 animate-pulse" strokeWidth={1} />
          <h2 className="text-5xl text-white mb-3 font-light tracking-wide">{L.night}</h2>
          <p className="text-white/40 italic text-lg">{L.nightDesc}</p>
        </div>
      </div>
    );
  }
  
  if (subPhase === 'mafia-chat') {
    if (!isAliveMafia) return <WaitingScreen Icon={Moon} text={L.mafiaTurn} timer={timer} L={L} isRTL={isRTL} />;
    return <MafiaChatPanel room={room} me={me} roomCode={roomCode} L={L} isRTL={isRTL} timer={timer} />;
  }
  
  if (subPhase === 'mafia-select') {
    if (!isAliveMafia) return <WaitingScreen Icon={Moon} text={L.mafiaTurn} timer={timer} L={L} isRTL={isRTL} />;
    
    const possibleTargets = getShuffledList(players.filter(p => p.alive && p.role !== 'mafia'), seed);
    const myTarget = room.mafiaTargets?.[me.id];
    
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-b from-red-950 via-black to-black p-4 pt-8" style={{ fontFamily: isRTL ? "'Amiri', serif" : "'Cormorant Garamond', serif" }}>
        <div className="max-w-md mx-auto">
          <div className="text-center mb-4">
            <Skull size={48} className="text-red-400 mx-auto mb-2" strokeWidth={1.5} />
            <h2 className="text-2xl text-red-300 font-light">{L.selectTarget}</h2>
            <div className="text-red-300/80 text-xl mt-2">{timer}s</div>
          </div>
          <div className="space-y-2">
            {possibleTargets.map(p => (
              <button
                key={p.id}
                onClick={() => setMafiaTarget(roomCode, me.id, p.id)}
                className={`w-full py-3 px-4 rounded-lg border transition-all text-left flex items-center justify-between ${
                  myTarget === p.id ? 'bg-red-800/60 border-red-500 text-white' : 'bg-black/40 border-white/10 text-white/80 hover:border-red-700/50'
                }`}
              >
                <span>{p.name}</span>
                {myTarget === p.id && <Check size={18} />}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (subPhase === 'doctor') {
    if (!isDoctor) return <WaitingScreen Icon={Moon} text={L.doctorTurn} timer={timer} L={L} isRTL={isRTL} />;
    
    const targets = getShuffledList(players.filter(p => p.alive), seed);
    
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-b from-emerald-950 via-black to-black p-4 pt-8" style={{ fontFamily: isRTL ? "'Amiri', serif" : "'Cormorant Garamond', serif" }}>
        <div className="max-w-md mx-auto">
          <div className="text-center mb-4">
            <Heart size={48} className="text-emerald-400 mx-auto mb-2" strokeWidth={1.5} />
            <h2 className="text-2xl text-emerald-300 font-light">{L.selectProtect}</h2>
            <div className="text-emerald-300/80 text-xl mt-2">{timer}s</div>
          </div>
          <div className="space-y-2">
            {targets.map(p => {
              const cantSelect = p.id === room.doctorLastTarget;
              return (
                <button
                  key={p.id}
                  onClick={() => !cantSelect && setDoctorTarget(roomCode, p.id)}
                  disabled={cantSelect}
                  className={`w-full py-3 px-4 rounded-lg border transition-all text-left flex items-center justify-between ${
                    cantSelect ? 'bg-black/20 border-white/5 text-white/30 cursor-not-allowed' :
                    room.doctorTarget === p.id ? 'bg-emerald-800/60 border-emerald-500 text-white' : 'bg-black/40 border-white/10 text-white/80 hover:border-emerald-700/50'
                  }`}
                >
                  <span>{p.name} {p.id === me.id && '(You)'}</span>
                  {cantSelect ? <span className="text-xs">{L.cannotProtect}</span> : room.doctorTarget === p.id && <Check size={18} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  
  if (subPhase === 'elder') {
    if (!isElder) return <WaitingScreen Icon={Moon} text={L.elderTurn} timer={timer} L={L} isRTL={isRTL} />;
    
    const targets = getShuffledList(players.filter(p => p.alive && p.id !== me.id), seed);
    
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-b from-violet-950 via-black to-black p-4 pt-8" style={{ fontFamily: isRTL ? "'Amiri', serif" : "'Cormorant Garamond', serif" }}>
        <div className="max-w-md mx-auto">
          <div className="text-center mb-4">
            <Eye size={48} className="text-violet-400 mx-auto mb-2" strokeWidth={1.5} />
            <h2 className="text-2xl text-violet-300 font-light">{L.selectInvestigate}</h2>
            <div className="text-violet-300/80 text-xl mt-2">{timer}s</div>
          </div>
          <div className="space-y-2">
            {targets.map(p => (
              <button
                key={p.id}
                onClick={() => setElderTarget(roomCode, p.id)}
                className={`w-full py-3 px-4 rounded-lg border transition-all text-left flex items-center justify-between ${
                  room.elderTarget === p.id ? 'bg-violet-800/60 border-violet-500 text-white' : 'bg-black/40 border-white/10 text-white/80 hover:border-violet-700/50'
                }`}
              >
                <span>{p.name}</span>
                {room.elderTarget === p.id && <Check size={18} />}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (subPhase === 'results') {
    if (isElder && me.alive && room.elderResult) {
      const targetPlayer = room.players[room.elderResult.targetId];
      return (
        <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-b from-violet-950 via-black
