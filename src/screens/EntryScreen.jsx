import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon } from 'lucide-react';
import TopBar from '../components/TopBar';
import StarryBackground from '../components/StarryBackground';
import { useT } from '../locales/translations';

export default function EntryScreen({ lang, setLang, soundOn, setSoundOn }) {
  const navigate = useNavigate();
  const L = useT(lang);
  const isRTL = lang === 'ar';
  
  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'} 
      className="min-h-screen bg-gradient-to-b from-[#0a0612] via-[#1a0a2e] to-black flex flex-col items-center justify-center p-6 relative overflow-hidden"
    >
      <TopBar lang={lang} setLang={setLang} soundOn={soundOn} setSoundOn={setSoundOn} />
      <StarryBackground />
      
      <div className="relative z-10 flex flex-col items-center max-w-md w-full">
        <Moon className="text-amber-200/80 mb-6" size={64} strokeWidth={1} />
        <h1 
          className="text-7xl font-black mb-3 tracking-[0.15em]" 
          style={{ 
            fontFamily: isRTL ? "'Amiri', serif" : "'Cormorant Garamond', serif",
            background: 'linear-gradient(180deg, #fef3c7 0%, #fbbf24 30%, #dc2626 70%, #7f1d1d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 30px rgba(220, 38, 38, 0.6)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.8))',
          }}
        >
          {L.title}
        </h1>
        <p className="text-amber-200/70 italic text-lg mb-16 tracking-wide">{L.subtitle}</p>
        
        <button
          onClick={() => navigate('/create')}
          className="w-full mb-4 py-4 bg-gradient-to-r from-violet-900 to-purple-900 border border-violet-500/40 rounded-lg text-white text-xl font-medium tracking-wide hover:from-violet-800 hover:to-purple-800 transition-all shadow-[0_0_30px_rgba(139,92,246,0.2)]"
        >
          {L.createRoom}
        </button>
        <button
          onClick={() => navigate('/join')}
          className="w-full py-4 bg-black/40 backdrop-blur-md border border-white/20 rounded-lg text-white text-xl font-medium tracking-wide hover:bg-black/60 transition-all"
        >
          {L.joinRoom}
        </button>
      </div>
    </div>
  );
}
