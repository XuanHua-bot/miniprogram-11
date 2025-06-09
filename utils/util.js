const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// 记录操作日志
const logOperation = async (operation, target, details) => {
  try {
    const db = wx.cloud.database()
    await db.collection('logs').add({
      data: {
        operation,
        target,
        details,
        createTime: new Date()
      }
    })
  } catch (err) {
    console.error('记录操作日志失败：', err)
  }
}

// 检查用户权限
const checkPermission = async (operation) => {
  const db = wx.cloud.database()
  const { OPENID } = cloud.getWXContext()
  
  try {
    const userRes = await db.collection('users')
      .where({
        _openid: OPENID,
        isAdmin: true
      })
      .get()
    
    return userRes.data.length > 0
  } catch (err) {
    console.error('检查用户权限失败：', err)
    return false
  }
}

// 格式化价格
const formatPrice = price => {
  return parseFloat(price).toFixed(2)
}

// 格式化日期
const formatDate = date => {
  const now = new Date()
  const diff = now - date
  
  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚'
  }
  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`
  }
  // 小于24小时
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  }
  // 小于30天
  if (diff < 30 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
  }
  
  return formatTime(date)
}

module.exports = {
  formatTime,
  formatNumber,
  logOperation,
  checkPermission,
  formatPrice,
  formatDate
} 