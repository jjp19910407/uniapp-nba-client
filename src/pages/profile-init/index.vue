<template>
  <view class="page-profile-init">
    <view class="nav-bar">
      <text class="nav-title">完善资料</text>
      <text class="nav-sub">完善后即可进入球迷圈</text>
    </view>

    <scroll-view scroll-y class="scroll-wrap">
      <view class="form-area">
        <!-- 头像只读 -->
        <view class="avatar-row">
          <image class="avatar-img" :src="form.avatarUrl || '/static/avatar-default.png'" mode="aspectFill" />
          <text class="avatar-name">{{ form.nickname || '球迷' }}</text>
        </view>

        <!-- 手机号只读 -->
        <view class="cell-row">
          <text class="cell-label">手机号</text>
          <text class="cell-value gray">{{ form.phone || '未绑定' }}</text>
        </view>

        <!-- 个人标语 -->
        <view class="cell-row">
          <text class="cell-label">标语</text>
          <input
            class="cell-input"
            v-model="form.slogan"
            placeholder="秀出你的个性"
            maxlength="50"
            placeholder-class="input-placeholder"
          />
        </view>

        <!-- 年龄 -->
        <view class="cell-row">
          <text class="cell-label">年龄</text>
          <input
            class="cell-input"
            v-model="form.age"
            type="number"
            placeholder="请输入年龄"
            maxlength="3"
            placeholder-class="input-placeholder"
          />
        </view>

        <!-- 看球年限 -->
        <view class="cell-row">
          <text class="cell-label">看球年限</text>
          <input
            class="cell-input"
            v-model="form.watchYears"
            type="number"
            placeholder="已看球几年"
            maxlength="2"
            placeholder-class="input-placeholder"
          />
        </view>
        <!-- 主队 picker -->
        <picker mode="selector" :range="teamNames" :value="teamPickerIndex" @change="onTeamChange">
          <view class="cell-row">
            <text class="cell-label">主队</text>
            <text :class="['cell-value', selectedTeam ? '' : 'gray']">
              {{ selectedTeam ? selectedTeam.name : '请选择主队' }}
            </text>
            <text class="cell-arrow">›</text>
          </view>
        </picker>

        <!-- 主球星 -->
        <view class="cell-row" @tap="showMainPicker = true">
          <text class="cell-label">主球星</text>
          <text :class="['cell-value', selectedMainStar ? '' : 'gray']">
            {{ selectedMainStar ? selectedMainStar.name : '请选择主球星' }}
          </text>
          <text class="cell-arrow">›</text>
        </view>

        <!-- 副球星1 -->
        <view class="cell-row" @tap="showSub0Picker = true">
          <text class="cell-label">副球星1</text>
          <text :class="['cell-value', selectedSubStars[0] ? '' : 'gray']">
            {{ selectedSubStars[0] ? selectedSubStars[0].name : '请选择副球星' }}
          </text>
          <text class="cell-arrow">›</text>
        </view>

        <!-- 副球星2 -->
        <view class="cell-row" @tap="showSub1Picker = true">
          <text class="cell-label">副球星2</text>
          <text :class="['cell-value', selectedSubStars[1] ? '' : 'gray']">
            {{ selectedSubStars[1] ? selectedSubStars[1].name : '请选择副球星' }}
          </text>
          <text class="cell-arrow">›</text>
        </view>

        <view class="submit-btn">
          <up-button type="primary" color="#C9082A" text="提交并进入" :loading="loading" @click="handleSubmit" />
        </view>
      </view>
    </scroll-view>

    <!-- StarPicker 弹出层，必须在 scroll-view 外 -->
    <StarPicker v-model:show="showMainPicker" title="主球星" :exclude-ids="subStarIds" @select="selectedMainStar = $event" />
    <StarPicker v-model:show="showSub0Picker" title="副球星1" :exclude-ids="excludeForSub0" @select="selectedSubStars[0] = $event" />
    <StarPicker v-model:show="showSub1Picker" title="副球星2" :exclude-ids="excludeForSub1" @select="selectedSubStars[1] = $event" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onBackPress } from '@dcloudio/uni-app';
import { userApi, dataApi } from '@/api';
import { useUserStore } from '@/stores/user';
import StarPicker from '@/components/StarPicker.vue';

const userStore = useUserStore();
onBackPress(() => true);

const loading = ref(false);
const form = ref({ avatarUrl: '', nickname: '', phone: '', slogan: '', age: '', watchYears: '' });

const allTeams = ref<any[]>([]);
const teamPickerIndex = ref(0);
const selectedTeam = ref<any>(null);
const teamNames = computed(() => allTeams.value.map(t => t.name));

