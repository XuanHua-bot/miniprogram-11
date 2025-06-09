const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 创建商品集合
    try {
      await db.createCollection('products')
      console.log('创建商品集合成功')
    } catch (err) {
      console.log('商品集合已存在')
    }

    // 创建用户集合
    try {
      await db.createCollection('users')
      console.log('创建用户集合成功')
    } catch (err) {
      console.log('用户集合已存在')
    }

    // 创建收藏集合
    // try {
    //   await db.createCollection('favorites')
    //   console.log('创建收藏集合成功')
    // } catch (err) {
    //   console.log('收藏集合已存在')
    // }

    return {
      success: true,
      message: '初始化成功'
    }
  } catch (error) {
    console.error('初始化失败：', error)
    return {
      success: false,
      message: error.message || '初始化失败'
    }
  }
}

// 创建测试用户
async function createTestUser() {
  try {
    const user = {
      _id: 'test_user_001',
      nickName: '测试用户',
      avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    }
    await db.collection('users').add({
      data: user
    })
    console.log('测试用户创建成功')
    return user
  } catch (err) {
    console.error('创建测试用户失败：', err)
    throw err
  }
}

// 创建测试商品
async function createTestProducts(user) {
  const products = [
    {
      title: 'iPhone 13 Pro Max',
      price: 6999,
      description: '95新，无维修，配件齐全',
      category: 'digital',
      location: '潍坊学院',
      images: [
        'https://img.alicdn.com/imgextra/i1/2200724907121/O1CN01Z5paLz22AdGf4j5jv_!!2200724907121.jpg',
        'https://img.alicdn.com/imgextra/i2/2200724907121/O1CN01Z5paLz22AdGf4j5jv_!!2200724907121.jpg'
      ],
      publisher: {
        _id: user._id,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl
      },
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
      status: 'on_sale'
    },
    {
      title: '高等数学教材',
      price: 20,
      description: '全新，未使用',
      category: 'books',
      location: '潍坊学院图书馆',
      images: [
        'https://img.alicdn.com/imgextra/i3/2200724907121/O1CN01Z5paLz22AdGf4j5jv_!!2200724907121.jpg'
      ],
      publisher: {
        _id: user._id,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl
      },
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
      status: 'on_sale'
    },
    {
      title: 'Nike Air Force 1',
      price: 599,
      description: '9成新，42码',
      category: 'clothes',
      location: '潍坊学院宿舍',
      images: [
        'https://img.alicdn.com/imgextra/i4/2200724907121/O1CN01Z5paLz22AdGf4j5jv_!!2200724907121.jpg'
      ],
      publisher: {
        _id: user._id,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl
      },
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
      status: 'on_sale'
    },
    {
      title: '小米手环7',
      price: 199,
      description: '全新未拆封',
      category: 'digital',
      location: '潍坊学院快递点',
      images: [
        'https://img.alicdn.com/imgextra/i5/2200724907121/O1CN01Z5paLz22AdGf4j5jv_!!2200724907121.jpg'
      ],
      publisher: {
        _id: user._id,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl
      },
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
      status: 'on_sale'
    },
    {
      title: '考研政治资料',
      price: 50,
      description: '2024考研政治全套资料',
      category: 'books',
      location: '潍坊学院教学楼',
      images: [
        'https://img.alicdn.com/imgextra/i6/2200724907121/O1CN01Z5paLz22AdGf4j5jv_!!2200724907121.jpg'
      ],
      publisher: {
        _id: user._id,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl
      },
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
      status: 'on_sale'
    }
  ]

  try {
    for (const product of products) {
      await db.collection('products').add({
        data: product
      })
    }
    console.log('测试商品创建成功')
  } catch (err) {
    console.error('创建测试商品失败：', err)
    throw err
  }
} 