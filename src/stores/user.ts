import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(uni.getStorageSync('token') || '');
  const userInfo = ref<any>(null);
  const userStars = ref<any[]>([]);
  const status = ref<'pending' | 'completed'>('pending');

  function setToken(t: string) {
    token.value = t;
    uni.setStorageSync('token', t);
  }

  function setUserInfo(info: any, stars: any[]) {
    userInfo.value = info;
    userStars.value = stars;
    status.value = info.status;
  }

  function logout() {
    token.value = '';
    userInfo.value = null;
    status.value = 'pending';
    uni.removeStorageSync('token');
  }

  return { token, userInfo, userStars, status, setToken, setUserInfo, logout };
});
