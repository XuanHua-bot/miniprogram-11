const app = getApp()

Page({
  data: {
    userInfo: null,
    activeTab: 'published',
    products: [],
    loading: true,
    page: 1,
    pageSize: 10,
    hasMore: true
  },

  onLoad: function () {
    this.loadUserInfo()
  },

  onShow() {
    if (this.data.userInfo) {
      this.loadProducts();
    }
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      // 获取用户信息
      const { result } = await wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'getUserInfo'
        }
      })

      if (result && result.success) {
        this.setData({
          userInfo: result.data,
          loading: false
        })
        if (result.data) {
          this.loadProducts();
        }
      } else {
        throw new Error(result?.message || '获取用户信息失败')
      }
    } catch (error) {
      console.error('获取用户信息失败：', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      })
    }
  },

  // 加载商品列表
  async loadProducts(isLoadMore = false) {
    if (this.data.loading || (!isLoadMore && !this.data.hasMore)) return;

    this.setData({ loading: true });

    try {
      let res;
      // 获取发布/购买列表
      res = await wx.cloud.callFunction({
        name: 'product',
        data: {
          action: 'getProductList',
          data: {
            type: this.data.activeTab,
            page: isLoadMore ? this.data.page + 1 : 1,
            pageSize: this.data.pageSize
          }
        }
      });

      if (res.result.success) {
        const { list, total } = res.result.data;
        const hasMore = (isLoadMore ? this.data.page + 1 : 1) * this.data.pageSize < total;

        this.setData({
          products: isLoadMore ? [...this.data.products, ...list] : list,
          page: isLoadMore ? this.data.page + 1 : 1,
          hasMore,
          loading: false
        });
      } else {
        throw new Error(res.result.message);
      }
    } catch (err) {
      console.error('获取商品列表失败：', err);
      wx.showToast({
        title: err.message || '获取商品列表失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 标签切换
  onTabChange(e) {
    const { tab } = e.currentTarget.dataset;
    this.setData({
      activeTab: tab,
      page: 1,
      hasMore: true
    });
    this.loadProducts();
  },

  // 加载更多
  loadMore() {
    if (this.data.hasMore) {
      this.loadProducts(true);
    }
  },

  // 商品点击
  onProductTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  // 编辑资料
  onEditProfile() {
    wx.navigateTo({
      url: '/pages/edit-profile/edit-profile'
    });
  },

  // 登录
  async handleLogin() {
    try {
      // 获取用户信息
      const { userInfo } = await wx.getUserProfile({
        desc: '用于完善用户资料'
      })

      // 调用云函数登录
      const { result } = await wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'login',
          data: userInfo
        }
      })

      if (result && result.success) {
        this.setData({
          userInfo: result.data
        })
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })
      } else {
        throw new Error(result?.message || '登录失败')
      }
    } catch (error) {
      console.error('登录失败：', error)
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none'
      })
    }
  },

  // 退出登录
  async handleLogout() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'logout'
        }
      })

      if (result && result.success) {
        this.setData({
          userInfo: null,
          products: [],
          page: 1,
          hasMore: true
        })
        wx.showToast({
          title: '已退出登录',
          icon: 'success'
        })
      } else {
        throw new Error(result?.message || '退出登录失败')
      }
    } catch (error) {
      console.error('退出登录失败：', error)
      wx.showToast({
        title: error.message || '退出登录失败',
        icon: 'none'
      })
    }
  },

  // 临时：一键清空并生成测试商品
  onBatchAddProducts() {
    wx.showLoading({ title: '正在清空商品...' });
    wx.cloud.callFunction({
      name: 'clearProducts',
      success: () => {
        wx.showLoading({ title: '正在生成商品...' });
        wx.cloud.callFunction({
          name: 'batchAddProducts',
          success: res => {
            wx.hideLoading();
            wx.showToast({ title: '测试商品已生成', icon: 'success' });
            console.log('批量添加结果', res);
          },
          fail: err => {
            wx.hideLoading();
            wx.showToast({ title: '生成失败', icon: 'none' });
            console.error('批量添加失败', err);
          }
        });
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({ title: '清空失败', icon: 'none' });
        console.error('清空商品失败', err);
      }
    });
  }
}); 