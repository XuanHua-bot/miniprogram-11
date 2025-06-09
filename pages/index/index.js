// index.js
const app = getApp()

Page({
  data: {
    categories: ['数码', '教材', '生活用品', '其他'],
    currentCategory: '',
    searchKey: '',
    products: [],
    loading: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    productList: []
  },

  onLoad() {
    // 初始化云环境
    wx.cloud.init({
      env: 'cloudbase-5gugwmg4321fd011'
    });

    this.getProductList();
  },

  onShow() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
    this.getProductList();
  },

  onPullDownRefresh() {
    this.getProductList(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    this.loadProducts()
  },

  getProductList(cb) {
    wx.cloud.callFunction({
      name: 'product',
      data: { action: 'getProductList', data: {} },
      success: res => {
        this.setData({ productList: res.result.data || [] });
        cb && cb();
      },
      fail: err => {
        wx.showToast({ title: '加载失败', icon: 'none' });
        cb && cb();
      }
    });
  },

  async loadProducts(isLoadMore = false) {
    if (this.data.loading || (!isLoadMore && !this.data.hasMore)) return;

    this.setData({ loading: true });

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'product',
        data: {
          action: 'getProductList',
          data: {
            page: this.data.page,
            pageSize: this.data.pageSize
          }
        }
      });

      if (result && result.success) {
        // 处理商品图片
        const products = result.data.map(product => ({
          ...product,
          images: product.images && product.images.length > 0 
            ? product.images 
            : ['/images/default-product.png']
        }));

        this.setData({
          products: [...this.data.products, ...products],
          hasMore: products.length === this.data.pageSize,
          loading: false
        });
      } else {
        throw new Error(result?.message || '获取商品列表失败');
      }
    } catch (error) {
      console.error('加载商品列表失败：', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  onSearchInput(e) {
    this.setData({
      searchKey: e.detail.value
    });
  },

  clearSearch() {
    this.setData({
      searchKey: '',
      page: 1,
      hasMore: true
    });
    this.loadProducts();
  },

  onSearch() {
    this.setData({
      page: 1,
      hasMore: true
    });
    this.loadProducts();
  },

  onCategoryTap(e) {
    const { category } = e.currentTarget.dataset;
    this.setData({
      currentCategory: category,
      page: 1,
      hasMore: true
    });
    this.loadProducts();
  },

  loadMore() {
    if (this.data.hasMore) {
      this.loadProducts(true);
    }
  },

  onProductTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },

  onPublishTap() {
    wx.navigateTo({
      url: '/pages/publish/publish'
    });
  },

  formatTime(date) {
    date = new Date(date)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) { // 1分钟内
      return '刚刚'
    } else if (diff < 3600000) { // 1小时内
      return Math.floor(diff / 60000) + '分钟前'
    } else if (diff < 86400000) { // 1天内
      return Math.floor(diff / 3600000) + '小时前'
    } else if (diff < 604800000) { // 1周内
      return Math.floor(diff / 86400000) + '天前'
    } else {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }
  },

  async initTestData() {
    try {
      wx.showLoading({
        title: '初始化中...',
        mask: true
      })

      const res = await wx.cloud.callFunction({
        name: 'product',
        data: {
          type: 'init'
        }
      })

      if (res.result.success) {
        wx.showToast({
          title: '初始化成功',
          icon: 'success'
        })
        this.loadProducts(true)
      } else {
        throw new Error(res.result.message)
      }
    } catch (err) {
      console.error('初始化测试数据失败：', err)
      wx.showToast({
        title: '初始化失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  }
})
