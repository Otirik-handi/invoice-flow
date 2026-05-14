<template>
  <div class="clients">
    <div class="page-header">
      <span class="page-title">客户管理</span>
      <n-button type="primary" @click="openAddModal">
        <template #icon>
          <n-icon :component="PlusOutlined" />
        </template>
        添加客户
      </n-button>
    </div>

    <n-card :bordered="true" size="large">
      <n-spin :show="store.loading">
        <n-empty v-if="!store.loading && store.clients.length === 0" description="暂无客户数据">
          <template #extra>
            <n-button size="small" @click="openAddModal">添加第一个客户</n-button>
          </template>
        </n-empty>

        <n-data-table
          v-else
          :columns="columns"
          :data="store.clients"
          :bordered="false"
          :single-line="false"
          size="small"
        />
      </n-spin>
    </n-card>

    <!-- 添加/编辑弹窗 -->
    <n-modal
      :show="showModal"
      @update:show="showModal = $event"
      preset="card"
      :title="editingId ? '编辑客户' : '添加客户'"
      style="max-width: 520px; width: 100%;"
      :mask-closable="false"
    >
      <n-form label-placement="left" :label-width="80">
        <n-form-item label="客户名称" required :feedback="errors.name">
          <n-input v-model:value="form.name" placeholder="请输入客户名称" />
        </n-form-item>
        <n-form-item label="客户邮箱" required :feedback="errors.email">
          <n-input v-model:value="form.email" placeholder="请输入客户邮箱" />
        </n-form-item>
        <n-form-item label="联系电话">
          <n-input v-model:value="form.phone" placeholder="选填" />
        </n-form-item>
        <n-form-item label="客户地址">
          <n-input v-model:value="form.address" placeholder="选填" />
        </n-form-item>
      </n-form>

      <n-alert
        v-if="submitError"
        type="error"
        closable
        @close="submitError = ''"
        :bordered="false"
        class="form-alert"
      >
        {{ submitError }}
      </n-alert>

      <div class="modal-footer">
        <n-button @click="showModal = false">取消</n-button>
        <n-button type="primary" :loading="submitting" :disabled="submitting" @click="handleSubmit">
          {{ editingId ? '保存' : '添加' }}
        </n-button>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { h, ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDialog, useMessage } from 'naive-ui';
import {
  NButton,
  NCard,
  NDataTable,
  NEmpty,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NModal,
  NSpace,
  NSpin,
  NTag,
  NAlert,
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@vicons/antd';
import { useClientStore } from '../stores/clientStore';
import { useAuthStore } from '../stores/authStore';
import type { Client } from '../types';

const router = useRouter();
const dialog = useDialog();
const message = useMessage();
const store = useClientStore();
const authStore = useAuthStore();

const showModal = ref(false);
const editingId = ref<string | null>(null);
const submitting = ref(false);
const submitError = ref('');

const form = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
});

const errors = reactive({
  name: '',
  email: '',
});

function resetForm() {
  form.name = '';
  form.email = '';
  form.phone = '';
  form.address = '';
  errors.name = '';
  errors.email = '';
  submitError.value = '';
}

function openAddModal() {
  editingId.value = null;
  resetForm();
  showModal.value = true;
}

function openEditModal(client: Client) {
  editingId.value = client.id;
  resetForm();
  form.name = client.name;
  form.email = client.email;
  form.phone = client.phone || '';
  form.address = client.address || '';
  showModal.value = true;
}

function validate(): boolean {
  let valid = true;
  errors.name = '';
  errors.email = '';

  if (!form.name.trim()) {
    errors.name = '请输入客户名称';
    valid = false;
  }
  if (!form.email.trim()) {
    errors.email = '请输入客户邮箱';
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '邮箱格式不正确';
    valid = false;
  }

  return valid;
}

async function handleSubmit() {
  if (!validate()) return;
  submitting.value = true;
  submitError.value = '';

  try {
    if (editingId.value) {
      await store.updateClient(editingId.value, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
      });
      message.success('客户已更新');
    } else {
      await store.addClient({
        userId: authStore.user!.uid,
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
      });
      message.success('客户已添加');
    }
    showModal.value = false;
  } catch {
    submitError.value = '操作失败，请稍后重试';
  } finally {
    submitting.value = false;
  }
}

function handleDelete(client: Client) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除客户「${client.name}」吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await store.deleteClient(client.id);
        message.success('客户已删除');
      } catch {
        message.error('删除失败');
      }
    },
  });
}

const columns: DataTableColumns<Client> = [
  { title: '客户名称', key: 'name', width: 160 },
  { title: '邮箱', key: 'email', width: 200 },
  { title: '电话', key: 'phone', width: 140 },
  { title: '地址', key: 'address' },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    align: 'center',
    render(_row) {
      return h(NSpace, { justify: 'center' }, {
        default: () => [
          h(
            NButton,
            {
              text: true,
              size: 'small',
              type: 'primary',
              onClick: () => openEditModal(_row),
            },
            { default: () => h(NIcon, null, { default: () => h(EditOutlined) }) },
          ),
          h(
            NButton,
            {
              text: true,
              size: 'small',
              type: 'error',
              onClick: () => handleDelete(_row),
            },
            { default: () => h(NIcon, null, { default: () => h(DeleteOutlined) }) },
          ),
        ],
      });
    },
  },
];

onMounted(async () => {
  await authStore.waitForUser();
  const user = authStore.user;
  if (user) {
    store.startListening(user.uid);
  }
});

onUnmounted(() => {
  store.stopListening();
});
</script>

<style scoped>
.clients {
  padding: 32px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
}

.form-alert {
  margin-bottom: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
