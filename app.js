// app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloudbase-5gugwmg4321fd011',
        traceUser: true,
      });
    }
    // 新API获取系统信息
    const deviceInfo = wx.getDeviceInfo ? wx.getDeviceInfo() : {};
    const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : {};
    const appBaseInfo = wx.getAppBaseInfo ? wx.getAppBaseInfo() : {};
    this.globalData = {
      userInfo: null,
      deviceInfo,
      windowInfo,
      appBaseInfo
    };
  },
  globalData: {
    userInfo: null,
    deviceInfo: null,
    windowInfo: null,
    appBaseInfo: null
  }
});
