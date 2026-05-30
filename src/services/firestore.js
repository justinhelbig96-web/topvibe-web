import {
  collection, doc, setDoc, getDoc, getDocs,
  query, orderBy, limit, increment, serverTimestamp, arrayUnion, deleteDoc,
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

// Shared track pool — every user contributes their top tracks
export const contributeUserTracks = async (userId, tracks) => {
  const count = tracks.slice(0, 50).length;
  // Always update trackCount, even if 0
  await setDoc(doc(db, 'userStats', userId), {
    trackCount: count,
  }, { merge: true });
  if (count === 0) return;
  const ops = tracks.slice(0, 50).map(t => {
    const trackData = {
      id: t.id,
      name: t.name,
      uri: t.uri || '',
      preview_url: t.preview_url || null,
      duration_ms: t.duration_ms || 0,
      artists: [{ name: t.artists?.[0]?.name || '' }],
      album: { images: [{ url: t.album?.images?.[0]?.url || '' }] },
    };
    return setDoc(doc(db, 'sharedTracks', t.id), {
      trackData,
      addedBy: arrayUnion(userId),
      addedAt: serverTimestamp(),
    }, { merge: true });
  });
  await Promise.all(ops);
};

export const getSharedTracks = async (limitCount = 200) => {
  const q = query(
    collection(db, 'sharedTracks'),
    orderBy('addedAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data().trackData, addedBy: d.data().addedBy || [] }));
};

// ===================== ADMIN =====================
export const ADMIN_EMAIL = 'justin.helbig96@icloud.com';

export const registerUser = async (userProfile) => {
  if (!userProfile?.id) return;
  await setDoc(doc(db, 'userStats', userProfile.id), {
    userId: userProfile.id,
    displayName: userProfile.display_name || 'User',
    avatar: userProfile.images?.[0]?.url || '',
    email: userProfile.email || '',
    lastActive: serverTimestamp(),
  }, { merge: true });
};

export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, 'userStats'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const banUser = async (userId) => {
  await setDoc(doc(db, 'bannedUsers', userId), {
    bannedAt: serverTimestamp(),
  });
};

export const unbanUser = async (userId) => {
  await deleteDoc(doc(db, 'bannedUsers', userId));
};

export const getBannedUsers = async () => {
  const snap = await getDocs(collection(db, 'bannedUsers'));
  return new Set(snap.docs.map(d => d.id));
};

export const isUserBanned = async (userId) => {
  const snap = await getDoc(doc(db, 'bannedUsers', userId));
  return snap.exists();
};
