// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, data } = event
  switch (action) {
    case 'getUserInfo':
      return await getUserInfo(data.id);
    case 'updateUserInfo':
      return await updateUserInfo(data.id, data.userInfo);
    case 'register':
      return await register(data.username, data.password);
    case 'login':
      return await login(data.username, data.password);
    default:
      return {
        success: false,
        message: '未知的操作类型'
      }
  }
}

// 获取用户信息
async function getUserInfo(id) {
  try {
    const userInfo = await db.collection('users').doc(id).get()
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
async function updateUserInfo(id, userInfo) {
  try {
    await db.collection('users').doc(id).update({
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

// 注册用户
async function register(username, password) {
  try {
    const user = await db.collection('users').where({ username }).get();
    if (user.data.length > 0) {
      return {
        success: false,
        message: '用户名已存在'
      };
    }
    const newUser = {
      username,
      password,
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    };
    const res = await db.collection('users').add({
      data: newUser
    });
    newUser._id = res._id;
    return {
      success: true,
      data: newUser
    };
  } catch (err) {
    console.error('注册用户失败：', err);
    return {
      success: false,
      message: '注册用户失败'
    };
  }
}

// 用户登录
async function login(username, password) {
  try {
    const user = await db.collection('users').where({ username, password }).get();
    if (user.data.length === 0) {
      return {
        success: false,
        message: '用户名或密码错误'
      };
    }
    return {
      success: true,
      data: user.data[0]
    };
  } catch (err) {
    console.error('用户登录失败：', err);
    return {
      success: false,
      message: '用户登录失败'
    };
  }
}