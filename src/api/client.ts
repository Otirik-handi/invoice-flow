import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Client } from '../types';

export async function fetchClients(userId: string): Promise<Client[]> {
  const q = query(
    collection(db, 'clients'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Client);
}

export async function addClient(
  data: Pick<Client, 'name' | 'email' | 'address' | 'phone'> & { userId: string },
): Promise<string> {
  const docRef = await addDoc(collection(db, 'clients'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateClient(
  id: string,
  data: Partial<Pick<Client, 'name' | 'email' | 'address' | 'phone'>>,
): Promise<void> {
  await updateDoc(doc(db, 'clients', id), data);
}

export async function deleteClient(id: string): Promise<void> {
  await deleteDoc(doc(db, 'clients', id));
}

export function subscribeClients(
  userId: string,
  onNext: (clients: Client[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const q = query(
    collection(db, 'clients'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );

  let isFirstSnapshot = true;

  const unsubscribe = onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snapshot) => {
      if (isFirstSnapshot) {
        isFirstSnapshot = false;
        const clients = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Client);
        onNext(clients);
        return;
      }

      if (snapshot.metadata.fromCache) return;

      const clients = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Client);
      onNext(clients);
    },
    (error) => {
      onError?.(error);
    },
  );

  return unsubscribe;
}
