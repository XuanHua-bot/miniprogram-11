const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { action, data } = event;
  console.log('云函数调用:', { action, data });

  try {
    switch (action) {
      case 'register':
        return await handleRegister(data);
      case 'login':
        return await handleLogin(data);
      default:
        return { success: false, message: '未知的操作类型' };
    }
  } catch (error) {
    console.error('云函数错误:', error);
    return { success: false, message: '服务器错误' };
  }
};

// 处理注册逻辑
async function handleRegister(userData) {
  const { username, password } = userData;
  
  // 检查用户名是否已存在
  const userExists = await db.collection('users')
    .where({ username })
    .get();
  
  if (userExists.data.length > 0) {
    return { success: false, message: '用户名已存在' };
  }
  
  // 存储用户信息（实际项目中密码应加密存储）
  await db.collection('users').add({
    data: {
      ...userData,
      createTime: db.serverDate()
    }
  });
  
  return { success: true, message: '注册成功' };
}

// 处理登录逻辑
async function handleLogin(loginData) {
  const { username, password } = loginData;
  
  const user = await db.collection('users')
    .where({ username, password })
    .get();
  
  if (user.data.length === 0) {
    return { success: false, message: '用户名或密码错误' };
  }
  
  return { 
    success: true, 
    message: '登录成功',
    userInfo: {
      id: user.data[0]._id,
      username: user.data[0].username
    }
  };
}  