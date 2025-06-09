const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
  try {
    const { data } = await db.collection('products').get()
    const batch = []
    for (const item of data) {
      batch.push(db.collection('products').doc(item._id).remove())
    }
    await Promise.all(batch)
    return { success: true, message: '已清空所有商品' }
  } catch (e) {
    return { success: false, message: e.message }
  }
} 