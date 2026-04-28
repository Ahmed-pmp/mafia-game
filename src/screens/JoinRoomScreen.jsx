import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { useT } from '../locales/translations';
import { joinRoom } from '../lib/roomService';

export default function JoinRoomScreen({ lang, setLang, soundOn, setSoundOn }) {
  const navigate = useNavigate();
  const { roomCode: urlRoomCode } = useParams();
  const L = useT(lang);
  const isRTL = lang === 'ar';
  
  const [name, setName] = useState('');
  const [code, setCode] = useState(urlRoomCode || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleJoin = async () => {
    if (!name.trim() || !code.trim() || !password.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { playerId } = await joinRoom(code.trim(), password.trim(), name.trim());
      localStorage.setItem(`mafia-player-${code.trim()}`, playerId);
      navigate(`/room/${code.trim()}`);
    } catch (err) {
      console.error(err);
      const msgMap = {
        'ROOM_NOT_FOUND': L.roomNotFound,
        'WRONG_PASSWORD': L.wrongPassword,
        'ROOM_FULL': L.roomFull,
        'GAME_ALREADY_STARTED': L.gameAlreadyStarted,
      };
      setError(msgMap[err.message] || 'Failed to join room.');
      setLoading(false);
    }
  };
  
  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'} 
      className="min-h-screen bg-gradient-to-b from-[#0a0612] via-[#1a0a2e] to-black flex flex-col items-center justify-center p-6 relative" 
      style={{ fontFamily: isRTL ? "'Amiri', serif" : "'Cormorant Garamond', serif" }}
    >
      <TopBar lang={lang} setLang={setLang} soundOn={soundOn} setSoundOn={setSoundOn} />
      <div className="max-w-md w-full">
        <h2 className="text-4xl text-white text-center mb-12 font-light tracking-wide">
          {L.joinRoom}
        </h2>
        
        <input
          type="text"
          placeholder={L.yourName}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          className="w-full mb-4 py-4 px-5 bg-black/40 backdrop-blur-md border border-white/20 rounded-lg text-white text-lg placeholder-white/40 focus:outline-none focus:border-violet-500/60"
        />
        
        <input
          type="text"
          placeholder={L.enterCode}
          maxLength={4}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          inputMode="numeric"
          className="w-full mb-4 py-4 px-5 bg-black/40 backdrop-blur-md border border-white/20 rounded-lg text-white text-lg placeholder-white/40 focus:outline-none focus:border-violet-500/60 text-center tracking-[0.5em]"
        />
        
        <input
          type="text"
          placeholder={L.enterPassword}
          maxLength={4}
          value={password}
          onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
          inputMode="numeric"
          className="w-full mb-4 py-4 px-5 bg-black/40 backdrop-blur-md border border-white/20 rounded-lg text-white text-lg placeholder-white/40 focus:outline-none focus:border-violet-500/60 text-center tracking-[0.5em]"
        />
        
        {error && (
          <div className="mb-4 py-3 px-4 bg-red-900/40 border border-red-500/40 rounded text-red-200 text-sm text-center">
            {error}
          </div>
        )}
        
        <button
          onClick={handleJoin}
          disabled={!name.trim() || !code.trim() || !password.trim() || loading}
          className="w-full py-4 bg-gradient-to-r from-violet-900 to-purple-900 border border-violet-500/40 rounded-lg text-white text-xl font-medium tracking-wide hover:from-violet-800 hover:to-purple-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed mb-4"
        >
          {loading ? L.connecting : L.join}
        </button>
        
        <button
          onClick={() => navigate('/')}
          className="w-full py-3 text-white/60 hover:text-white transition"
        >
          ← {L.back}
        </button>
      </div>
    </div>
  );
}
