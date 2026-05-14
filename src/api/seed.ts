import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

const testClients = [
  { name: '字节跳动', email: 'billing@bytedance.com', address: '北京市海淀区知春路甲48号', phone: '010-12345678' },
  { name: '阿里巴巴', email: 'ap@alibaba-inc.com', address: '杭州市余杭区文一西路969号', phone: '0571-88888888' },
  { name: '腾讯科技', email: 'finance@tencent.com', address: '深圳市南山区科技中一路', phone: '0755-86013388' },
  { name: '小米科技', email: 'pay@xiaomi.com', address: '北京市海淀区清河中街68号', phone: '010-60606666' },
  { name: '网易集团', email: 'caiwu@163.com', address: '杭州市滨江区网商路599号', phone: '0571-89853333' },
  { name: 'Acme Corp', email: 'hello@acme.com', address: '742 Evergreen Terrace, Springfield', phone: '+1-555-0100' },
  { name: 'TechStar GmbH', email: 'info@techstar.de', address: 'Musterstr. 42, 10115 Berlin', phone: '+49-30-123456' },
];

const testItemsList = [
  [
    { description: 'UI/UX 设计服务', quantity: 1, unitPrice: 15000, total: 15000 },
    { description: '前端开发 (80h × ￥300)', quantity: 80, unitPrice: 300, total: 24000 },
  ],
  [
    { description: '服务器托管 (3个月)', quantity: 3, unitPrice: 2000, total: 6000 },
  ],
  [
    { description: '品牌VI设计', quantity: 1, unitPrice: 25000, total: 25000 },
    { description: '名片设计', quantity: 500, unitPrice: 2, total: 1000 },
    { description: '宣传册设计', quantity: 200, unitPrice: 15, total: 3000 },
  ],
  [
    { description: 'API 开发 (120h × $120)', quantity: 120, unitPrice: 120, total: 14400 },
    { description: '数据库优化服务', quantity: 1, unitPrice: 3000, total: 3000 },
  ],
  [
    { description: 'WordPress 网站搭建', quantity: 1, unitPrice: 8000, total: 8000 },
    { description: 'SEO 优化服务', quantity: 1, unitPrice: 5000, total: 5000 },
    { description: '每月维护 (6个月)', quantity: 6, unitPrice: 1000, total: 6000 },
  ],
  [
    { description: 'Technical Consulting (40h × $250)', quantity: 40, unitPrice: 250, total: 10000 },
  ],
  [
    { description: '云架构设计', quantity: 1, unitPrice: 35000, total: 35000 },
    { description: 'Kubernetes 集群搭建', quantity: 1, unitPrice: 20000, total: 20000 },
    { description: '监控系统部署', quantity: 1, unitPrice: 12000, total: 12000 },
  ],
];

const statuses: Array<'draft' | 'sent' | 'paid' | 'overdue'> = [
  'draft', 'sent', 'paid', 'overdue', 'sent', 'paid', 'draft',
];

function randomDate(daysAgo: number): Timestamp {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  return Timestamp.fromDate(d);
}

function generateInvoiceNumber(index: number): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  return `INV-${dateStr}-${String(index).padStart(4, '0')}`;
}

export async function seedTestData(userId: string) {
  const results: Array<{ index: number; id: string }> = [];

  for (let i = 0; i < testClients.length; i++) {
    const createdAt = randomDate(90);
    const dueDate = new Date(createdAt.toDate());
    dueDate.setDate(dueDate.getDate() + 30);

    const status = statuses[i];
    const items = testItemsList[i].map((item) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    }));
    const subtotal = items.reduce((s, item) => s + item.total, 0);
    const taxRate = [0, 6, 13, 0, 6, 13, 6][i];
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    const currency = i < 5 ? 'CNY' : 'USD';

    const docRef = await addDoc(collection(db, 'invoices'), {
      userId,
      invoiceNumber: generateInvoiceNumber(i + 1),
      status,
      client: testClients[i],
      items,
      subtotal,
      taxRate,
      taxAmount,
      total,
      currency,
      notes: i % 2 === 0 ? '感谢合作！' : '',
      dueDate: Timestamp.fromDate(dueDate),
      createdAt,
      updatedAt: createdAt,
    });

    results.push({ index: i + 1, id: docRef.id });
  }

  return results;
}
