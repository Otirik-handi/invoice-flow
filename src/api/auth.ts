/** 封装所有和用户认证相关函数
 *
 * */

import { type User } from '../types';
import { auth, db } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

async function registerUser(
  email: string,
  password: string,
  displayName: string,
): Promise<User | null> {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const { uid } = userCredential.user;

  const userData: User = {
    uid,
    email,
    displayName,
    companyName: '',
    address: '',
    phone: '',
    logoUrl: '',
    defaultCurrency: 'CNY',
    defaultDueDays: 30,
    defaultTaxRate: 0,
    createdAt: serverTimestamp() as Timestamp,
  };

  await setDoc(doc(db, 'users', uid), userData);
  return userData;
}

async function loginUser(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const { uid } = userCredential.user;

  const userSnap = await getDoc(doc(db, 'users', uid));
  if (!userSnap.exists()) {
    throw new Error('用户数据不存在');
  }

  return userSnap.data() as User;
}

async function logoutUser(): Promise<void> {
  await signOut(auth);
}

async function getCurrentUser(uid: string): Promise<User | null> {
  const userSnap = await getDoc(doc(db, 'user', uid));
  if (!userSnap.exists()) return null;
  return userSnap.data() as User;
}

export { registerUser, loginUser, logoutUser, getCurrentUser };