const selectedMainStar = ref<any>(null);
const selectedSubStars = ref<(any | null)[]>([null, null]);

const testpicker = ref(false);
const showMainPicker = ref(false);
const showSub0Picker = ref(false);
const showSub1Picker = ref(false);

// 各槽位的排除 ID（防止重复选同一球星）
const subStarIds = computed(() =>
  [selectedSubStars.value[0]?.id, selectedSubStars.value[1]?.id].filter(Boolean) as number[]
);
const excludeForSub0 = computed(() =>
  [selectedMainStar.value?.id, selectedSubStars.value[1]?.id].filter(Boolean) as number[]
);
const excludeForSub1 = computed(() =>
  [selectedMainStar.value?.id, selectedSubStars.value[0]?.id].filter(Boolean) as number[]
);

onMounted(async () => {
  const [infoRes, teamsRes] = await Promise.all([userApi.getInfo(), dataApi.getTeams()]);
  const profile = infoRes.data.userProfile;
  form.value.avatarUrl = profile?.avatarUrl || '';
  form.value.nickname = profile?.nickname || '';
  form.value.phone = profile?.phone || '';
  allTeams.value = teamsRes.data || [];
});

const onTeamChange = (e: any) => {
  const idx = Number(e.detail.value);
  teamPickerIndex.value = idx;
  selectedTeam.value = allTeams.value[idx];
};

const handleSubmit = async () => {
  if (!selectedTeam.value) { uni.showToast({ title: '请选择主队', icon: 'none' }); return; }
  if (!selectedMainStar.value) { uni.showToast({ title: '请选择主球星', icon: 'none' }); return; }
  if (!selectedSubStars.value[0] || !selectedSubStars.value[1]) {
    uni.showToast({ title: '请选择2位副球星', icon: 'none' }); return;
  }

  loading.value = true;
  try {
    await userApi.initProfile({
      avatarUrl: form.value.avatarUrl,
      nickname: form.value.nickname,
      slogan: form.value.slogan,
      age: form.value.age ? Number(form.value.age) : null,
      watchYears: form.value.watchYears ? Number(form.value.watchYears) : null,
      teamId: selectedTeam.value.id,
      teamName: selectedTeam.value.name,
      stars: [
        { starId: selectedMainStar.value.id, starName: selectedMainStar.value.name, role: 'main' },
        { starId: selectedSubStars.value[0].id, starName: selectedSubStars.value[0].name, role: 'sub' },
        { starId: selectedSubStars.value[1].id, starName: selectedSubStars.value[1].name, role: 'sub' },
      ]
    });
    const res = await userApi.getInfo();
    userStore.setUserInfo(res.data.userProfile, res.data.userStars);
    uni.showToast({ title: '提交成功', icon: 'success' });
    setTimeout(() => uni.switchTab({ url: '/pages/mine/index' }), 1500);
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
  display: flex;
  flex-direction: column;
}

.nav-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 88rpx 32rpx 32rpx;
  background: #f5f5f7;

  .nav-title {
    font-size: 40rpx;
    font-weight: bold;
    color: #1d1d1f;
    margin-bottom: 8rpx;
  }

  .nav-sub {
    font-size: 26rpx;
    color: #86868b;
  }
}

.scroll-wrap { flex: 1; }

.form-area {
  background: #ffffff;
  border-radius: 24rpx;
  margin: 0 24rpx 40rpx;
  overflow: hidden;
}

.avatar-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0 32rpx;

  .avatar-img {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    background: #e5e5e5;
    margin-bottom: 16rpx;
  }

  .avatar-name {
    font-size: 30rpx;
    font-weight: 500;
    color: #1d1d1f;
  }
}

.cell-row {
  display: flex;
  align-items: center;
  padding: 32rpx;
  border-top: 1rpx solid #f0f0f0;

  .cell-label {
    width: 140rpx;
    font-size: 28rpx;
    color: #1d1d1f;
    flex-shrink: 0;
  }

  .cell-value {
    flex: 1;
    font-size: 28rpx;
    color: #1d1d1f;
    text-align: right;
    &.gray { color: #86868b; }
  }

  .cell-input {
    flex: 1;
    font-size: 28rpx;
    color: #1d1d1f;
    text-align: right;
  }

  .cell-arrow {
    font-size: 36rpx;
    color: #c7c7cc;
    margin-left: 12rpx;
  }
}

.submit-btn { padding: 48rpx 32rpx 40rpx; }

.input-placeholder { color: #86868b; }
</style>
