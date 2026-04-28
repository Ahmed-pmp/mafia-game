import React, { useState } from 'react';
import { Crown, Copy, Check, Users, LogOut } from 'lucide-react';
import TopBar from '../../components/TopBar';
import { startGame } from '../../lib/roomService';

export default function LobbyView({ room, me, roomCode, lang, setLang, soundOn, setSoundOn, L, isRTL, onLeave }) {
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  
  const players = room.players ? Object.values(room.players) : [];
  const isHost = me.isHost;
  
  const shareLink = `${window.location.origin}/join/${roomCode}`;
  
  const copyShareInfo = () => {
    const text = isRTL
      ? `انضم للعبة المافيا!\nالرابط: ${shareLink}\nالرمز: ${roomCode}\nكلمة المرور: ${room.password}`
      : `Join our Mafia game!\nLink: ${shareLink}\nCode: ${roomCode}\nPassword: ${room.password}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  
  const handleStart = async () => {
    setStarting(true);
    setError('');
    try {
      await startGame(roomCode);
    } catch (err) {
      setError(err.message);
      setStarting(false);
    }
  };
  
  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'} 
      className="min-h-screen bg-gradient-to-b from-[#0a0612] via-[#1a0a2e] to-black p-6 pt-20 relative" 
      style={{ fontFamily: isRTL ? "'Amiri', serif" : "'Cormorant Garamond', serif" }}
    >
      <TopBar lang={lang} setLang={setLang} soundOn={soundOn} setSoundOn={setSoundOn} />
      
      <button
        onClick={onLeave}
        className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-900/40 border border-red-500/30 rounded-full text-red-200 text-xs hover:bg-red-900/60 transition flex items-center gap-1"
      >
        <LogOut size={12} /> {L.leaveGame}
      </button>
      
      <div className="max-w-md mx-auto">
        <h2 className="text-4xl text-white text-center mb-2 font-light tracking-wide">{L.lobby}</h2>
        <p className="text-white/40 text-center mb-8 italic">{L.subtitle}</p>
        
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-5 mb-3">
          <div className="text-amber-200/70 text-sm mb-2 tracking-wider uppercase">{L.roomCode}</div>
          <div className="flex items-center justify-between">
            <div className="text-4xl text-white tracking-[0.4em] font-light">{roomCode}</div>
          </div>
        </div>
        
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-5 mb-3">
          <div className="text-amber-200/70 text-sm mb-2 tracking-wider uppercase">{L.password}</div>
          <div className="text-3xl text-white tracking-[0.4em] font-light">{room.password}</div>
        </div>
        
        <button
          onClick={copyShareInfo}
          className="w-full py-3 mb-4 bg-amber-900/40 border border-amber-500/30 rounded-lg text-amber-200 hover:bg-amber-900/60 transition flex items-center justify-center gap-2"
        >
          {copied ? <><Check size={18} /> {L.copied}</> : <><Copy size={18} /> {L.copy}</>}
        </button>
        
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-white/80 text-lg flex items-center gap-2">
              <Users size={18} /> {L.players}
            </div>
            <div className="text-amber-200/80 text-lg">{players.length}/15</div>
          </div>
          <div className="space-y-2">
            {players.map((p) => (
              <div key={p.id} className={`flex items-center gap-3 py-2 px-3 rounded ${p.id === me.id ? 'bg-violet-900/30 border border-violet-500/30' : 'bg-white/5'}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-700 to-purple-900 flex items-center justify-center text-white text-sm">
                  {p.name[0].toUpperCase()}
                </div>
                <div className="text-white flex-1">{p.name}{p.id === me.id && ' (You)'}</div>
                {p.isHost && (
                  <div className="flex items-center gap-1 text-amber-300 text-xs">
                    <Crown size={12} /> {L.host}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {error && (
          <div className="mb-4 py-3 px-4 bg-red-900/40 border border-red-500/40 rounded text-red-200 text-sm text-center">
            {error}
          </div>
        )}
        
        {isHost ? (
          players.length < 9 ? (
            <div className="text-center text-amber-200/70 italic py-4">{L.minPlayers}</div>
          ) : (
            <button
              onClick={handleStart}
              disabled={starting}
              className="w-full py-4 bg-gradient-to-r from-amber-700 to-amber-900 border border-amber-500/40 rounded-lg text-white text-xl font-medium tracking-wide hover:from-amber-600 hover:to-amber-800 transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] disabled:opacity-40"
            >
              {starting ? L.connecting : L.startGame}
            </button>
          )
        ) : (
          <div className="text-center text-white/50 italic py-4">{L.waitForOthers}</div>
        )}
      </div>
    </div>
  );
}
