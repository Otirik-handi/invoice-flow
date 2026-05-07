import { defineStore } from 'pinia';
import { ref } from 'vue';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../api/firebase';
import { registerUser, loginUser, logoutUser, fetchUserDoc } from '../api/auth';
import type { User } from '../types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(true);

  // 监听 Firebase Auth 状态变化
  let unsubscribe: (() => void) | null = null;

  function init() {
    unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        user.value = await fetchUserDoc(firebaseUser.uid);
      } else {
        user.value = null;
      }
      loading.value = false;
    });
  }

  function cleanup() {
    unsubscribe?.();
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

  return { user, loading, init, cleanup, login, register, logout };
});
