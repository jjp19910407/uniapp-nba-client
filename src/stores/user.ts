import { defineStore } from 'pinia';
import { ref } from 'vue';

const TOKEN_EXPIRE_DAYS = 7;

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(uni.getStorageSync('token') || '');
  const userInfo = ref<any>(null);
  const userStars = ref<any[]>([]);
  const status = ref<'pending' | 'completed'>('pending');

  function setToken(t: string) {
    token.value = t;
    uni.setStorageSync('token', t);
    uni.setStorageSync('tokenSavedAt', Date.now());
  }

  function isTokenExpired(): boolean {
    if (!token.value) return true;
    const savedAt = uni.getStorageSync('tokenSavedAt');
    if (!savedAt) return true;
    const days = (Date.now() - savedAt) / (1000 * 60 * 60 * 24);
    return days >= TOKEN_EXPIRE_DAYS;
  }

  // 设置用户信息，并自动检查资料是否完善
  function setUserInfo(info: any, stars: any[], redirect = true) {
    userInfo.value = info;
    userStars.value = stars || [];
    status.value = info?.status;

    if (!redirect) return;

    // 如果 status 已经是 completed，就不检查了
    if (info?.status === 'completed') {
      return;
    }

    const hasTeam = !!info?.teamId;
    const hasMainStar = (stars || []).some((s: any) => s.role === 'main');
    const hasSubStars = (stars || []).filter((s: any) => s.role === 'sub').length >= 2;

    if (!hasTeam || !hasMainStar || !hasSubStars) {
      // 如果当前已在完善资料页，不重复跳转
      const pages = getCurrentPages();
      const current = pages[pages.length - 1];
      if (current?.route !== 'pages/profile-init/index') {
        uni.reLaunch({ url: '/pages/profile-init/index' });
      }
    }
  }

  function logout() {
    token.value = '';
    userInfo.value = null;
    status.value = 'pending';
    uni.removeStorageSync('token');
    uni.removeStorageSync('tokenSavedAt');
  }

  return { token, userInfo, userStars, status, setToken, setUserInfo, logout, isTokenExpired };
});
