const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const pexelsImages = [
  'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg',
  'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg',
  'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
  'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg'
]

const testProducts = [
  {
    title: '全新小米蓝牙耳机（未拆封）',
    price: 99,
    description: '小米原装蓝牙耳机，未拆封，支持通话、听歌，续航8小时，支持快充。购于2024年5月，因中奖多余转让。',
    category: '数码',
    images: [pexelsImages[0]],
    location: '潍坊学院南门快递点',
    sellerWxid: 'xiaomi2024'
  },
  {
    title: '考研数学三教材+真题全套',
    price: 45,
    description: '包含高数、线代、概率论教材及2015-2024年真题，部分有笔记，九成新，适合考研党。',
    category: '教材',
    images: [pexelsImages[1]],
    location: '图书馆自习室',
    sellerWxid: 'kaoyan666'
  },
  {
    title: '宜家简约书桌+椅子套装',
    price: 120,
    description: '宜家原装书桌+椅子，桌面无划痕，椅子舒适，适合宿舍/出租屋。自提优惠。',
    category: '生活用品',
    images: [pexelsImages[2]],
    location: '学生公寓A区',
    sellerWxid: 'yijia2024'
  },
  {
    title: 'Nike Air Max 运动鞋 42码',
    price: 180,
    description: 'Nike正品，2023年购入，穿过3次，鞋底无磨损，附原盒。因码数不合转让。',
    category: '运动',
    images: [pexelsImages[3]],
    location: '操场门口',
    sellerWxid: 'nikefans'
  }
]

exports.main = async () => {
  try {
    const batch = []
    for (const p of testProducts) {
      batch.push(db.collection('products').add({ data: { ...p, createTime: db.serverDate(), updateTime: db.serverDate() } }))
    }
    await Promise.all(batch)
    return { success: true, message: '已批量添加测试商品' }
  } catch (e) {
    return { success: false, message: e.message }
  }
} 