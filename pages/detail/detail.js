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
    this.productId = options.id;
    this.getProductDetail();
  },

  onShow: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
  },

  getProductDetail() {
    wx.cloud.callFunction({
      name: 'product',
      data: { action: 'getProductDetail', data: { id: this.productId } },
      success: res => {
        if (res.result.success) {
          this.setData({ product: res.result.data });
        } else {
          throw new Error(res?.message || '获取商品详情失败')
        }
      }
    });
  },

  onBack() {
    wx.navigateBack({ delta: 1 });
  },

  onContact() {
    const wxid = this.data.product.sellerWxid || 'testwxid123';
    wx.showModal({
      title: '联系卖家',
      content: `微信号：${wxid}`,
      confirmText: '复制微信号',
      success: res => {
        if (res.confirm) {
          wx.setClipboardData({ data: wxid });
        }
      }
    });
  },

  onBuy() {
    const cart = wx.getStorageSync('cart') || [];
    if (!cart.some(i => i._id === this.data.product._id)) {
      cart.push(this.data.product);
      wx.setStorageSync('cart', cart);
      wx.showToast({ title: '已加入购物车', icon: 'success' });
    } else {
      wx.showToast({ title: '已在购物车', icon: 'none' });
    }
  },

  previewImage: function (e) {
    const current = e.currentTarget.dataset.src
    wx.previewImage({
      current,
      urls: this.data.product.images
    })
  },

  async onBuyTap() {
    if (!app.globalData.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    if (this.data.isOwner) {
      wx.showToast({
        title: '不能购买自己的商品',
        icon: 'none'
      })
      return
    }

    if (this.data.isPurchased) {
      wx.showToast({
        title: '已购买此商品',
        icon: 'none'
      })
      return
    }

    try {
      const res = await wx.cloud.callFunction({
        name: 'product',
        data: {
          action: 'purchaseProduct',
          productId: this.data.product._id
        }
      })

      if (res.result && res.result.success) {
        wx.showToast({
          title: '购买成功',
          icon: 'success'
        })
        this.setData({
          isPurchased: true
        })
      } else {
        throw new Error(res.result?.message || '购买失败')
      }
    } catch (err) {
      console.error('购买商品失败：', err)
      wx.showToast({
        title: '购买失败',
        icon: 'none'
      })
    }
  },

  onContactTap() {
    if (!app.globalData.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: `/pages/chat/chat?userId=${this.data.product.publisherId}`
    })
  },

  editProduct: function () {
    wx.navigateTo({
      url: `/pages/publish/publish?id=${this.data.product._id}`
    })
  },

  async onDeleteTap() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个商品吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const res = await wx.cloud.callFunction({
              name: 'product',
              data: {
                action: 'deleteProduct',
                id: this.data.product._id
              }
            })

            if (res.result && res.result.success) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              setTimeout(() => {
                wx.navigateBack()
              }, 1500)
            } else {
              throw new Error(res.result?.message || '删除失败')
            }
          } catch (err) {
            console.error('删除商品失败：', err)
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },
}) 