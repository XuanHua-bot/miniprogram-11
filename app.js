// app.js
App({
  onLaunch: function() {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloudbase-5gugwmg4321fd011', // 替换为你的云环境ID
        traceUser: true,
      });
    }

    // 检查用户登录状态（可选）
    this.checkLoginStatus();
  },

  // 检查用户登录状态
  checkLoginStatus: function() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }
  },

  // 全局数据
  globalData: {
    userInfo: null, // 用户信息
    systemInfo: null, // 系统信息
  },

  // 获取系统信息（设备信息）
  getSystemInfo: function() {
    if (!this.globalData.systemInfo) {
      this.globalData.systemInfo = wx.getSystemInfoSync();
    }
    return this.globalData.systemInfo;
  },

  // 显示错误提示
  showErrorToast: function(msg) {
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 2000
    });
  },

  // 显示成功提示
  showSuccessToast: function(msg) {
    wx.showToast({
      title: msg,
      icon: 'success',
      duration: 2000
    });
  },

  // 显示加载中提示
  showLoading: function(msg = '加载中') {
    wx.showLoading({
      title: msg,
      mask: true
    });
  },

  // 隐藏加载提示
  hideLoading: function() {
    wx.hideLoading();
  },
});