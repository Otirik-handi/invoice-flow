<template>
  <div class="settings">
    <div class="page-header">
      <span class="page-title">系统设置</span>
    </div>

    <n-spin :show="loading">
      <div class="settings-body">
        <n-card :bordered="true" size="large">
          <div class="card-inner">
            <!-- 个人信息 -->
            <div class="card-section">
              <div class="section-title">个人信息</div>
              <n-form label-placement="left" :label-width="100">
                <n-form-item label="显示名称">
                  <n-input v-model:value="form.displayName" placeholder="请输入显示名称" />
                </n-form-item>
                <n-form-item label="公司名称">
                  <n-input v-model:value="form.companyName" placeholder="选填" />
                </n-form-item>
                <n-form-item label="地址">
                  <n-input v-model:value="form.address" placeholder="选填" />
                </n-form-item>
                <n-form-item label="联系电话">
                  <n-input v-model:value="form.phone" placeholder="选填" />
                </n-form-item>
              </n-form>
            </div>

            <!-- 默认设置 -->
            <div class="card-section">
              <div class="section-title">默认设置</div>
              <n-form label-placement="left" :label-width="100">
                <n-form-item label="默认货币">
                  <n-select
                    v-model:value="form.defaultCurrency"
                    :options="currencyOptions"
                    :style="{ width: '200px' }"
                  />
                </n-form-item>
                <n-form-item label="默认税率">
                  <n-input-number
                    v-model:value="form.defaultTaxRate"
                    :min="0"
                    :max="100"
                    :style="{ width: '200px' }"
                  >
                    <template #suffix>%</template>
                  </n-input-number>
                </n-form-item>
                <n-form-item label="默认到期">
                  <n-input-number
                    v-model:value="form.defaultDueDays"
                    :min="1"
                    :max="365"
                    :style="{ width: '200px' }"
                  >
                    <template #suffix>天</template>
                  </n-input-number>
                </n-form-item>
              </n-form>
            </div>
          </div>

          <n-alert
            v-if="message.text"
            :type="message.type"
            closable
            @close="message.text = ''"
            :bordered="false"
            class="settings-alert"
          >
            {{ message.text }}
          </n-alert>

          <template #footer>
            <div class="card-footer">
              <n-button type="primary" :loading="saving" :disabled="saving" @click="handleSave">
                保存设置
              </n-button>
            </div>
          </template>
        </n-card>
      </div>
    </n-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { NButton, NCard, NForm, NFormItem, NInput, NInputNumber, NSelect, NSpin, NAlert } from 'naive-ui';
import type { SelectOption } from 'naive-ui';

const authStore = useAuthStore();

const currencyOptions: SelectOption[] = [
  { label: 'CNY (¥)', value: 'CNY' },
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
];

const form = reactive({
  displayName: '',
  companyName: '',
  address: '',
  phone: '',
  defaultCurrency: 'CNY' as 'CNY' | 'USD' | 'EUR',
  defaultTaxRate: 0,
  defaultDueDays: 30,
});

const loading = ref(true);
const saving = ref(false);
const message = reactive({ text: '', type: 'success' as 'success' | 'error' });

onMounted(async () => {
  await authStore.waitForUser();
  const user = authStore.user;
  if (user) {
    form.displayName = user.displayName || '';
    form.companyName = user.companyName || '';
    form.address = user.address || '';
    form.phone = user.phone || '';
    form.defaultCurrency = user.defaultCurrency || 'CNY';
    form.defaultTaxRate = user.defaultTaxRate ?? 0;
    form.defaultDueDays = user.defaultDueDays ?? 30;
  }
  loading.value = false;
});

async function handleSave() {
  saving.value = true;
  message.text = '';
  try {
    await authStore.updateProfile({
      displayName: form.displayName,
      companyName: form.companyName,
      address: form.address,
      phone: form.phone,
      defaultCurrency: form.defaultCurrency,
      defaultTaxRate: form.defaultTaxRate,
      defaultDueDays: form.defaultDueDays,
    });
    message.type = 'success';
    message.text = '设置已保存';
  } catch {
    message.type = 'error';
    message.text = '保存失败，请稍后重试';
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.settings {
  padding: 32px;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
}

.settings-body {
  max-width: 960px;
  margin: 0 auto;
}

.card-inner {
  display: flex;
  gap: 48px;
}

.card-section {
  flex: 1;
  min-width: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.settings-alert {
  margin-top: 20px;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
