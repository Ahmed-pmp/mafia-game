import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function TopBar({ lang, setLang, soundOn, setSoundOn }) {
  return (
    <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-40">
      <button
        onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
        className="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-xs text-white/70 hover:text-white transition"
      >
        {lang === 'en' ? 'العربية' : 'English'}
      </button>
      <button
        onClick={() => setSoundOn(!soundOn)}
        className="p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white/70 hover:text-white transition"
      >
        {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>
    </div>
  );
}
