import { createWebHistory, createRouter } from 'vue-router';
import { getCurrentUser } from '../api/auth';
import LoginView from '../views/auth/LoginView.vue';
import RegisterView from '../views/auth/RegisterView.vue';
import InvoiceListView from '../views/invoice/InvoiceListView.vue';
import InvoiceDetailView from '../views/invoice/InvoiceDetailView.vue';
import InvoiceFormView from '../views/invoice/InvoiceFormView.vue';
import DashboardView from '../views/DashboardView.vue';
import ClientsView from '../views/ClientsView.vue';
import SettingsView from '../views/SettingsView.vue';
import AppLayout from '../components/layout/AppLayout.vue';

const routes = [
  {
    path: '/',
    redirect: '/invoices',
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
        name: 'InvoiceCreate',
        component: InvoiceFormView,
      },
      {
        path: '/invoices/:id',
        name: 'InvoiceDetail',
        component: InvoiceDetailView,
      },
      {
        path: '/invoices/:id/edit',
        name: 'InvoiceEdit',
        component: InvoiceFormView,
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

router.beforeEach(async (to, from, next) => {
  const user = await getCurrentUser();
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth);
  const guestOnly = to.matched.some((r) => r.meta.guestOnly);

  if (requiresAuth && !user) {
    next({ name: 'Login' });
  } else if (guestOnly && user) {
    next({ name: 'InvoiceList' });
  } else {
    next();
  }
});

export default router;
