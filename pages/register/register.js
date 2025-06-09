// pages/register/register.js
Page({
  data: {
    username: '',
    password: '',
    confirmPassword: ''
  },

  onInput(e) {
    const { name } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({ [name]: value });
  },

  async handleRegister() {
    const { username, password, confirmPassword } = this.data;
    
    if (!username || !password) {
      wx.showToast({
        title: '用户名和密码不能为空',
        icon: 'none'
      });
      return;
    }
    
    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次输入的密码不一致',
        icon: 'none'
      });
      return;
    }

    try {
      wx.showLoading({ title: '注册中...' });
      const { result } = await wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'register',
          data: { username, password }
        }
      });
      wx.hideLoading();

      if (result && result.success) {
        wx.showToast({
          title: '注册成功，请登录',
          icon: 'success'
        });
        
        // 延迟返回登录页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(result?.message || '注册失败');
      }
    } catch (error) {
      console.error('注册失败：', error);
      wx.hideLoading();
      wx.showToast({
        title: error.message || '注册失败，请重试',
        icon: 'none'
      });
    }
  }
});