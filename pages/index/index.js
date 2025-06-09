// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, data } = event
  switch (action) {
    case 'register':
      return await register(data.username, data.password);
    case 'login':
      return await login(data.username, data.password);
    default:
      return { success: false, message: '未知操作' };
  }
}

// 用户注册
async function register(username, password) {
  try {
    // 检查用户名是否已存在
    const user = await db.collection('users').where({ username }).get();
    if (user.data.length > 0) {
      return { success: false, message: '用户名已存在' };
    }
    
    // 创建新用户（实际项目中建议加密密码）
    const newUser = {
      username,
      password,
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    };
    
    const res = await db.collection('users').add({ data: newUser });
    newUser._id = res._id; // 添加自动生成的ID
    
    return { success: true, data: newUser };
  } catch (err) {
    console.error('注册失败：', err);
    return { success: false, message: '注册失败，请重试' };
  }
}

// 用户登录
async function login(username, password) {
  try {
    // 查询用户
    const user = await db.collection('users')
      .where({ username, password })
      .get();
      
    if (user.data.length === 0) {
      return { success: false, message: '用户名或密码错误' };
    }
    
    return { success: true, data: user.data[0] };
  } catch (err) {
    console.error('登录失败：', err);
    return { success: false, message: '登录失败，请重试' };
  }
}