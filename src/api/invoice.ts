import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Invoice, CreateInvoicePayload } from '../types';

function generateInvoiceNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `INV-${dateStr}-${random}`;
}

export async function fetchInvoices(userId: string): Promise<Invoice[]> {
  const q = query(
    collection(db, 'invoices'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Invoice);
}

export async function fetchInvoiceById(id: string): Promise<Invoice | null> {
  const docSnap = await getDoc(doc(db, 'invoices', id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Invoice;
}

export async function createInvoice(
  data: CreateInvoicePayload,
): Promise<string> {
  const items = data.items.map((item) => ({
    ...item,
    total: item.quantity * item.unitPrice,
  }));
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * (data.taxRate / 100);
  const total = subtotal + taxAmount;

  const docRef = await addDoc(collection(db, 'invoices'), {
    ...data,
    items,
    invoiceNumber: generateInvoiceNumber(),
    subtotal,
    taxAmount,
    total,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateInvoice(
  id: string,
  data: Partial<Invoice>,
): Promise<void> {
  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  if (data.items || data.taxRate !== undefined) {
    const current = await fetchInvoiceById(id);
    if (current) {
      const items = (data.items || current.items).map((item) => ({
        ...item,
        total: item.quantity * item.unitPrice,
      }));
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const taxRate = data.taxRate ?? current.taxRate;
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;
      Object.assign(updateData, { items, subtotal, taxAmount, total });
    }
  }

  await updateDoc(doc(db, 'invoices', id), updateData);
}

export async function deleteInvoice(id: string): Promise<void> {
  await deleteDoc(doc(db, 'invoices', id));
}

export function subscribeInvoices(
  userId: string,
  callback: (invoices: Invoice[]) => void,
): () => void {
  const q = query(
    collection(db, 'invoices'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const invoices = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Invoice,
    );
    callback(invoices);
  });

  return unsubscribe;
}
