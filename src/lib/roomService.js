import {
  db,
  ref,
  set,
  get,
  update,
  remove,
  serverTimestamp,
  generateRoomCode,
  generatePlayerId,
} from './firebase';
import {
  assignRoles,
  resolveMafiaTarget,
  resolveVoting,
  checkWin,
  PHASE_DURATIONS,
} from './gameLogic';

export const createRoom = async (hostName) => {
  let roomCode;
  let exists = true;
  while (exists) {
    roomCode = generateRoomCode();
    const snap = await get(ref(db, `rooms/${roomCode}`));
    exists = snap.exists();
  }
  
  const password = Math.floor(1000 + Math.random() * 9000).toString();
  const playerId = generatePlayerId();
  
  const roomData = {
    code: roomCode,
    password: password,
    createdAt: serverTimestamp(),
    hostId: playerId,
    state: 'lobby',
    nightSubPhase: null,
    round: 1,
    players: {
      [playerId]: {
        id: playerId,
        name: hostName,
        isHost: true,
        alive: true,
        role: null,
        joinedAt: Date.now(),
      },
    },
    timer: null,
    timerEndsAt: null,
    nightResult: null,
    voteResult: null,
    elderResult: null,
    mafiaMessages: null,
    mafiaTargets: null,
    doctorTarget: null,
    doctorLastTarget: null,
    elderTarget: null,
    voteDecisions: null,
    votes: null,
    winner: null,
    stats: {
      doctorSaves: 0,
      doctorSuccessful: 0,
      elderInvestigations: 0,
      elderCorrectMafia: 0,
      elderCorrectCitizen: 0,
    },
    rolesAcknowledged: null,
  };
  
  await set(ref(db, `rooms/${roomCode}`), roomData);
  return { roomCode, password, playerId };
};

export const joinRoom = async (roomCode, password, playerName) => {
  const roomRef = ref(db, `rooms/${roomCode}`);
  const snap = await get(roomRef);
  
  if (!snap.exists()) throw new Error('ROOM_NOT_FOUND');
  
  const room = snap.val();
  
  if (room.password !== password) throw new Error('WRONG_PASSWORD');
  if (room.state !== 'lobby') throw new Error('GAME_ALREADY_STARTED');
  
  const playerCount = room.players ? Object.keys(room.players).length : 0;
  if (playerCount >= 15) throw new Error('ROOM_FULL');
  
  const playerId = generatePlayerId();
  
  await update(ref(db, `rooms/${roomCode}/players/${playerId}`), {
    id: playerId,
    name: playerName,
    isHost: false,
    alive: true,
    role: null,
    joinedAt: Date.now(),
  });
  
  return { playerId };
};

export const startGame = async (roomCode) => {
  const roomSnap = await get(ref(db, `rooms/${roomCode}`));
  if (!roomSnap.exists()) throw new Error('ROOM_NOT_FOUND');
  
  const room = roomSnap.val();
  const playerIds = Object.keys(room.players || {});
  
  if (playerIds.length < 9) throw new Error('NOT_ENOUGH_PLAYERS');
  
  const roleAssignment = assignRoles(playerIds);
  
  const updates = {};
  playerIds.forEach(pid => {
    updates[`players/${pid}/role`] = roleAssignment[pid];
  });
  updates['state'] = 'role-reveal';
  updates['rolesAcknowledged'] = {};
  
  await update(ref(db, `rooms/${roomCode}`), updates);
};

export const acknowledgeRole = async (roomCode, playerId) => {
  await update(ref(db, `rooms/${roomCode}/rolesAcknowledged`), {
    [playerId]: true,
  });
  
  const snap = await get(ref(db, `rooms/${roomCode}`));
  const room = snap.val();
  const playerIds = Object.keys(room.players || {});
  const acknowledged = Object.keys(room.rolesAcknowledged || {});
  
  if (acknowledged.length >= playerIds.length) {
    await startNightPhase(roomCode);
  }
};

