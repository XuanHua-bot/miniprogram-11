Component({
  data: {
    selected: 0,
    color: "#999999",
    selectedColor: "#ff4d4f",
    list: [{
      pagePath: "/pages/index/index",
      text: "首页",
      iconPath: "/images/tabbar/home.png",
      selectedIconPath: "/images/tabbar/home-active.png"
    }, {
      pagePath: "/pages/market/market",
      text: "市场",
      iconPath: "/images/tabbar/market.png",
      selectedIconPath: "/images/tabbar/market-active.png"
    }, {
      pagePath: "/pages/publish/publish",
      text: "出售",
      iconPath: "/images/tabbar/publish.png",
      selectedIconPath: "/images/tabbar/publish-active.png"
    }, {
      pagePath: "/pages/cart/cart",
      text: "购物车",
      iconPath: "/images/tabbar/market.png",
      selectedIconPath: "/images/tabbar/market-active.png"
    }, {
      pagePath: "/pages/profile/profile",
      text: "我的",
      iconPath: "/images/tabbar/profile.png",
      selectedIconPath: "/images/tabbar/profile-active.png"
    }]
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({
        url
      })
      this.setData({
        selected: data.index
      })
    }
  }
}) 