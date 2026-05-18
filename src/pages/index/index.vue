<template>
  <view class="page-home">
    <!-- 今日之星 -->
    <TodayStar />

    <!-- 球队排行 -->
    <view class="section">
      <view class="section-header">
        <text class="title">球队排行</text>
      </view>
      <view class="team-list">
        <view v-for="t in teams" :key="t.id" class="team-item" @click="goTeamDetail(t)">
          <image :src="t.logo" class="team-logo" mode="aspectFit" />
          <view class="team-info">
            <text class="team-name">{{ t.name }}</text>
            <text class="team-record">{{ t.wins }}胜 {{ t.losses }}负 · {{ (t.winPct * 100).toFixed(1) }}%</text>
          </view>
          <text class="team-conference" :class="t.conference === 'East' ? 'east' : 'west'">{{ t.conference === 'East' ? '东部' : '西部' }}</text>
        </view>
      </view>
    </view>

    <!-- 新闻资讯 -->
    <view class="section">
      <up-tabs :list="newsTabs" :current="newsTabIndex" @change="onNewsTabChange" lineColor="#C9082A" />
      <view class="news-list">
        <view v-for="n in news" :key="n.id" class="news-item" @click="goNewsDetail(n)">
          <image :src="n.cover" class="news-cover" mode="aspectFill" />
          <view class="news-info">
            <text class="news-title">{{ n.title }}</text>
            <text class="news-time">{{ n.time }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { authApi, userApi, dataApi } from '@/api';
import TodayStar from '@/components/TodayStar.vue';

const userStore = useUserStore();

const teams = ref<any[]>([]);
const news = ref<any[]>([]);
const newsTabIndex = ref(0);
const newsTabs = [
  { name: '热点' },
  { name: '我的主队' },
  { name: '我的球星' }
];

onMounted(async () => {
  await loadData();
  await tryAutoLogin();
});

// 尝试自动登录 - 仅当有token缓存时
const tryAutoLogin = async () => {
  const token = uni.getStorageSync('token');
  if (!token) {
    console.log('没有token缓存，不自动登录');
    return;
  }

  try {
    console.log('有token缓存，尝试自动登录');
    userStore.setToken(token);

    // 尝试获取用户信息
    const infoRes = await userApi.getInfo();
    userStore.setUserInfo(infoRes.data.userProfile, infoRes.data.userStars);

    console.log('用户状态:', infoRes.data.status);
    if (infoRes.data.status === 'pending') {
      setTimeout(() => {
        showProfileConfirm();
      }, 500);
    }
  } catch (e) {
    console.error('Token无效，清除缓存:', e);
    userStore.logout();
  }
};

// 显示确认完善资料弹窗
const showProfileConfirm = () => {
  console.log('显示完善资料弹窗');
  uni.showModal({
    title: '完善资料',
    content: '完善资料后即可进入球迷圈，是否现在去完善？',
    confirmText: '去完善',
    cancelText: '稍后',
    success: (res) => {
      if (res.confirm) {
        uni.navigateTo({ url: '/pages/profile-init/index' });
      }
    }
  });
};

const loadData = async () => {
  const [teamsRes, newsRes] = await Promise.all([
    dataApi.getTeams(),
    dataApi.getNews('hot')
  ]);
  teams.value = teamsRes.data;
  news.value = newsRes.data;
};

const onNewsTabChange = async (item: any, index: number) => {
  newsTabIndex.value = index;
  const typeMap = ['hot', 'team', 'star'];
  const res = await dataApi.getNews(typeMap[index]);
  news.value = res.data;
};

const goTeamDetail = (t: any) => {
  console.log('Go team:', t);
};

const goNewsDetail = (n: any) => {
  console.log('Go news:', n);
};
</script>

<style scoped lang="scss">
.page-home {
  min-height: 100vh;
  background: #f5f5f7;
  padding-bottom: 40rpx;
}

.section {
  margin: 24rpx 24rpx 0;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 32rpx;

  .section-header {
    margin-bottom: 24rpx;

    .title {
      font-size: 36rpx;
      font-weight: bold;
      color: #1d1d1f;
    }
  }
}

.team-list {
  .team-item {
    display: flex;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .team-logo {
      width: 80rpx;
      height: 80rpx;
      margin-right: 24rpx;
    }

    .team-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .team-name {
        font-size: 30rpx;
        color: #1d1d1f;
        font-weight: 500;
      }

      .team-record {
        font-size: 24rpx;
        color: #86868b;
      }
    }

    .team-conference {
      font-size: 24rpx;
      padding: 8rpx 16rpx;
      border-radius: 8rpx;

      &.east {
        background: #fff0f0;
        color: #C9082A;
      }

      &.west {
        background: #f0f5ff;
        color: #17408B;
      }
    }
  }
}

.news-list {
  .news-item {
    display: flex;
    gap: 24rpx;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .news-cover {
      width: 200rpx;
      height: 140rpx;
      border-radius: 12rpx;
      background: #e5e5e5;
    }

    .news-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .news-title {
        font-size: 28rpx;
        color: #1d1d1f;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }

      .news-time {
        font-size: 24rpx;
        color: #86868b;
      }
    }
  }
}
</style>
