const app = getApp()

Page({
  data: {
    product: {},
    loading: true,
    isOwner: false,
    userInfo: null,
    isPurchased: false
  },

  onLoad(options) {
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
    this.productId = options.id;
    this.getProductDetail();
  },

  // 其他代码保持不变...
})