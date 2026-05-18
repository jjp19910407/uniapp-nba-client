<template>
  <view class="page-placeholder">
    <text class="icon">🛒</text>
    <text class="title">商城</text>
    <text class="desc">敬请期待</text>
  </view>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.page-placeholder {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;

  .icon {
    font-size: 120rpx;
  }

  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #1d1d1f;
  }

  .desc {
    font-size: 28rpx;
    color: #86868b;
  }
}
</style>
