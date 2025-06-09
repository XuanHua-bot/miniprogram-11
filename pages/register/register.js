Page({
  data: {
    username: '',
    password: '',
    confirmPassword: '',
    loading: false
  },

  // 输入事件处理
  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  onConfirmPasswordInput(e) {
    this.setData({ confirmPassword: e.detail.value });
  },

  // 表单验证
  validateForm() {
    const { username, password, confirmPassword } = this.data;
    
    if (!username.trim()) {
      wx.showToast({ title: '请输入用户名', icon: 'none' });
      return false;
    }
    
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return false;
    }
    
    if (password.length < 6) {
      wx.showToast({ title: '密码长度至少6位', icon: 'none' });
      return false;
    }
    
    if (password !== confirmPassword) {
      wx.showToast({ title: '两次输入的密码不一致', icon: 'none' });
      return false;
    }
    
    return true;
  },

  // 注册处理
  async handleRegister() {
    if (!this.validateForm()) return;
    
    this.setData({ loading: true });
    
    try {
      // 调用云函数进行注册
      const { result } = await wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'register',
          data: {
            username: this.data.username,
            password: this.data.password,
            createTime: new Date()
          }
        }
      });
      
      if (result.success) {
        wx.showToast({ title: '注册成功', icon: 'success' });
        // 注册成功后返回登录页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(result.message || '注册失败');
      }
    } catch (error) {
      console.error('注册失败:', error);
      wx.showToast({ 
        title: error.message || '注册失败，请重试', 
        icon: 'none' 
      });
    } finally {
      this.setData({ loading: false });
    }
  }
});  