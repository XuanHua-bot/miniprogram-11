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
    // 初始化云环境
    wx.cloud.init({
      env: 'cloudbase-5gugwmg4321fd011'
    });

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
  },

  // 输入框内容变化处理
  onInput(e) {
    const { name, value } = e.detail;
    this.setData({ [name]: value });
  },

  // 选择分类
  onCategoryChange(e) {
    this.setData({ categoryIndex: e.detail.value });
  },

  // 选择图片
  onChooseImage() {
    wx.chooseImage({
      count: 3 - this.data.images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        this.setData({ images: this.data.images.concat(res.tempFilePaths) });
      }
    });
  },

  // 删除图片
  deleteImage(e) {
    const { index } = e.currentTarget.dataset;
    const images = this.data.images;
    images.splice(index, 1);
    this.setData({ images });
  },

  // 预览图片
  previewImage(e) {
    const { url } = e.currentTarget.dataset;
    wx.previewImage({
      current: url,
      urls: this.data.images
    });
  },

  // 表单验证
  validateForm() {
    const { title, price, category, description, location, images } = this.data;
    
    if (!title.trim()) {
      wx.showToast({
        title: '请输入商品标题',
        icon: 'none'
      });
      return false;
    }

    if (!price.trim()) {
      wx.showToast({
        title: '请输入商品价格',
        icon: 'none'
      });
      return false;
    }

    if (!category) {
      wx.showToast({
        title: '请选择商品分类',
        icon: 'none'
      });
      return false;
    }

    if (!description.trim()) {
      wx.showToast({
        title: '请输入商品描述',
        icon: 'none'
      });
      return false;
    }

    if (!location.trim()) {
      wx.showToast({
        title: '请输入交易地点',
        icon: 'none'
      });
      return false;
    }

    if (images.length === 0) {
      wx.showToast({
        title: '请至少上传一张图片',
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  async uploadImages() {
    try {
      const uploadTasks = this.data.images.map(filePath => {
        return wx.cloud.uploadFile({
          cloudPath: `products/${Date.now()}-${Math.random().toString(36).substr(2)}.${filePath.match(/\.(\w+)$/)[1]}`,
          filePath
        });
      });

      const uploadResults = await Promise.all(uploadTasks);
      return uploadResults.map(res => res.fileID);
    } catch (error) {
      console.error('上传图片失败：', error);
      throw new Error('上传图片失败');
    }
  },

  async handleSubmit() {
    try {
      if (!this.data.title || !this.data.price || !this.data.description || !this.data.images.length) {
        wx.showToast({
          title: '请填写完整信息',
          icon: 'none'
        });
        return;
      }

      wx.showLoading({ title: '发布中...' });

      // 上传图片
      const fileIDs = await this.uploadImages();

      // 发布商品
      const { result } = await wx.cloud.callFunction({
        name: 'product',
        data: {
          action: 'createProduct',
          product: {
            title: this.data.title,
            price: parseFloat(this.data.price),
            description: this.data.description,
            category: this.data.tagList[this.data.categoryIndex],
            location: this.data.location,
            images: fileIDs
          }
        }
      });

      if (result && result.success) {
        wx.showToast({
          title: '发布成功',
          icon: 'success'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(result?.message || '发布失败');
      }
    } catch (error) {
      console.error('发布商品失败：', error);
      wx.showToast({
        title: error.message || '发布失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  }
}) 