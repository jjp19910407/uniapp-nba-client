<template>
  <view />
</template>

<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores/user';
import { authApi, userApi } from '@/api';

const userStore = useUserStore();

onLaunch(async () => {
  if (!userStore.token) return;

  // token 已过期，清除后不做任何操作
  if (userStore.isTokenExpired()) {
    userStore.logout();
    return;
  }

  // token 未过期，刷新用户信息并更新 token
  try {
    const refreshRes = await authApi.refresh();
    userStore.setToken(refreshRes.data.token);

    const infoRes = await userApi.getInfo();
    userStore.setUserInfo(infoRes.data.userProfile, infoRes.data.userStars);
  } catch {
    // 刷新失败（token 在服务端已失效），清除登录状态
    userStore.logout();
  }
});
</script>

<style lang="scss">
page {
  background: #f5f5f7;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}
</style>
