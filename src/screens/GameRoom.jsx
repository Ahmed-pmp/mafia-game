import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFirebaseValue } from '../hooks/useFirebase';
import { useT } from '../locales/translations';
import { handlePhaseTimeout, leaveRoom } from '../lib/roomService';
import LobbyView from './views/LobbyView';
import RoleRevealView from './views/RoleRevealView';
import NightView from './views/NightView';
import DayView from './views/DayView';
import DiscussionView from './views/DiscussionView';
import VoteDecisionView from './views/VoteDecisionView';
import VotingView from './views/VotingView';
import VoteResultView from './views/VoteResultView';
import GameOverView from './views/GameOverView';

export default function GameRoom({ lang, setLang, soundOn, setSoundOn }) {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const L = useT(lang);
  
  const { data: room, loading } = useFirebaseValue(`rooms/${roomCode}`);
  const [playerId, setPlayerId] = useState(null);
  const [now, setNow] = useState(Date.now());
  
  useEffect(() => {
    const id = localStorage.getItem(`mafia-player-${roomCode}`);
    if (!id) {
      navigate(`/join/${roomCode}`);
      return;
    }
    setPlayerId(id);
  }, [roomCode, navigate]);
  
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (!room || !playerId) return;
    if (room.hostId !== playerId) return;
    if (!room.timerEndsAt) return;
    
    const remaining = room.timerEndsAt - now;
    if (remaining <= 0) {
      handlePhaseTimeout(roomCode, room.state, room.nightSubPhase).catch(console.error);
    }
  }, [room, playerId, roomCode, now]);
  
  const handleLeave = async () => {
    if (playerId) {
      await leaveRoom(roomCode, playerId).catch(console.error);
      localStorage.removeItem(`mafia-player-${roomCode}`);
    }
    navigate('/');
  };
  
  if (loading || !playerId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        {L.connecting}
      </div>
    );
  }
  
  if (!room) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
        <p className="text-xl mb-6">{L.roomNotFound}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-violet-900 rounded-lg text-white"
        >
          ← {L.back}
        </button>
      </div>
    );
  }
  
  const me = room.players?.[playerId];
  if (!me) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
        <p className="text-xl mb-6">You are no longer in this room.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-violet-900 rounded-lg text-white"
        >
          ← {L.back}
        </button>
      </div>
    );
  }
  
  const sharedProps = {
    room,
    me,
    playerId,
    roomCode,
    lang,
    setLang,
    soundOn,
    setSoundOn,
    L,
    isRTL: lang === 'ar',
    now,
    onLeave: handleLeave,
  };
  
  switch (room.state) {
    case 'lobby':
      return <LobbyView {...sharedProps} />;
    case 'role-reveal':
      return <RoleRevealView {...sharedProps} />;
    case 'night':
      return <NightView {...sharedProps} />;
    case 'day':
      return <DayView {...sharedProps} />;
    case 'discussion':
      return <DiscussionView {...sharedProps} />;
    case 'vote-decision':
      return <VoteDecisionView {...sharedProps} />;
    case 'voting':
      return <VotingView {...sharedProps} />;
    case 'vote-result':
      return <VoteResultView {...sharedProps} />;
    case 'gameover':
      return <GameOverView {...sharedProps} />;
    default:
      return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
          Unknown state: {room.state}
        </div>
      );
  }
}
