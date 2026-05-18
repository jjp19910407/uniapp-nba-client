<template>
  <view class="page-profile-init">
    <view class="header-area">
      <text class="title">完善资料</text>
      <text class="sub">完善后即可进入球迷圈</text>
    </view>

    <view class="form-area">
      <!-- 头像 - 只读 -->
      <view class="avatar-row">
        <view class="avatar-view">
          <image class="avatar-img" :src="form.avatarUrl || '/static/avatar-default.png'" mode="aspectFill" />
        </view>
      </view>

      <!-- 昵称 - 只读 -->
      <view class="field-row">
        <text class="field-label">昵称</text>
        <view class="field-readonly">{{ form.nickname || '未设置' }}</view>
      </view>

      <!-- 手机号 - 只读 -->
      <view class="field-row">
        <text class="field-label">手机号</text>
        <view class="field-readonly">{{ form.phone || '未设置' }}</view>
      </view>

      <!-- 个人标语 -->
      <view class="field-row">
        <text class="field-label">标语</text>
        <input class="field-input" v-model="form.slogan" placeholder="秀出你的个性" maxlength="50" />
      </view>

      <!-- 主队 - 搜索选择 -->
      <view class="field-row">
        <text class="field-label">主队</text>
        <view class="search-select" @click="openSearch('team')">
          <text v-if="selectedTeam" class="selected-value">{{ selectedTeam.name }}</text>
          <text v-else class="placeholder">搜索选择主队</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- 主球星 - 搜索选择 -->
      <view class="field-row">
        <text class="field-label">主球星</text>
        <view class="search-select" @click="openSearch('mainStar')">
          <text v-if="selectedMainStar" class="selected-value">{{ selectedMainStar.name }}</text>
          <text v-else class="placeholder">搜索选择主球星</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- 副球星 - 搜索选择 -->
      <view class="field-row align-start">
        <text class="field-label">副球星</text>
        <view class="sub-stars">
          <view class="sub-star-item" v-for="(star, index) in selectedSubStars" :key="index">
            <text class="star-name">{{ star.name }}</text>
            <text class="remove" @click="removeSubStar(index)">×</text>
          </view>
          <view v-if="selectedSubStars.length < 2" class="add-sub-star" @click="openSearch('subStar')">
            <text class="add-icon">+</text>
            <text class="add-text">添加副球星</text>
          </view>
        </view>
      </view>

      <view class="submit-btn">
        <up-button type="primary" color="#C9082A" text="提交并进入" :loading="loading" @click="handleSubmit" />
      </view>
    </view>

    <!-- 通用搜索弹窗 -->
    <up-popup v-model:show="showSearchPopup" mode="center" round="24rpx" :closeable="true">
      <view class="search-popup">
        <view class="search-header">
          <text class="search-title">{{ getSearchTitle() }}</text>
        </view>
        <view class="search-input-wrap">
          <input
            class="search-input"
            v-model="searchKeyword"
            :placeholder="getSearchPlaceholder()"
            confirm-type="search"
            @confirm="doSearch"
          />
        </view>
        <scroll-view class="search-list" scroll-y>
          <view v-if="searchType === 'team'" v-for="team in searchResults" :key="team.id" class="search-item" @click="selectTeam(team)">
            <image :src="team.logo" class="item-logo" />
            <view class="item-info">
              <text class="item-name">{{ team.name }}</text>
              <text class="item-desc">{{ team.conference === 'East' ? '东部' : '西部' }}</text>
            </view>
          </view>
          <view v-else v-for="star in searchResults" :key="star.id" class="search-item star-item" @click="selectStar(star)">
            <image :src="star.avatar" class="item-avatar" />
            <view class="item-info">
              <text class="item-name">{{ star.name }}</text>
              <text class="item-desc">{{ star.teamName || '' }} · {{ star.position }}</text>
            </view>
          </view>
          <view v-if="searchResults.length === 0" class="empty-state">
            <text>暂无数据</text>
          </view>
        </scroll-view>
      </view>
    </up-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { userApi, dataApi } from '@/api';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const loading = ref(false);

