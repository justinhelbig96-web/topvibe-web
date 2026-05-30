import {
  collection, doc, setDoc, getDoc, getDocs,
  query, orderBy, limit, increment, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const saveVote = async (userId, track, vote, userProfile) => {
  const trackData = {
    id: track.id,
    name: track.name,
    uri: track.uri || '',
    duration_ms: track.duration_ms || 0,
    artistName: track.artists?.map(a => a.name).join(', ') || '',
    albumArt: track.album?.images?.[0]?.url || '',
  };

  await setDoc(doc(db, 'userVotes', userId, 'votes', track.id), {
    vote, trackData, timestamp: serverTimestamp(),
  });

  await setDoc(doc(db, 'trackStats', track.id), {
    trackData,
    fireCount: increment(vote === 'fire' ? 1 : 0),
    skipCount: increment(vote === 'skip' ? 1 : 0),
    lastVoted: serverTimestamp(),
  }, { merge: true });

  if (userProfile) {
    await setDoc(doc(db, 'userStats', userId), {
      userId,
      displayName: userProfile.display_name || 'User',
      avatar: userProfile.images?.[0]?.url || '',
      fireCount: increment(vote === 'fire' ? 1 : 0),
      skipCount: increment(vote === 'skip' ? 1 : 0),
      totalVotes: increment(1),
      lastActive: serverTimestamp(),
    }, { merge: true });
  }
};

export const getLeaderboard = async (limitCount = 20) => {
  const q = query(
    collection(db, 'trackStats'),
    orderBy('fireCount', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data().trackData, fireCount: d.data().fireCount, skipCount: d.data().skipCount }));
};

export const getTrackStats = async (trackId) => {
  const snap = await getDoc(doc(db, 'trackStats', trackId));
  if (!snap.exists()) return { fireCount: 0, skipCount: 0 };
  return { fireCount: snap.data().fireCount || 0, skipCount: snap.data().skipCount || 0 };
};

export const getUserVotes = async (userId) => {
  const snap = await getDocs(collection(db, 'userVotes', userId, 'votes'));
  return snap.docs.map(d => d.data());
};

export const getUserLeaderboard = async (limitCount = 20) => {
  const q = query(
    collection(db, 'userStats'),
    orderBy('fireCount', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
};
