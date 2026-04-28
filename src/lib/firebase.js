import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, push, update, onValue, off, remove, onDisconnect, serverTimestamp } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAjtsAz0LbidvNNUcqckqA6CkOJKLhjtCQ",
  authDomain: "mafia-game-f65af.firebaseapp.com",
  databaseURL: "https://mafia-game-f65af-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mafia-game-f65af",
  storageBucket: "mafia-game-f65af.firebasestorage.app",
  messagingSenderId: "92683003191",
  appId: "1:92683003191:web:ff9d41277beeff3e8ae6b2"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export {
  ref,
  set,
  get,
  push,
  update,
  onValue,
  off,
  remove,
  onDisconnect,
  serverTimestamp,
};

export const generateRoomCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const generatePlayerId = () => {
  return 'player_' + Math.random().toString(36).substr(2, 9);
};
