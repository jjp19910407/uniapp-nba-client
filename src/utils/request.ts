// 优先从本地缓存读取API地址，没有则使用默认地址
const getBaseUrl = () => {
  const customUrl = uni.getStorageSync('apiBaseUrl');
  return customUrl || 'http://192.168.31.100:3001/api';
};

const BASE_URL = getBaseUrl();

function request<T = any>(options: {
  url: string;
  method?: 'GET' | 'POST';
  data?: any;
}): Promise<{ code: number; msg: string; data: T }> {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token');

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      timeout: 10000,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res: any) => {
        if (res.data.code === 0) {
          resolve(res.data);
        } else {
          uni.showToast({ title: res.data.msg || '请求失败', icon: 'none' });
          reject(res.data);
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      }
    });
  });
}

export default request;
