const app = getApp()

Page({
  data: {
    products: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    currentCategory: 'all',
    categories: [
      { id: 'all', name: '全部' },
      { id: 'digital', name: '数码' },
      { id: 'book', name: '书籍' },
      { id: 'other', name: '其他' }
    ],
    searchValue: '',
    sortBy: 'createTime',
    sortOrder: 'desc',
    productList: [],
    tagList: ['数码','教材','生活用品','运动'],
    currentTag: '全部'
  },

  onLoad() {
    // 初始化云环境
    if (!wx.cloud) {
      wx.showToast({
        title: '请使用 2.2.3 或以上的基础库以使用云能力',
        icon: 'none'
      })
      return
    }
    wx.cloud.init({
      env: 'cloudbase-5gugwmg4321fd011',
      traceUser: true
    })
    this.loadProducts()
  },

  onShow() {
    this.setData({ products: [], page: 1, hasMore: true }, () => {
      this.getProductList();
    });
  },

  onPullDownRefresh() {
    this.setData({
      products: [],
      page: 1,
      hasMore: true
    }, async () => {
      await this.loadProducts()
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    this.loadProducts()
  },

  async loadProducts() {
    if (this.data.loading || !this.data.hasMore) return

    this.setData({ loading: true })
    try {
      console.log('开始调用云函数获取商品列表')
      const { result } = await wx.cloud.callFunction({
        name: 'product',
        data: {
          action: 'getProductList',
          data: {
            category: this.data.currentCategory,
            keyword: this.data.searchValue
          }
        }
      })

      if (result && result.success) {
        const newProducts = result.data
        this.setData({
          products: [...this.data.products, ...newProducts],
          hasMore: newProducts.length === this.data.pageSize,
          loading: false
        })
      } else {
        throw new Error(result?.message || '获取商品列表失败')
      }
    } catch (error) {
      console.error('调用云函数失败：', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  onCategoryChange(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      currentCategory: category,
      products: [],
      page: 1,
      hasMore: true
    }, () => {
      this.loadProducts()
    })
  },

  onSearch(e) {
    this.setData({
      searchValue: e.detail.value,
      products: [],
      page: 1,
      hasMore: true
    }, () => {
      this.loadProducts()
    })
  },

  onSortChange(e) {
    const { field, order } = e.detail
    this.setData({
      sortBy: field,
      sortOrder: order,
      products: [],
      page: 1,
      hasMore: true
    }, () => {
      this.loadProducts()
    })
  },

  onProductTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },

  onTagTap(e) {
    this.setData({ currentTag: e.currentTarget.dataset.tag }, this.getProductList);
  },

  getProductList() {
    wx.cloud.callFunction({
      name: 'product',
      data: {
        action: 'getProductList',
        data: {
          category: this.data.currentTag === '全部' ? '' : this.data.currentTag
        }
      },
      success: res => {
        this.setData({ productList: res.result.data || [] });
      },
      fail: err => {
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
    });
  },

  onPublish() {
    wx.navigateTo({ url: '/pages/publish/publish' });
  }
}) 