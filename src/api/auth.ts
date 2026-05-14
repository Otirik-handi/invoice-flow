/** 封装所有和用户认证相关函数
 *
 * */

import { type User } from '../types';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

async function registerUser(
  email: string,
  password: string,
  displayName: string,
): Promise<User | null> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
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
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
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

async function fetchUserDoc(uid: string): Promise<User | null> {
  const userSnap = await getDoc(doc(db, 'users', uid));
  if (!userSnap.exists()) return null;
  return userSnap.data() as User;
}

/** 返回当前 Firebase Auth 用户（等待 auth 状态恢复），用于路由守卫等场景 */
function getCurrentUser(): Promise<{ uid: string } | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(null);
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      clearTimeout(timeout);
      unsubscribe();
      resolve(user ? { uid: user.uid } : null);
    });
  });
}

async function updateUserDoc(
  uid: string,
  data: Partial<Pick<User, 'displayName' | 'companyName' | 'address' | 'phone' | 'defaultTaxRate' | 'defaultCurrency' | 'defaultDueDays'>>,
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), data);
}

export { registerUser, loginUser, logoutUser, fetchUserDoc, getCurrentUser, updateUserDoc };
