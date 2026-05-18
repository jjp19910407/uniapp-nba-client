<template>
  <view class="today-star">
    <view class="section-header">
      <text class="title">今日之星</text>
      <text class="tag">MVP</text>
    </view>

    <view v-if="star" class="star-card">
      <image :src="star.avatar" class="star-avatar" mode="aspectFill" />
      <view class="star-info">
        <text class="star-name">{{ star.name }}</text>
        <text class="star-team">{{ star.team }}</text>
        <view class="star-stats">
          <view class="stat-item">
            <text class="stat-value">{{ star.pts }}</text>
            <text class="stat-label">得分</text>
          </view>
          <view class="stat-divider" />
          <view class="stat-item">
            <text class="stat-value">{{ star.reb }}</text>
            <text class="stat-label">篮板</text>
          </view>
          <view class="stat-divider" />
          <view class="stat-item">
            <text class="stat-value">{{ star.ast }}</text>
            <text class="stat-label">助攻</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { dataApi } from '@/api';

const star = ref<any>(null);

onMounted(async () => {
  const res = await dataApi.getTodayStar();
  star.value = res.data;
});
</script>

<style scoped lang="scss">
.today-star {
  margin: 24rpx;
  background: linear-gradient(135deg, #C9082A 0%, #17408B 100%);
  border-radius: 20rpx;
  padding: 32rpx;

  .section-header {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 24rpx;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #ffffff;
    }

    .tag {
      font-size: 22rpx;
      color: #C9082A;
      background: #ffffff;
      padding: 6rpx 16rpx;
      border-radius: 20rpx;
      font-weight: bold;
    }
  }

  .star-card {
    display: flex;
    gap: 24rpx;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 16rpx;
    padding: 24rpx;
    backdrop-filter: blur(10rpx);

    .star-avatar {
      width: 160rpx;
      height: 160rpx;
      border-radius: 50%;
      border: 4rpx solid rgba(255, 255, 255, 0.3);
      background: #ffffff;
    }

    .star-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .star-name {
        font-size: 36rpx;
        font-weight: bold;
        color: #ffffff;
        margin-bottom: 8rpx;
      }

      .star-team {
        font-size: 26rpx;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 20rpx;
      }

      .star-stats {
        display: flex;
        align-items: center;
        gap: 24rpx;

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;

          .stat-value {
            font-size: 32rpx;
            font-weight: bold;
            color: #ffffff;
          }

          .stat-label {
            font-size: 22rpx;
            color: rgba(255, 255, 255, 0.7);
            margin-top: 4rpx;
          }
        }

        .stat-divider {
          width: 1rpx;
          height: 48rpx;
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }
  }
}
</style>
