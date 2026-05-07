import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/authStore';

const app = createApp(App);
app.use(createPinia());
app.use(router);

// 初始化 auth 监听（必须在 mount 前，确保路由守卫能读到 loading 状态）
const authStore = useAuthStore();
authStore.init();

app.mount('#app');
