import { defineStore } from 'pinia';
import { ref } from 'vue';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../api/firebase';
import { registerUser, loginUser, logoutUser, fetchUserDoc, updateUserDoc } from '../api';
import type { User } from '../types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(true);

  let unsubscribe: (() => void) | null = null;
  let _resolveReady: ((user: User | null) => void) | null = null;

  /** 供 route guard 等待用户数据就绪 */
  const _readyPromise = new Promise<User | null>((resolve) => {
    _resolveReady = resolve;
  });

  function init() {
    if (unsubscribe) return;
    unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          user.value = await fetchUserDoc(firebaseUser.uid);
        } else {
          user.value = null;
        }
      } catch (e) {
        console.error('Failed to load user data', e);
        user.value = null;
      } finally {
        loading.value = false;
        _resolveReady?.(user.value);
      }
    });
  }

  function cleanup() {
    unsubscribe?.();
    unsubscribe = null;
  }

  async function waitForUser(): Promise<User | null> {
    if (!loading.value) return user.value;
    return _readyPromise;
  }

  async function login(email: string, password: string) {
    const loggedInUser = await loginUser(email, password);
    user.value = loggedInUser;
  }

  async function register(email: string, password: string, name: string) {
    const newUser = await registerUser(email, password, name);
    user.value = newUser;
  }

  async function logout() {
    await logoutUser();
    user.value = null;
  }

  async function updateProfile(
    data: Parameters<typeof updateUserDoc>[1],
  ): Promise<void> {
    if (!user.value) throw new Error('用户未登录');
    await updateUserDoc(user.value.uid, data);
    Object.assign(user.value, data);
  }

  return { user, loading, init, cleanup, waitForUser, login, register, logout, updateProfile };
});
