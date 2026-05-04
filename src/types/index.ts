// 定义Invoice、Client、User类型

import { type Timestamp } from 'firebase/firestore';

type CurrencyType = 'CNY' | 'USD' | 'EUR';

export interface User {
  uid: string; // Firebase Auth UID，与 Auth 用户一致
  email: string; // 注册邮箱
  displayName: string; // 显示名称
  companyName: string; // 公司/个人名称
  address: string; // 地址
  phone: string; // 电话
  logoUrl: string; // Logo图片 Firebase Storage URL
  defaultTaxRate: number; // 默认税率，默认值：0
  defaultCurrency: CurrencyType; // 默认货币，默认值：CNY
  defaultDueDays: number; // 默认逾期天数，默认值：30
  createdAt: Timestamp; // 注册时间
}

export interface Invoice {
  id: string; // Firestore 文档ID
  userId: string; // 所属用户（用于安全规则筛选）
  invoiceNumber: string; // 发票编号，格式 `INV-{date}-{random}`
  status: InvoiceStatus; // 枚举值: draft | sent | paid | overdue
  client: InvoiceClient; // 客户信息
  items: Item[]; // 商品明细
  subtotal: number; // 小计（自动计算）
  taxRate: number; // 税率百分比
  taxAmount: number; // 税额（自动计算）
  total: number; // 总计（自动计算）
  currency: CurrencyType; // 货币类型
  notes: string; // 备注
  dueDate: Timestamp; // 到期日期
  createdAt: Timestamp; // 创建时间
  updatedAt: Timestamp; // 最近修改时间
}

// 发票中的客户信息（内嵌对象，区别于 Clients 集合中的 Client）
export interface InvoiceClient {
  name: string;
  email: string;
  address: string;
  phone: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface Client {
  id: string; // Firestore 文档ID
  userId: string; // 所属用户
  name: string; // 客户名称
  email: string; //客户邮箱
  address: string; // 客户地址
  phone: string; // 客户电话
  createdAt: Timestamp; // 创建时间
}

export interface Item {
  description: string; // 商品描述
  quantity: number; // 数量
  unitPrice: number; // 单价
  total: number; // 金额（自动计算 = quantity * unitPrice）
}
