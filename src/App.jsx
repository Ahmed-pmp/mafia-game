import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import EntryScreen from './screens/EntryScreen';
import CreateRoomScreen from './screens/CreateRoomScreen';
import JoinRoomScreen from './screens/JoinRoomScreen';
import GameRoom from './screens/GameRoom';

export default function App() {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('mafia-lang') || 'en';
  });
  const [soundOn, setSoundOn] = useState(() => {
    return localStorage.getItem('mafia-sound') !== 'false';
  });
  
  useEffect(() => {
    localStorage.setItem('mafia-lang', lang);
  }, [lang]);
  
  useEffect(() => {
    localStorage.setItem('mafia-sound', soundOn);
  }, [soundOn]);
  
  const settings = { lang, setLang, soundOn, setSoundOn };
  
  return (
    <Routes>
      <Route path="/" element={<EntryScreen {...settings} />} />
      <Route path="/create" element={<CreateRoomScreen {...settings} />} />
      <Route path="/join" element={<JoinRoomScreen {...settings} />} />
      <Route path="/join/:roomCode" element={<JoinRoomScreen {...settings} />} />
      <Route path="/room/:roomCode" element={<GameRoom {...settings} />} />
    </Routes>
  );
}
