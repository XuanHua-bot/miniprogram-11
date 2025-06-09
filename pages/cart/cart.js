Page({
  data: {
    cart: []
  },
  onShow() {
    this.loadCart();
  },
  loadCart() {
    const cart = wx.getStorageSync('cart') || [];
    this.setData({ cart });
  },
  onProductTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },
  onRemove(e) {
    const id = e.currentTarget.dataset.id;
    let cart = wx.getStorageSync('cart') || [];
    cart = cart.filter(i => i._id !== id);
    wx.setStorageSync('cart', cart);
    this.loadCart();
    wx.showToast({ title: '已移除', icon: 'none' });
  }
}); 