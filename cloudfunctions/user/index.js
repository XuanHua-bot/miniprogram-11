// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, data } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  switch (action) {
    case 'getUserInfo':
      return await getUserInfo(openid)
    case 'updateUserInfo':
      return await updateUserInfo(openid, data)
    default:
      return {
        success: false,
        message: '未知的操作类型'
      }
  }
}

// 获取用户信息
async function getUserInfo(openid) {
  try {
    const userInfo = await db.collection('users').doc(openid).get()
    return {
      success: true,
      data: userInfo.data
    }
  } catch (err) {
    console.error('获取用户信息失败：', err)
    return {
      success: false,
      message: '获取用户信息失败'
    }
  }
}

// 更新用户信息
async function updateUserInfo(openid, userInfo) {
  try {
    await db.collection('users').doc(openid).update({
      data: {
        ...userInfo,
        updateTime: db.serverDate()
      }
    })
    return {
      success: true,
      message: '更新成功'
    }
  } catch (err) {
    console.error('更新用户信息失败：', err)
    return {
      success: false,
      message: '更新用户信息失败'
    }
  }
}

// 获取用户发布的商品
async function getUserProducts(openid, { page = 1, pageSize = 10 }) {
  try {
    const total = await db.collection('products')
      .where({
        _openid: openid
      })
      .count()

    const products = await db.collection('products')
      .where({
        _openid: openid
      })
      .orderBy('createTime', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    return {
      success: true,
      data: {
        list: products.data,
        total: total.total,
        page,
        pageSize
      }
    }
  } catch (err) {
    console.error('获取用户发布的商品失败：', err)
    return {
      success: false,
      message: '获取用户发布的商品失败'
    }
  }
} 