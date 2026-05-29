import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDDvAp-V-ECUaIf3pigVp8Omu_QeoRlEfE',
  authDomain: 'topvibe-6fe8c.firebaseapp.com',
  projectId: 'topvibe-6fe8c',
  storageBucket: 'topvibe-6fe8c.firebasestorage.app',
  messagingSenderId: '470927096626',
  appId: '1:470927096626:web:3246d0211558dd922a352b',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
