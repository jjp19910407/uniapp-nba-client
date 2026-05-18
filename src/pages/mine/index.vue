<template>
  <view class="page-mine">
    <!-- 头部 -->
    <view class="header">
      <!-- 未登录 -->
      <view v-if="!userStore.token" class="guest-card">
        <image src="/static/avatar-default.png" class="avatar" mode="aspectFill" />
        <view class="info">
          <text class="nickname">未登录</text>
          <text class="slogan">登录后享受更多功能</text>
        </view>
        <button class="login-btn" @click="goLogin">登录 / 注册</button>
      </view>

      <!-- 已登录 -->
      <view v-else class="user-card">
        <image :src="userStore.userInfo?.avatar_url || '/static/avatar-default.png'" class="avatar" mode="aspectFill" />
        <view class="info">
          <text class="nickname">{{ userStore.userInfo?.nickname || '球迷' }}</text>
          <text class="slogan">{{ userStore.userInfo?.slogan || '' }}</text>
        </view>
      </view>

      <!-- 数据卡片（已登录才显示） -->
      <view v-if="userStore.token" class="stats-row">
        <view class="stat-card">
          <text class="stat-value">{{ userStore.userInfo?.points || 0 }}</text>
          <text class="stat-label">积分</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">Lv.{{ userStore.userInfo?.level || 1 }}</text>
          <text class="stat-label">球迷等级</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ userStore.userInfo?.creditScore || 100 }}</text>
          <text class="stat-label">信誉分</text>
        </view>
      </view>
    </view>

    <!-- 菜单 -->
    <view class="menu-section">
      <view class="menu-item" @click="goPage('')">
        <text class="menu-icon">⚙️</text>
        <text class="menu-text">设置</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="showApiSetting">
        <text class="menu-icon">🔗</text>
        <text class="menu-text">API地址</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { userApi } from '@/api';

const userStore = useUserStore();

onMounted(async () => {
  if (userStore.token && !userStore.userInfo) {
    const res = await userApi.getInfo();
    userStore.setUserInfo(res.data.userProfile, res.data.userStars);
  }
});

const goLogin = () => {
  uni.navigateTo({ url: '/pages/login/index' });
};

const goPage = (path: string) => {
  //
};

const showApiSetting = () => {
  const currentUrl = uni.getStorageSync('apiBaseUrl') || 'http://192.168.1.12:3001/api';
  uni.showModal({
    title: '设置API地址',
    editable: true,
    placeholderText: '请输入API地址',
    content: currentUrl,
    success: (res) => {
      if (res.confirm && res.content) {
        uni.setStorageSync('apiBaseUrl', res.content);
        uni.showToast({ title: '设置成功，重启应用生效', icon: 'success' });
      }
    }
  });
};
</script>

<style scoped lang="scss">
.page-mine {
  min-height: 100vh;
  background: #f5f5f7;
}

.header {
  background: linear-gradient(135deg, #C9082A 0%, #17408B 100%);
  padding: 48rpx 32rpx 40rpx;

  .guest-card {
    display: flex;
    align-items: center;
    gap: 24rpx;
    margin-bottom: 40rpx;

    .avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      border: 4rpx solid rgba(255, 255, 255, 0.3);
      background: #ffffff;
    }

    .info {
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .nickname {
        font-size: 36rpx;
        font-weight: bold;
        color: #ffffff;
      }

      .slogan {
        font-size: 26rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }

    .login-btn {
      margin-left: auto;
      height: 72rpx;
      line-height: 72rpx;
      padding: 0 36rpx;
      background: #ffffff;
      color: #C9082A;
      font-size: 28rpx;
      font-weight: bold;
      border-radius: 36rpx;
      border: none;
      box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
      &::after {
        border: none;
      }
    }
  }

  .user-card {
    display: flex;
    align-items: center;
    gap: 24rpx;
    margin-bottom: 40rpx;

    .avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      border: 4rpx solid rgba(255, 255, 255, 0.3);
      background: #ffffff;
    }

    .info {
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .nickname {
        font-size: 36rpx;
        font-weight: bold;
        color: #ffffff;
      }

      .slogan {
        font-size: 26rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }

  .stats-row {
    display: flex;
    gap: 24rpx;

    .stat-card {
      flex: 1;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 16rpx;
      padding: 24rpx 16rpx;
      text-align: center;

      .stat-value {
        display: block;
        font-size: 32rpx;
        font-weight: bold;
        color: #ffffff;
        margin-bottom: 8rpx;
      }

      .stat-label {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
}

.menu-section {
  margin: 24rpx;
  background: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;

  .menu-item {
    display: flex;
    align-items: center;
    padding: 32rpx;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .menu-icon {
      font-size: 36rpx;
      margin-right: 20rpx;
    }

    .menu-text {
      flex: 1;
      font-size: 30rpx;
      color: #1d1d1f;
    }

    .menu-arrow {
      font-size: 36rpx;
      color: #c7c7cc;
    }
  }
}
</style>