export const startNightPhase = async (roomCode) => {
  const updates = {
    state: 'night',
    nightSubPhase: 'intro',
    mafiaMessages: null,
    mafiaTargets: null,
    doctorTarget: null,
    elderTarget: null,
    elderResult: null,
    nightResult: null,
    voteDecisions: null,
    votes: null,
    voteResult: null,
    rolesAcknowledged: null,
  };
  await update(ref(db, `rooms/${roomCode}`), updates);
  
  setTimeout(async () => {
    await update(ref(db, `rooms/${roomCode}`), {
      nightSubPhase: 'mafia-chat',
      timerEndsAt: Date.now() + PHASE_DURATIONS.mafiaChat * 1000,
    });
  }, 3000);
};

export const sendMafiaMessage = async (roomCode, playerId, playerName, text, isPointing = false) => {
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  await update(ref(db, `rooms/${roomCode}/mafiaMessages/${messageId}`), {
    from: playerName,
    fromId: playerId,
    text,
    isPointing,
    timestamp: Date.now(),
  });
};

export const setMafiaTarget = async (roomCode, mafiaId, targetId) => {
  await update(ref(db, `rooms/${roomCode}/mafiaTargets`), {
    [mafiaId]: targetId,
  });
};

export const endMafiaChatEarly = async (roomCode) => {
  await update(ref(db, `rooms/${roomCode}`), {
    nightSubPhase: 'mafia-select',
    timerEndsAt: Date.now() + PHASE_DURATIONS.mafiaSelect * 1000,
  });
};

export const resolveMafiaPhase = async (roomCode) => {
  const snap = await get(ref(db, `rooms/${roomCode}`));
  const room = snap.val();
  if (!room) return;
  
  const target = resolveMafiaTarget(room.mafiaTargets || {}, room.players);
  
  await update(ref(db, `rooms/${roomCode}`), {
    nightResult: { mafiaTarget: target, doctorTarget: null },
    nightSubPhase: 'doctor',
    timerEndsAt: Date.now() + PHASE_DURATIONS.doctor * 1000,
  });
};

export const setDoctorTarget = async (roomCode, targetId) => {
  await update(ref(db, `rooms/${roomCode}`), { doctorTarget: targetId });
};

export const resolveDoctorPhase = async (roomCode) => {
  const snap = await get(ref(db, `rooms/${roomCode}`));
  const room = snap.val();
  if (!room) return;
  
  const doctor = Object.values(room.players).find(p => p.role === 'doctor');
  const doctorAlive = doctor && doctor.alive;
  
  let finalDoctorTarget = null;
  
  if (doctorAlive) {
    finalDoctorTarget = room.doctorTarget;
    if (!finalDoctorTarget) {
      const valid = Object.values(room.players).filter(p => p.alive && p.id !== room.doctorLastTarget);
      if (valid.length > 0) {
        finalDoctorTarget = valid[Math.floor(Math.random() * valid.length)].id;
      }
    }
    
    const wasSuccessful = finalDoctorTarget === room.nightResult?.mafiaTarget;
    const newStats = {
      ...room.stats,
      doctorSaves: (room.stats?.doctorSaves || 0) + 1,
      doctorSuccessful: (room.stats?.doctorSuccessful || 0) + (wasSuccessful ? 1 : 0),
    };
    
    await update(ref(db, `rooms/${roomCode}`), {
      nightResult: { ...room.nightResult, doctorTarget: finalDoctorTarget },
      doctorLastTarget: finalDoctorTarget,
      stats: newStats,
      nightSubPhase: 'elder',
      timerEndsAt: Date.now() + PHASE_DURATIONS.elder * 1000,
    });
  } else {
    await update(ref(db, `rooms/${roomCode}`), {
      nightResult: { ...room.nightResult, doctorTarget: null },
      nightSubPhase: 'elder',
      timerEndsAt: Date.now() + PHASE_DURATIONS.elder * 1000,
    });
  }
};

export const setElderTarget = async (roomCode, targetId) => {
  await update(ref(db, `rooms/${roomCode}`), { elderTarget: targetId });
};

