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
        <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-b from-violet-950 via-black to-black flex flex-col items-center justify-center p-6" style={{ fontFamily: isRTL ? "'Amiri', serif" : "'Cormorant Garamond', serif" }}>
          <div className="max-w-md w-full text-center">
            <Eye size={64} className="text-violet-400 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-white/60 mb-2">{L.youInvestigated}</p>
            <h3 className="text-3xl text-white mb-8">{targetPlayer?.name}</h3>
            <div className={`py-8 px-6 rounded-lg border-2 ${room.elderResult.isMafia ? 'bg-red-950/40 border-red-500' : 'bg-emerald-950/40 border-emerald-500'}`}>
              <div className={`text-4xl font-bold mb-2 ${room.elderResult.isMafia ? 'text-red-400' : 'text-emerald-400'}`}>
                {room.elderResult.isMafia ? L.isMafia : L.notMafia}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return <WaitingScreen Icon={Moon} text={L.nightDesc} timer={null} L={L} isRTL={isRTL} />;
  }
  
  return null;
}

function WaitingScreen({ Icon, text, timer, L, isRTL }) {
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-black flex flex-col items-center justify-center p-6" style={{ fontFamily: isRTL ? "'Amiri', serif" : "'Cormorant Garamond', serif" }}>
      <Icon size={64} className="text-white/20 mb-6 animate-pulse" strokeWidth={1} />
      <p className="text-white/30 text-sm">{text}</p>
      {timer !== null && <div className="mt-8 text-amber-200/60 text-2xl tracking-wider">{timer}s</div>}
    </div>
  );
}

function MafiaChatPanel({ room, me, roomCode, L, isRTL, timer }) {
  const [chatInput, setChatInput] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  
  const messages = room.mafiaMessages ? Object.values(room.mafiaMessages).sort((a, b) => a.timestamp - b.timestamp) : [];
  const players = Object.values(room.players);
  const possibleTargets = players.filter(p => p.alive && p.role !== 'mafia');
  
  const handleSend = (text, isPointing = false) => {
    if (!text.trim()) return;
    sendMafiaMessage(roomCode, me.id, me.name, text, isPointing);
    setChatInput('');
  };
  
  const handlePointAt = (targetName) => {
    handleSend(`👉 ${targetName}`, true);
    setShowPicker(false);
  };
  
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-b from-red-950 via-black to-black p-4 pt-8 flex flex-col" style={{ fontFamily: isRTL ? "'Amiri', serif" : "'Cormorant Garamond', serif" }}>
      <div className="text-center mb-3">
        <h2 className="text-2xl text-red-300 font-light tracking-wide">{L.mafiaChat}</h2>
        <p className="text-white/40 text-sm italic">{L.mafiaChatDesc}</p>
        <div className="text-red-300/80 text-xl mt-2">{timer}s</div>
      </div>
      
      <div className="flex-1 bg-black/40 backdrop-blur-md border border-red-900/40 rounded-lg p-3 mb-3 overflow-y-auto" style={{ maxHeight: '35vh' }}>
        {messages.length === 0 ? (
          <div className="text-white/30 text-center py-8 italic text-sm">No messages yet...</div>
        ) : (
          messages.map(m => (
            <div key={m.timestamp} className={`mb-2 ${m.isPointing ? 'bg-red-900/40 border border-red-600/40 rounded px-2 py-1' : ''}`}>
              <span className="text-red-400 text-sm font-bold">{m.from}:</span>
              <span className={`text-sm ml-2 ${m.isPointing ? 'text-red-200 font-bold' : 'text-white/90'}`}>{m.text}</span>
            </div>
          ))
        )}
      </div>
      
      <button
        onClick={() => setShowPicker(true)}
        className="w-full mb-2 py-3 bg-red-800/80 border-2 border-red-500 rounded-lg text-white font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition"
      >
        <span className="text-2xl">👉</span>
        <span>{L.pickPlayer}</span>
      </button>
      
      <div className="grid grid-cols-4 gap-1 mb-2">
        {['thisOne', 'notThisOne', 'agree', 'wait'].map(key => (
          <button
            key={key}
            onClick={() => handleSend(L[key])}
            className="py-2 px-1 bg-red-950/60 border border-red-700/40 rounded text-red-200 text-[11px] hover:bg-red-900/60 transition"
            style={{ direction: 'ltr' }}
          >
            {L[key]}
          </button>
        ))}
      </div>
      
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(chatInput)}
          placeholder={L.typeMessage}
          className="flex-1 py-3 px-4 bg-black/60 border border-red-900/40 rounded text-white placeholder-white/30 focus:outline-none focus:border-red-700 text-sm"
        />
        <button onClick={() => handleSend(chatInput)} className="px-4 bg-red-800 rounded text-white hover:bg-red-700 text-sm">
          {L.send}
        </button>
      </div>
      
      <button
        onClick={() => endMafiaChatEarly(roomCode)}
        className="w-full py-3 bg-gradient-to-r from-emerald-700 to-emerald-800 border-2 border-emerald-500 rounded-lg text-white font-bold tracking-wide hover:from-emerald-600 transition shadow-lg"
      >
        ✓ {L.done}
      </button>
      
      {showPicker && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowPicker(false)}>
          <div className="bg-gradient-to-b from-red-950 to-black border-2 border-red-500 rounded-2xl p-4 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-red-300 text-xl font-bold">{L.pickPlayer}</h3>
              <button onClick={() => setShowPicker(false)} className="p-2 bg-red-600 hover:bg-red-500 rounded-full text-white">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2">
              {possibleTargets.map(p => (
                <button
                  key={p.id}
                  onClick={() => handlePointAt(p.name)}
                  className="w-full p-4 rounded-lg border-2 border-red-700/40 bg-black/60 text-white hover:bg-red-900/40 hover:border-red-500 transition text-left flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center text-white font-bold">
                    {p.name[0].toUpperCase()}
                  </div>
                  <span className="text-lg">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
