<template>
  <up-popup
    :show="show"
    mode="bottom"
    round="24rpx"
    @close="emit('update:show', false)"
  >
    <view class="star-picker">
      <view class="picker-header">
        <text class="picker-title">{{ title }}</text>
        <text class="picker-close" @tap="emit('update:show', false)">✕</text>
      </view>

      <view class="picker-search">
        <up-search
          v-model="keyword"
          placeholder="输入球星名称搜索"
          :show-action="true"
          action-text="搜索"
          @search="doSearch"
          @custom="doSearch"
          @clear="doSearch"
        />
      </view>

      <scroll-view class="picker-list" scroll-y>
        <view v-if="loading" class="picker-state">
          <up-loading-icon mode="circle" color="#C9082A" />
        </view>
        <template v-else-if="results.length > 0">
          <view
            v-for="star in results"
            :key="star.id"
            class="star-item"
            @tap="select(star)"
          >
            <image
              class="star-avatar"
              :src="star.avatar || '/static/avatar-default.png'"
              mode="aspectFill"
            />
            <view class="star-info">
              <text class="star-name">{{ star.name }}</text>
              <text class="star-sub">{{ [star.teamName, star.position].filter(Boolean).join(' · ') }}</text>
            </view>
          </view>
        </template>
        <view v-else class="picker-state">
          <up-empty text="暂无数据" icon="list" />
        </view>
      </scroll-view>
    </view>
  </up-popup>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { dataApi } from '@/api';

const props = defineProps<{
  show: boolean;
  title: string;
  excludeIds?: number[];
}>();

const emit = defineEmits<{
  (e: 'update:show', val: boolean): void;
  (e: 'select', val: any): void;
}>();

const keyword = ref('');
const results = ref<any[]>([]);
const loading = ref(false);

watch(() => props.show, (val) => {
  if (val) {
    keyword.value = '';
    doSearch();
  }
});

const doSearch = async () => {
  loading.value = true;
  try {
    const res = await dataApi.searchStars(keyword.value);
    results.value = (res.data || []).filter(
      (s: any) => !(props.excludeIds || []).includes(s.id)
    );
  } finally {
    loading.value = false;
  }
};

const select = (star: any) => {
  emit('select', star);
  emit('update:show', false);
};

watch(() => props.excludeIds, () => {
  results.value = results.value.filter(
    (s: any) => !(props.excludeIds || []).includes(s.id)
  );
});
</script>

<style scoped lang="scss">
.star-picker {
  height: 72vh;
  display: flex;
  flex-direction: column;

  .picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx 32rpx 20rpx;
    flex-shrink: 0;

    .picker-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #1d1d1f;
    }

    .picker-close {
      font-size: 36rpx;
      color: #86868b;
      padding: 8rpx 0 8rpx 24rpx;
    }
  }

  .picker-search {
    padding: 0 16rpx 12rpx;
    flex-shrink: 0;
  }

  .picker-list {
    flex: 1;
    overflow: hidden;

    .star-item {
      display: flex;
      align-items: center;
      padding: 24rpx 32rpx;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child { border-bottom: none; }

      .star-avatar {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        margin-right: 20rpx;
        flex-shrink: 0;
      }

      .star-info {
        display: flex;
        flex-direction: column;
        gap: 6rpx;

        .star-name {
          font-size: 30rpx;
          color: #1d1d1f;
          font-weight: 500;
        }

        .star-sub {
          font-size: 24rpx;
          color: #86868b;
        }
      }
    }
  }

  .picker-state {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 80rpx 0;
  }
}
</style>
