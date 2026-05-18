<template>
  <up-popup v-model:show="visible" :round="16" mode="bottom" :closeable="false" :closeOnClickOverlay="false">
    <view class="profile-popup">
      <view class="popup-header">
        <text class="title">完善资料</text>
        <text class="sub">完善后即可进入球迷圈</text>
      </view>

      <!-- 头像（open-type="chooseAvatar" 触发微信头像选择） -->
      <view class="avatar-row">
        <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
          <image class="avatar-img" :src="form.avatarUrl || '/static/avatar-default.png'" mode="aspectFill" />
          <text class="avatar-tip">点击选择头像</text>
        </button>
      </view>

      <!-- 昵称（type="nickname" 触发微信昵称键盘） -->
      <view class="field-row">
        <text class="field-label">昵称</text>
        <input
          class="field-input"
          type="nickname"
          :value="form.nickname"
          placeholder="点击填写，可使用微信昵称"
          @change="(e: any) => form.nickname = e.detail.value"
        />
      </view>

      <!-- 手机号（open-type="getPhoneNumber" 触发授权弹窗） -->
      <view class="field-row">
        <text class="field-label">手机号</text>
        <view class="phone-area">
          <text v-if="form.phone" class="phone-value">{{ form.phone }}</text>
          <button v-else class="phone-btn" open-type="getPhoneNumber" @getphonenumber="onGetPhoneNumber">
            授权获取手机号
          </button>
        </view>
      </view>

      <!-- 个人标语 -->
      <view class="field-row">
        <text class="field-label">标语</text>
        <input class="field-input" v-model="form.slogan" placeholder="秀出你的个性" maxlength="50" />
      </view>

      <!-- 主队 -->
      <view class="field-row">
        <text class="field-label">主队</text>
        <up-select v-model="form.teamId" :options="teamOptions" placeholder="选择最喜欢的主队" />
      </view>

      <!-- 主球星 -->
      <view class="field-row">
        <text class="field-label">主球星</text>
        <up-select v-model="form.mainStar" :options="starOptions" placeholder="选择主球星" />
      </view>

      <!-- 副球星 -->
      <view class="field-row align-start">
        <text class="field-label">副球星</text>
        <up-checkbox-group v-model="form.subStars" :max="2">
          <up-checkbox
            v-for="s in starOptions"
            :key="s.value"
            :name="s.value"
            :label="s.label"
            :disabled="s.value === form.mainStar"
          />
        </up-checkbox-group>
      </view>

      <view class="submit-btn">
        <up-button type="primary" color="#C9082A" text="提交并进入" :loading="loading" @click="handleSubmit" />
      </view>
    </view>
  </up-popup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { userApi, authApi } from '@/api';
import { useUserStore } from '@/stores/user';

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<{ (e: 'success'): void }>();

const userStore = useUserStore();
const loading = ref(false);

const visible = computed({
  get: () => props.show,
  set: () => {}
});

const form = ref({
  avatarUrl: '',
  nickname: '',
  phone: '',
  slogan: '',
  teamId: '',
  mainStar: '',
  subStars: [] as string[]
});

const teamOptions = [
  { label: '洛杉矶湖人', value: 14 },
  { label: '金州勇士', value: 10 },
  { label: '波士顿凯尔特人', value: 1 },
  { label: '密尔沃基雄鹿', value: 2 }
];
const starOptions = [
  { label: '勒布朗·詹姆斯', value: 23 },
  { label: '斯蒂芬·库里', value: 30 },
  { label: '扬尼斯·阿德托昆博', value: 34 },
  { label: '杰森·塔图姆', value: 0 }
];

// 选择微信头像
const onChooseAvatar = (e: any) => {
  form.value.avatarUrl = e.detail.avatarUrl;
};

// 获取手机号 code，传后端换真实号码
const onGetPhoneNumber = async (e: any) => {
  if (e.detail.errMsg !== 'getPhoneNumber:ok') return;
  try {
    const res = await authApi.getPhone(e.detail.code);
    if (res.code === 0) {
      form.value.phone = res.data.phone;
    }
  } catch {
    uni.showToast({ title: '获取手机号失败', icon: 'none' });
  }
};

const handleSubmit = async () => {
  if (!form.value.nickname) {
    uni.showToast({ title: '请填写昵称', icon: 'none' }); return;
  }
  if (!form.value.phone) {
    uni.showToast({ title: '请授权手机号', icon: 'none' }); return;
  }
  if (!form.value.teamId) {
    uni.showToast({ title: '请选择主队', icon: 'none' }); return;
  }
  if (!form.value.mainStar) {
    uni.showToast({ title: '请选择主球星', icon: 'none' }); return;
  }
  if (form.value.subStars.length !== 2) {
    uni.showToast({ title: '请选择2位副球星', icon: 'none' }); return;
  }

  loading.value = true;
  try {
    const stars = [
      { starId: form.value.mainStar, role: 'main' },
      ...form.value.subStars.map(id => ({ starId: id, role: 'sub' }))
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
    emit('success');
  } catch {
    uni.showToast({ title: '提交失败，请重试', icon: 'none' });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.profile-popup {
  padding: 40rpx 32rpx 80rpx;
  max-height: 85vh;
  overflow-y: auto;

  .popup-header {
    text-align: center;
    margin-bottom: 40rpx;
    .title {
      display: block;
      font-size: 40rpx;
      font-weight: bold;
      color: #1d1d1f;
      margin-bottom: 12rpx;
    }
    .sub {
      font-size: 28rpx;
      color: #86868b;
    }
  }

  .avatar-row {
    display: flex;
    justify-content: center;
    margin-bottom: 40rpx;

    .avatar-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: none;
      border: none;
      padding: 0;
      &::after { border: none; }

      .avatar-img {
        width: 160rpx;
        height: 160rpx;
        border-radius: 50%;
        background: #e5e5e5;
        margin-bottom: 12rpx;
      }
      .avatar-tip {
        font-size: 24rpx;
        color: #86868b;
      }
    }
  }

  .field-row {
    display: flex;
    align-items: center;
    padding: 28rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &.align-start { align-items: flex-start; }

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

    .phone-area {
      flex: 1;
      .phone-value {
        font-size: 28rpx;
        color: #1d1d1f;
      }
      .phone-btn {
        height: 60rpx;
        line-height: 60rpx;
        padding: 0 28rpx;
        background: #fff0f0;
        color: #C9082A;
        font-size: 26rpx;
        border-radius: 30rpx;
        border: none;
        &::after { border: none; }
      }
    }
  }

  .submit-btn {
    margin-top: 64rpx;
  }
}
</style>
