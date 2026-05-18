import request from '@/utils/request';

export const authApi = {
  login(code: string) {
    return request({ url: '/auth/login', method: 'POST', data: { code } });
  },
  getPhone(code: string) {
    return request({ url: '/auth/phone', method: 'POST', data: { code } });
  },
  initProfile(data: { avatarUrl: string; nickname: string; phone: string | null }) {
    return request({ url: '/auth/init-profile', method: 'POST', data });
  }
};

export const userApi = {
  initProfile(data: any) {
    return request({ url: '/user/profile/init', method: 'POST', data });
  },
  getInfo() {
    return request({ url: '/user/info', method: 'GET' });
  }
};

export const dataApi = {
  getTodayStar() {
    return request({ url: '/data/today-star', method: 'GET' });
  },
  getTeams() {
    return request({ url: '/data/teams', method: 'GET' });
  },
  searchTeams(keyword: string) {
    return request({ url: `/data/teams/search?keyword=${encodeURIComponent(keyword)}`, method: 'GET' });
  },
  searchStars(keyword: string) {
    return request({ url: `/data/stars/search?keyword=${encodeURIComponent(keyword)}`, method: 'GET' });
  },
  getNews(type: string) {
    return request({ url: `/data/news?type=${type}`, method: 'GET' });
  }
};
