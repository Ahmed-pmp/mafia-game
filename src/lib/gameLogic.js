export const assignRoles = (playerIds) => {
  const count = playerIds.length;
  const mafiaCount = count >= 13 ? 3 : 2;
  
  const roles = [];
  for (let i = 0; i < mafiaCount; i++) roles.push('mafia');
  roles.push('doctor');
  roles.push('elder');
  while (roles.length < count) roles.push('citizen');
  
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }
  
  const assignment = {};
  playerIds.forEach((id, idx) => {
    assignment[id] = roles[idx];
  });
  return assignment;
};

export const checkWin = (players) => {
  const alive = Object.values(players).filter(p => p.alive);
  const aliveMafia = alive.filter(p => p.role === 'mafia');
  const aliveCitizens = alive.filter(p => p.role !== 'mafia');
  const aliveDoctor = alive.find(p => p.role === 'doctor');
  
  if (aliveMafia.length === 0) return 'citizens';
  if (aliveMafia.length >= aliveCitizens.length && !aliveDoctor) return 'mafia';
  return null;
};

export const resolveMafiaTarget = (mafiaTargets, players) => {
  const aliveMafia = Object.values(players).filter(p => p.alive && p.role === 'mafia');
  const aliveTargets = Object.values(players).filter(p => p.alive && p.role !== 'mafia');
  
  if (aliveMafia.length === 0 || aliveTargets.length === 0) return null;
  
  const finalTargets = { ...mafiaTargets };
  aliveMafia.forEach(m => {
    if (!finalTargets[m.id]) {
      const random = aliveTargets[Math.floor(Math.random() * aliveTargets.length)];
      finalTargets[m.id] = random.id;
    }
  });
  
  const validVotes = aliveMafia
    .map(m => finalTargets[m.id])
    .filter(t => t);
  
  if (validVotes.length === 0) return null;
  
  const counts = {};
  validVotes.forEach(t => {
    counts[t] = (counts[t] || 0) + 1;
  });
  
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const topCount = sorted[0][1];
  const tied = sorted.filter(([, c]) => c === topCount);
  
  if (tied.length === 1) return tied[0][0];
  return tied[Math.floor(Math.random() * tied.length)][0];
};

export const resolveVoting = (votes, players) => {
  const counts = {};
  const breakdown = {};
  const skippedVoters = [];
  
  Object.entries(votes).forEach(([voterId, targetId]) => {
    const voter = players[voterId];
    if (!voter) return;
    
    if (targetId === 'skip' || !targetId) {
      skippedVoters.push(voter.name);
    } else {
      counts[targetId] = (counts[targetId] || 0) + 1;
      if (!breakdown[targetId]) breakdown[targetId] = [];
      breakdown[targetId].push(voter.name);
    }
  });
  
  const breakdownList = Object.entries(breakdown)
    .map(([targetId, voters]) => ({
      targetId,
      targetName: players[targetId]?.name || '?',
      voters,
      count: voters.length,
    }))
    .sort((a, b) => b.count - a.count);
  
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  let eliminatedId = null;
  let isTie = false;
  
  if (sorted.length > 0) {
    const topCount = sorted[0][1];
    const tied = sorted.filter(([, c]) => c === topCount);
    if (tied.length === 1) {
      eliminatedId = sorted[0][0];
    } else {
      isTie = true;
    }
  } else {
    isTie = true;
  }
  
  return {
    eliminatedId,
    eliminatedName: eliminatedId ? players[eliminatedId]?.name : null,
    isTie,
    breakdownList,
    skippedVoters,
  };
};

export const getShuffledList = (list, seed) => {
  const arr = [...list];
  let currentSeed = seed;
  const seededRandom = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const PHASE_DURATIONS = {
  mafiaChat: 30,
  mafiaSelect: 10,
  doctor: 10,
  elder: 10,
  elderResult: 3,
  day: 5,
  discussion: 60,
  voteDecision: 10,
  voting: 20,
};

export const ROLE_INFO = {
  mafia: { color: '#dc2626', icon: 'Skull' },
  doctor: { color: '#10b981', icon: 'Heart' },
  elder: { color: '#8b5cf6', icon: 'Eye' },
  citizen: { color: '#f59e0b', icon: 'Users' },
};