const form = ref({
  avatarUrl: '',
  nickname: '',
  phone: '',
  slogan: '',
  teamId: 0,
  mainStarId: 0,
  subStarIds: [] as number[]
});

// 已选择的数据
const selectedTeam = ref<any>(null);
const selectedMainStar = ref<any>(null);
const selectedSubStars = ref<any[]>([]);

// 搜索状态
const showSearchPopup = ref(false);
const searchType = ref<'team' | 'mainStar' | 'subStar'>('team');
const searchKeyword = ref('');
const searchResults = ref<any[]>([]);

onMounted(async () => {
  // 先获取用户当前信息
  const infoRes = await userApi.getInfo();
  const profile = infoRes.data.userProfile;
  form.value.avatarUrl = profile?.avatarUrl;
  form.value.nickname = profile?.nickname;
  form.value.phone = profile?.phone;
});

const openSearch = async (type: 'team' | 'mainStar' | 'subStar') => {
  searchType.value = type;
  searchKeyword.value = '';
  showSearchPopup.value = true;
  await doSearch();
};

const getSearchTitle = () => {
  switch (searchType.value) {
    case 'team': return '选择主队';
    case 'mainStar': return '选择主球星';
    case 'subStar': return '选择副球星';
    default: return '';
  }
};

const getSearchPlaceholder = () => {
  switch (searchType.value) {
    case 'team': return '输入球队名称搜索';
    case 'mainStar': return '输入球星名称搜索';
    case 'subStar': return '输入球星名称搜索';
    default: return '搜索';
  }
};

const doSearch = async () => {
  if (searchType.value === 'team') {
    const res = await dataApi.searchTeams(searchKeyword.value);
    searchResults.value = res.data;
  } else {
    const res = await dataApi.searchStars(searchKeyword.value);
    searchResults.value = res.data;
  }
};

const selectTeam = (team: any) => {
  selectedTeam.value = team;
  form.value.teamId = team.id;
  showSearchPopup.value = false;
};

const selectStar = (star: any) => {
  if (searchType.value === 'mainStar') {
    if (selectedSubStars.value.find(s => s.id === star.id)) {
      uni.showToast({ title: '该球星已选择为副球星', icon: 'none' });
      return;
    }
    selectedMainStar.value = star;
    form.value.mainStarId = star.id;
  } else {
    if (selectedMainStar.value && selectedMainStar.value.id === star.id) {
      uni.showToast({ title: '该球星已选择为主球星', icon: 'none' });
      return;
    }
    if (selectedSubStars.value.find(s => s.id === star.id)) {
      uni.showToast({ title: '该球星已选择', icon: 'none' });
      return;
    }
    if (selectedSubStars.value.length >= 2) {
      uni.showToast({ title: '最多选择2位副球星', icon: 'none' });
      return;
    }
    selectedSubStars.value.push(star);
    form.value.subStarIds = selectedSubStars.value.map(s => s.id);
  }
  showSearchPopup.value = false;
};

const removeSubStar = (index: number) => {
  selectedSubStars.value.splice(index, 1);
  form.value.subStarIds = selectedSubStars.value.map(s => s.id);
};

