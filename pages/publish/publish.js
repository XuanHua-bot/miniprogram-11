const app = getApp()

Page({
  data: {
    title: '',
    description: '',
    price: '',
    location: '',
    images: [],
    tagList: ['数码', '教材', '生活用品', '运动'],
    categoryIndex: null,
    loading: false
  },

  onLoad() {
    if (!app.globalData.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      wx.navigateTo({
        url: '/pages/login/login'
      });
      return;
    }
    // 初始化云环境
    wx.cloud.init({
      env: 'cloudbase-5gugwmg4321fd011'
    });
  },

  // 其他代码保持不变...
})