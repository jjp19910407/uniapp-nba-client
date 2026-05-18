<template>
  <view class="page-login">
    <view class="logo-area">
      <image src="/static/tab-home-active.png" class="logo" mode="aspectFit" />
      <text class="app-name">NBA球迷圈</text>
      <text class="slogan">你的专属球迷社区</text>
    </view>

    <!-- 第一步：未开始，显示一键登录按钮 -->
    <view v-if="step === 'init'" class="btn-area">
      <button class="wx-btn" :loading="loading" @click="handleStart">
        微信一键登录
      </button>
    </view>

    <!-- 第二步：填写头像和昵称 -->
    <view v-if="step === 'profile'" class="profile-area">
      <text class="step-title">设置你的球迷资料</text>

      <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <image class="avatar-img" :src="form.avatarUrl || '/static/avatar-default.png'" mode="aspectFill" />
        <text class="avatar-tip">{{ form.avatarUrl ? '点击更换头像' : '点击选择头像' }}</text>
      </button>

      <view class="input-row">
        <input
          class="nickname-input"
          type="nickname"
          :value="form.nickname"
          placeholder="点击填写昵称（可使用微信昵称）"
          @change="(e: any) => form.nickname = e.detail.value"
        />
      </view>

      <button class="next-btn" @click="handleProfileNext">下一步</button>
    </view>

    <!-- 第三步：手机号 -->
    <view v-if="step === 'phone'" class="phone-area">
      <text class="step-title">绑定手机号</text>
      <text class="step-sub">手机号仅用于账号安全验证</text>

      <view class="input-row" :class="{ 'input-error': phoneError }">
        <input
          class="nickname-input"
          type="number"
          v-model="form.phone"
          placeholder="请输入手机号"
          maxlength="11"
          @input="phoneError = ''"
        />
      </view>
      <text v-if="phoneError" class="error-tip">{{ phoneError }}</text>

      <button class="next-btn" :loading="loading" @click="handlePhoneSubmit">
        完成注册
      </button>

      <text class="skip-tip" @click="handleSkipPhone">暂不绑定，直接进入</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';
import { authApi, userApi } from '@/api';

const userStore = useUserStore();
const loading = ref(false);
const step = ref<'init' | 'profile' | 'phone'>('init');

const form = ref({
  avatarUrl: '',
  nickname: '',
  phone: ''
});
const phoneError = ref('');

// 第一步：wx.login 静默登录，拿到 token
const handleStart = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    const loginRes = await new Promise<any>((resolve, reject) => {
      wx.login({ success: resolve, fail: reject });
    });

    const res = await authApi.login(loginRes.code);
    if (res.code !== 0) {
      uni.showToast({ title: res.msg || '登录失败', icon: 'none' });
      return;
    }
    userStore.setToken(res.data.token);

    // 新用户进入资料填写，老用户直接回去
    if (res.data.isNew) {
      step.value = 'profile';
    } else {
      const infoRes = await userApi.getInfo();
      userStore.setUserInfo(infoRes.data.userProfile, infoRes.data.userStars);
      uni.navigateBack();
    }
  } catch (e) {
    console.error('login error:', e);
    uni.showToast({ title: '登录失败，请重试', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

// 第二步：昵称头像填完，进入手机号授权
const handleProfileNext = () => {
  if (!form.value.nickname) {
    uni.showToast({ title: '请填写昵称', icon: 'none' });
    return;
  }
  step.value = 'phone';
};

const onChooseAvatar = (e: any) => {
  form.value.avatarUrl = e.detail.avatarUrl;
};

// 第三步：提交手机号完成注册
const handlePhoneSubmit = async () => {
  const phone = form.value.phone.trim();
  if (!phone) {
    phoneError.value = '请输入手机号';
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    phoneError.value = '请输入正确的手机号';
    return;
  }
  await submitProfile(phone);
};

const submitProfile = async (phone: string | null) => {
  loading.value = true;
  try {
    await authApi.initProfile({
      avatarUrl: form.value.avatarUrl,
      nickname: form.value.nickname,
      phone
    });
    const infoRes = await userApi.getInfo();
    userStore.setUserInfo(infoRes.data.userProfile, infoRes.data.userStars);

    // 注册成功后跳转到资料完善页面
    uni.redirectTo({ url: '/pages/profile-init/index' });
  } catch (e) {
    console.error('initProfile error:', e);
    uni.showToast({ title: '注册失败，请重试', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

// 跳过手机号
const handleSkipPhone = () => submitProfile(null);
</script>

<style scoped lang="scss">
.page-login {
  min-height: 100vh;
  background: linear-gradient(160deg, #C9082A 0%, #17408B 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 60rpx;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 100rpx;

  .logo {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: 32rpx;
  }
  .app-name {
    font-size: 52rpx;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 16rpx;
  }
  .slogan {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.75);
  }
}

.btn-area {
  width: 100%;
  .wx-btn {
    width: 100%;
    height: 96rpx;
    background: #ffffff;
    color: #C9082A;
    font-size: 34rpx;
    font-weight: bold;
    border-radius: 48rpx;
    border: none;
    &::after { border: none; }
  }
}

.profile-area, .phone-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  .step-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 16rpx;
  }
  .step-sub {
    font-size: 26rpx;
    color: rgba(255,255,255,0.7);
    margin-bottom: 60rpx;
  }
}

.avatar-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  border: none;
  margin-bottom: 40rpx;
  &::after { border: none; }

  .avatar-img {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    border: 4rpx solid rgba(255,255,255,0.5);
    margin-bottom: 16rpx;
  }
  .avatar-tip {
    font-size: 26rpx;
    color: rgba(255,255,255,0.8);
  }
}

.input-row {
  width: 100%;
  background: rgba(255,255,255,0.15);
  border-radius: 16rpx;
  padding: 0 32rpx;
  margin-bottom: 16rpx;
  border: 2rpx solid transparent;
  transition: border-color 0.2s;

  &.input-error {
    border-color: #ffb3b3;
  }

  .nickname-input {
    width: 100%;
    height: 96rpx;
    font-size: 30rpx;
    color: #ffffff;
  }
}

.error-tip {
  width: 100%;
  font-size: 24rpx;
  color: #ffb3b3;
  margin-bottom: 32rpx;
  padding-left: 8rpx;
}

.next-btn {
  width: 100%;
  height: 96rpx;
  background: #ffffff;
  color: #C9082A;
  font-size: 34rpx;
  font-weight: bold;
  border-radius: 48rpx;
  border: none;
  &::after { border: none; }
}

.phone-btn {
  width: 100%;
  height: 96rpx;
  background: #ffffff;
  color: #C9082A;
  font-size: 34rpx;
  font-weight: bold;
  border-radius: 48rpx;
  border: none;
  margin-bottom: 40rpx;
  &::after { border: none; }
}

.skip-tip {
  font-size: 26rpx;
  color: rgba(255,255,255,0.6);
  text-decoration: underline;
}
</style>
