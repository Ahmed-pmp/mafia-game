import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { useT } from '../locales/translations';
import { createRoom } from '../lib/roomService';

export default function CreateRoomScreen({ lang, setLang, soundOn, setSoundOn }) {
  const navigate = useNavigate();
  const L = useT(lang);
  const isRTL = lang === 'ar';
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { roomCode, playerId } = await createRoom(name.trim());
      localStorage.setItem(`mafia-player-${roomCode}`, playerId);
      navigate(`/room/${roomCode}`);
    } catch (err) {
      console.error(err);
      setError('Failed to create room. Please try again.');
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
          {L.createRoom}
        </h2>
        
        <input
          type="text"
          placeholder={L.yourName}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          className="w-full mb-4 py-4 px-5 bg-black/40 backdrop-blur-md border border-white/20 rounded-lg text-white text-lg placeholder-white/40 focus:outline-none focus:border-violet-500/60"
        />
        
        {error && (
          <div className="mb-4 py-3 px-4 bg-red-900/40 border border-red-500/40 rounded text-red-200 text-sm text-center">
            {error}
          </div>
        )}
        
        <button
          onClick={handleCreate}
          disabled={!name.trim() || loading}
          className="w-full py-4 bg-gradient-to-r from-violet-900 to-purple-900 border border-violet-500/40 rounded-lg text-white text-xl font-medium tracking-wide hover:from-violet-800 hover:to-purple-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed mb-4"
        >
          {loading ? L.connecting : L.create}
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