export const resolveElderPhase = async (roomCode) => {
  const snap = await get(ref(db, `rooms/${roomCode}`));
  const room = snap.val();
  if (!room) return;
  
  const elder = Object.values(room.players).find(p => p.role === 'elder');
  const elderAlive = elder && elder.alive;
  
  if (elderAlive) {
    let finalElderTarget = room.elderTarget;
    if (!finalElderTarget) {
      const valid = Object.values(room.players).filter(p => p.alive && p.id !== elder.id);
      if (valid.length > 0) {
        finalElderTarget = valid[Math.floor(Math.random() * valid.length)].id;
      }
    }
    if (finalElderTarget) {
      const target = room.players[finalElderTarget];
      const isMafia = target.role === 'mafia';
      
      const newStats = {
        ...room.stats,
        elderInvestigations: (room.stats?.elderInvestigations || 0) + 1,
        elderCorrectMafia: (room.stats?.elderCorrectMafia || 0) + (isMafia ? 1 : 0),
        elderCorrectCitizen: (room.stats?.elderCorrectCitizen || 0) + (!isMafia ? 1 : 0),
      };
      
      await update(ref(db, `rooms/${roomCode}`), {
        elderResult: { targetId: finalElderTarget, isMafia },
        stats: newStats,
        nightSubPhase: 'results',
      });
    } else {
      await update(ref(db, `rooms/${roomCode}`), { nightSubPhase: 'results' });
    }
  } else {
    await update(ref(db, `rooms/${roomCode}`), { nightSubPhase: 'results' });
  }
  
  setTimeout(async () => {
    await proceedToDay(roomCode);
  }, PHASE_DURATIONS.elderResult * 1000);
};

export const proceedToDay = async (roomCode) => {
  const snap = await get(ref(db, `rooms/${roomCode}`));
  const room = snap.val();
  if (!room) return;
  
  const mafiaTarget = room.nightResult?.mafiaTarget;
  const protectedId = room.nightResult?.doctorTarget;
  
  let killedId = null;
  if (mafiaTarget != null && mafiaTarget !== protectedId) {
    killedId = mafiaTarget;
  }
  
  const updatedPlayers = { ...room.players };
  if (killedId && updatedPlayers[killedId]) {
    updatedPlayers[killedId] = { ...updatedPlayers[killedId], alive: false };
  }
  
  const winCheck = checkWin(updatedPlayers);
  
  if (winCheck) {
    await update(ref(db, `rooms/${roomCode}`), {
      players: updatedPlayers,
      winner: winCheck,
      state: 'gameover',
      nightResult: { ...room.nightResult, killedId },
    });
    return;
  }
  
  await update(ref(db, `rooms/${roomCode}`), {
    players: updatedPlayers,
    nightResult: { ...room.nightResult, killedId },
    state: 'day',
  });
};

export const startDiscussion = async (roomCode) => {
  await update(ref(db, `rooms/${roomCode}`), {
    state: 'discussion',
    timerEndsAt: Date.now() + PHASE_DURATIONS.discussion * 1000,
  });
};

export const skipDiscussion = async (roomCode) => {
  await update(ref(db, `rooms/${roomCode}`), {
    state: 'vote-decision',
    timerEndsAt: Date.now() + PHASE_DURATIONS.voteDecision * 1000,
    voteDecisions: null,
  });
};

export const proceedToVoteDecision = async (roomCode) => {
  await update(ref(db, `rooms/${roomCode}`), {
    state: 'vote-decision',
    timerEndsAt: Date.now() + PHASE_DURATIONS.voteDecision * 1000,
    voteDecisions: null,
  });
};

export const submitVoteDecision = async (roomCode, playerId, decision) => {
  await update(ref(db, `rooms/${roomCode}/voteDecisions`), {
    [playerId]: decision,
  });
  
  const snap = await get(ref(db, `rooms/${roomCode}`));
  const room = snap.val();
  const alive = Object.values(room.players).filter(p => p.alive);
  const decisions = room.voteDecisions || {};
  
  if (Object.keys(decisions).length >= alive.length) {
    await resolveVoteDecision(roomCode);
  }
};

