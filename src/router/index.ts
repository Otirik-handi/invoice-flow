import { createWebHistory, createRouter } from 'vue-router';
import { getCurrentUser } from '../api';
import { useAuthStore } from '../stores/authStore';
import LoginView from '../views/auth/LoginView.vue';
import RegisterView from '../views/auth/RegisterView.vue';
import InvoiceListView from '../views/invoice/InvoiceListView.vue';
import DashboardView from '../views/DashboardView.vue';
import ClientsView from '../views/ClientsView.vue';
import SettingsView from '../views/SettingsView.vue';
import AppLayout from '../components/layout/AppLayout.vue';

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { guestOnly: true },
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requireAuth: true },
    children: [
      {
        path: '/invoices',
        name: 'InvoiceList',
        component: InvoiceListView,
      },
      {
        path: '/invoices/new',
        redirect: '/invoices',
      },
      {
        path: '/invoices/:id',
        redirect: '/invoices',
      },
      {
        path: '/invoices/:id/edit',
        redirect: '/invoices',
      },
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: DashboardView,
      },
      {
        path: '/clients',
        name: 'Clients',
        component: ClientsView,
      },
      {
        path: '/settings',
        name: 'Settings',
        component: SettingsView,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  let fbUser;
  try {
    fbUser = await getCurrentUser();
  } catch (e) {
    console.warn('Auth guard: getCurrentUser failed', e);
    fbUser = null;
  }

  const requiresAuth = to.matched.some((r) => r.meta.requireAuth);
  const guestOnly = to.matched.some((r) => r.meta.guestOnly);

  if (requiresAuth && !fbUser) {
    return { name: 'Login' };
  }
  if (guestOnly && fbUser) {
    return { name: 'Dashboard' };
  }

  // 确认 auth 后，等待 Firestore 用户文档加载完成
  if (fbUser) {
    const authStore = useAuthStore();
    authStore.init();
    await authStore.waitForUser();
  }
});

export default router;
