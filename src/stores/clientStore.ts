import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as api from '../api';
import type { Client } from '../types';

export const useClientStore = defineStore('client', () => {
  const clients = ref<Client[]>([]);
  const loading = ref(false);

  let unsubscribe: (() => void) | null = null;

  function startListening(userId: string) {
    stopListening();
    loading.value = true;
    unsubscribe = api.subscribeClients(
      userId,
      (data) => {
        clients.value = data;
        loading.value = false;
      },
      (error) => {
        console.error('Client subscription error:', error);
        loading.value = false;
      },
    );
  }

  function stopListening() {
    unsubscribe?.();
    unsubscribe = null;
  }

  async function addClient(
    data: Parameters<typeof api.addClient>[0],
  ): Promise<string> {
    return api.addClient(data);
  }

  async function updateClient(
    id: string,
    data: Parameters<typeof api.updateClient>[1],
  ): Promise<void> {
    await api.updateClient(id, data);
  }

  async function deleteClient(id: string): Promise<void> {
    await api.deleteClient(id);
  }

  return {
    clients,
    loading,
    startListening,
    stopListening,
    addClient,
    updateClient,
    deleteClient,
  };
});
