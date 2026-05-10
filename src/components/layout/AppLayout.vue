<template>
    <n-layout has-sider>
        <n-layout-sider>
            /* 侧边栏内容 */
        </n-layout-sider>
        <n-layout>
            <n-layout-header>
                /* 导航栏内容 */
            </n-layout-header>
            <n-layout-content>
                <router-view></router-view>
            </n-layout-content>
        </n-layout>
    </n-layout>
</template>

<script setup lang="ts">
import { NLayout, NLayoutContent, NLayoutSider, NLayoutHeader } from 'naive-ui';
</script>