const handleSubmit = async () => {
  if (!form.value.teamId) {
    uni.showToast({ title: '请选择主队', icon: 'none' }); return;
  }
  if (!form.value.mainStarId) {
    uni.showToast({ title: '请选择主球星', icon: 'none' }); return;
  }
  if (form.value.subStarIds.length !== 2) {
    uni.showToast({ title: '请选择2位副球星', icon: 'none' }); return;
  }
  if (form.value.subStarIds.includes(form.value.mainStarId)) {
    uni.showToast({ title: '副球星不能和主球星相同', icon: 'none' }); return;
  }

  loading.value = true;
  try {
    const stars = [
      { starId: form.value.mainStarId, role: 'main' },
      ...form.value.subStarIds.map(id => ({ starId: id, role: 'sub' }))
    ];
    await userApi.initProfile({
      avatarUrl: form.value.avatarUrl,
      nickname: form.value.nickname,
      phone: form.value.phone,
      slogan: form.value.slogan,
      teamId: form.value.teamId,
      stars
    });
    uni.showToast({ title: '提交成功', icon: 'success' });

    const res = await userApi.getInfo();
    userStore.setUserInfo(res.data.userProfile, res.data.userStars);

    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch {
    uni.showToast({ title: '提交失败，请重试', icon: 'none' });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.page-profile-init {
  min-height: 100vh;
  background: #f5f5f7;
  padding: 40rpx 32rpx;
}

.header-area {
  text-align: center;
  margin-bottom: 40rpx;
  padding-top: 40rpx;

  .title {
    display: block;
    font-size: 44rpx;
    font-weight: bold;
    color: #1d1d1f;
    margin-bottom: 12rpx;
  }

  .sub {
    font-size: 28rpx;
    color: #86868b;
  }
}

.form-area {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
}

.avatar-row {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;

  .avatar-view {
    display: flex;
    flex-direction: column;
    align-items: center;

    .avatar-img {
      width: 160rpx;
      height: 160rpx;
      border-radius: 50%;
      background: #e5e5e5;
    }
  }
}

.field-row {
  display: flex;
  align-items: center;
  padding: 28rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &.align-start { align-items: flex-start; padding-top: 32rpx; }

  .field-label {
    width: 120rpx;
    font-size: 28rpx;
    color: #1d1d1f;
    flex-shrink: 0;
  }

  .field-input {
    flex: 1;
    font-size: 28rpx;
    color: #1d1d1f;
  }

  .field-readonly {
    flex: 1;
    font-size: 28rpx;
    color: #86868b;
  }

  .search-select {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .selected-value {
      font-size: 28rpx;
      color: #1d1d1f;
    }

    .placeholder {
      font-size: 28rpx;
      color: #86868b;
    }

    .arrow {
      font-size: 36rpx;
      color: #c7c7cc;
      margin-left: 8rpx;
    }
  }

  .sub-stars {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;

    .sub-star-item {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 12rpx 20rpx;
      background: #f5f5f7;
      border-radius: 40rpx;

      .star-name {
        font-size: 26rpx;
        color: #1d1d1f;
      }

      .remove {
        font-size: 32rpx;
        color: #86868b;
        line-height: 1;
      }
    }

    .add-sub-star {
      display: flex;
      align-items: center;
      gap: 6rpx;
      padding: 12rpx 20rpx;
      border: 2rpx dashed #d1d1d6;
      border-radius: 40rpx;

      .add-icon {
        font-size: 32rpx;
        color: #C9082A;
        line-height: 1;
      }

      .add-text {
        font-size: 26rpx;
        color: #C9082A;
      }
    }
  }
}

.submit-btn {
  margin-top: 64rpx;
}

.search-popup {
  width: 600rpx;
  max-height: 80vh;
  padding: 32rpx;

  .search-header {
    text-align: center;
    margin-bottom: 24rpx;

    .search-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #1d1d1f;
    }
  }

  .search-input-wrap {
    margin-bottom: 24rpx;

    .search-input {
      width: 100%;
      height: 80rpx;
      background: #f5f5f7;
      border-radius: 16rpx;
      padding: 0 24rpx;
      font-size: 28rpx;
    }
  }

  .search-list {
    max-height: 60vh;

    .search-item {
      display: flex;
      align-items: center;
      gap: 20rpx;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #f5f5f7;

      &.star-item {
        align-items: center;
      }

      .item-logo {
        width: 80rpx;
        height: 80rpx;
        border-radius: 8rpx;
      }

      .item-avatar {
        width: 88rpx;
        height: 88rpx;
        border-radius: 50%;
      }

      .item-info {
        display: flex;
        flex-direction: column;
        gap: 8rpx;

        .item-name {
          font-size: 28rpx;
          font-weight: 500;
          color: #1d1d1f;
        }

        .item-desc {
          font-size: 24rpx;
          color: #86868b;
        }
      }
    }

    .empty-state {
      padding: 80rpx 0;
      text-align: center;

      text {
        font-size: 28rpx;
        color: #86868b;
      }
    }
  }
}
</style>