export const resolveVoteDecision = async (roomCode) => {
  const snap = await get(ref(db, `rooms/${roomCode}`));
  const room = snap.val();
  if (!room) return;
  
  const decisions = room.voteDecisions || {};
  const alive = Object.values(room.players).filter(p => p.alive);
  const yesCount = Object.values(decisions).filter(d => d === 'yes').length;
  
  if (yesCount > alive.length / 2) {
    await update(ref(db, `rooms/${roomCode}`), {
      state: 'voting',
      votes: null,
      timerEndsAt: Date.now() + PHASE_DURATIONS.voting * 1000,
    });
  } else {
    await update(ref(db, `rooms/${roomCode}`), {
      round: (room.round || 1) + 1,
    });
    await startNightPhase(roomCode);
  }
};

export const submitVote = async (roomCode, playerId, targetId) => {
  await update(ref(db, `rooms/${roomCode}/votes`), {
    [playerId]: targetId,
  });
  
  const snap = await get(ref(db, `rooms/${roomCode}`));
  const room = snap.val();
  const alive = Object.values(room.players).filter(p => p.alive);
  const votes = room.votes || {};
  
  if (Object.keys(votes).length >= alive.length) {
    await resolveVotingPhase(roomCode);
  }
};

export const resolveVotingPhase = async (roomCode) => {
  const snap = await get(ref(db, `rooms/${roomCode}`));
  const room = snap.val();
  if (!room) return;
  if (room.state !== 'voting') return;
  
  const result = resolveVoting(room.votes || {}, room.players);
  
  let updatedPlayers = room.players;
  if (result.eliminatedId) {
    updatedPlayers = {
      ...room.players,
      [result.eliminatedId]: {
        ...room.players[result.eliminatedId],
        alive: false,
      },
    };
  }
  
  const winCheck = checkWin(updatedPlayers);
  
  if (winCheck) {
    await update(ref(db, `rooms/${roomCode}`), {
      players: updatedPlayers,
      winner: winCheck,
      voteResult: result,
      state: 'gameover',
    });
    return;
  }
  
  await update(ref(db, `rooms/${roomCode}`), {
    players: updatedPlayers,
    voteResult: result,
    state: 'vote-result',
  });
};

export const continueAfterVoteResult = async (roomCode) => {
  const snap = await get(ref(db, `rooms/${roomCode}`));
  const room = snap.val();
  if (!room) return;
  
  await update(ref(db, `rooms/${roomCode}`), {
    round: (room.round || 1) + 1,
    voteResult: null,
  });
  await startNightPhase(roomCode);
};

export const leaveRoom = async (roomCode, playerId) => {
  await remove(ref(db, `rooms/${roomCode}/players/${playerId}`));
  
  const snap = await get(ref(db, `rooms/${roomCode}/players`));
  if (!snap.exists()) {
    await remove(ref(db, `rooms/${roomCode}`));
  }
};

export const handlePhaseTimeout = async (roomCode, currentState, currentSubPhase) => {
  if (currentState === 'night') {
    if (currentSubPhase === 'mafia-chat') {
      await update(ref(db, `rooms/${roomCode}`), {
        nightSubPhase: 'mafia-select',
        timerEndsAt: Date.now() + PHASE_DURATIONS.mafiaSelect * 1000,
      });
    } else if (currentSubPhase === 'mafia-select') {
      await resolveMafiaPhase(roomCode);
    } else if (currentSubPhase === 'doctor') {
      await resolveDoctorPhase(roomCode);
    } else if (currentSubPhase === 'elder') {
      await resolveElderPhase(roomCode);
    }
  } else if (currentState === 'discussion') {
    await proceedToVoteDecision(roomCode);
  } else if (currentState === 'vote-decision') {
    await resolveVoteDecision(roomCode);
  } else if (currentState === 'voting') {
    await resolveVotingPhase(roomCode);
  }
};
