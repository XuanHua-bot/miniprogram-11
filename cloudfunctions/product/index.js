// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化云环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 随机图片数组 - 使用Pexels的免费图片
const randomImages = [
  'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg', // 电子产品
  'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg', // 书籍
  'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg', // 运动鞋
  'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg', // 电子产品
  'https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg', // 书籍
  'https://images.pexels.com/photos/2529147/pexels-photo-2529147.jpeg', // 运动鞋
  'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg', // 电子产品
  'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg', // 书籍
  'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg', // 运动鞋
  'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg'  // 电子产品
]

const pexelsImages = [
  'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg',
  'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg',
  'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
  'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg'
];

// 获取随机图片
function getRandomImage() {
  const index = Math.floor(Math.random() * randomImages.length)
  return randomImages[index]
}

function getPexelsImage() {
  const idx = Math.floor(Math.random() * pexelsImages.length);
  return pexelsImages[idx];
}

// 处理商品图片
function processProductImages(product) {
  if (!product.images || product.images.length === 0) {
    // 根据商品分类选择对应的随机图片
    let categoryImages = randomImages
    if (product.category === 'digital') {
      categoryImages = randomImages.filter((_, index) => [0, 3, 6, 9].includes(index))
    } else if (product.category === 'book') {
      categoryImages = randomImages.filter((_, index) => [1, 4, 7].includes(index))
    } else if (product.category === 'other') {
      categoryImages = randomImages.filter((_, index) => [2, 5, 8].includes(index))
    }
    const index = Math.floor(Math.random() * categoryImages.length)
    product.images = [categoryImages[index]]
  }
  return product
}

// 获取商品列表
async function getProductList(data) {
  try {
    const { category, page = 1, pageSize = 10 } = data || {}
    const skip = (page - 1) * pageSize
    let query = {}
    if (category && category !== 'all') {
      query.category = category
    }
    const { data: products, total } = await db.collection('products')
      .where(query)
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()
    // 自动补全图片
    const fixedProducts = products.map(p => {
      if (!p.images || !Array.isArray(p.images) || p.images.length === 0) {
        p.images = [getPexelsImage()];
      }
      return p;
    });
    return {
      success: true,
      data: fixedProducts,
      total
    }
  } catch (error) {
    console.error('获取商品列表失败：', error)
    return {
      success: false,
      message: error.message || '获取商品列表失败'
    }
  }
}

// 获取商品详情
async function getProductDetail(data) {
  try {
    const { id } = data || {}
    if (!id) {
      throw new Error('商品ID不能为空')
    }

    const { data: product } = await db.collection('products')
      .doc(id)
      .get()

    if (!product) {
      throw new Error('商品不存在')
    }

    return {
      success: true,
      data: product
    }
  } catch (error) {
    console.error('获取商品详情失败：', error)
    return {
      success: false,
      message: error.message || '获取商品详情失败'
    }
  }
}

// 创建商品
async function createProduct(data) {
  try {
    let { title, price, description, category, images, location } = data || {}
    if (!title || !price || !description || !category || !location) {
      throw new Error('商品信息不完整')
    }
    if (!images || !Array.isArray(images) || images.length === 0) {
      images = [getPexelsImage()];
    }
    const { _id } = await db.collection('products').add({
      data: {
        title,
        price,
        description,
        category,
        images,
        location,
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })
    return {
      success: true,
      data: { _id }
    }
  } catch (error) {
    console.error('创建商品失败：', error)
    return {
      success: false,
      message: error.message || '创建商品失败'
    }
  }
}

// 更新商品
async function updateProduct(data) {
  try {
    const { id, ...updateData } = data || {}
    if (!id) {
      throw new Error('商品ID不能为空')
    }

    await db.collection('products')
      .doc(id)
      .update({
        data: {
          ...updateData,
          updateTime: db.serverDate()
        }
      })

    return {
      success: true
    }
  } catch (error) {
    console.error('更新商品失败：', error)
    return {
      success: false,
      message: error.message || '更新商品失败'
    }
  }
}

// 删除商品
async function deleteProduct(data) {
  try {
    const { id } = data || {}
    if (!id) {
      throw new Error('商品ID不能为空')
    }

    await db.collection('products')
      .doc(id)
      .remove()

    return {
      success: true
    }
  } catch (error) {
    console.error('删除商品失败：', error)
    return {
      success: false,
      message: error.message || '删除商品失败'
    }
  }
}

// 搜索商品
async function searchProducts(data) {
  try {
    const { keyword, page = 1, pageSize = 10 } = data || {}
    const skip = (page - 1) * pageSize

    const { data: products, total } = await db.collection('products')
      .where(_.or([
        {
          title: db.RegExp({
            regexp: keyword,
            options: 'i'
          })
        },
        {
          description: db.RegExp({
            regexp: keyword,
            options: 'i'
          })
        }
      ]))
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    return {
      success: true,
      data: products,
      total
    }
  } catch (error) {
    console.error('搜索商品失败：', error)
    return {
      success: false,
      message: error.message || '搜索商品失败'
    }
  }
}

// 自动生成测试数据
async function autoInitTestData() {
  const countRes = await db.collection('products').count();
  if (countRes.total === 0) {
    const testProducts = [
      {
        title: '二手iPhone 12',
        price: 1999,
        description: '成色95新，配件齐全',
        category: '数码',
        images: ['https://cdn.jsdelivr.net/gh/WeifangCampus2nd/asset/iphone12.jpg'],
        location: '潍坊学院南门',
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      },
      {
        title: '考研数学教材',
        price: 30,
        description: '无笔记，几乎全新',
        category: '教材',
        images: ['https://cdn.jsdelivr.net/gh/WeifangCampus2nd/asset/book.jpg'],
        location: '图书馆',
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      },
      {
        title: '运动鞋',
        price: 80,
        description: '42码，穿过几次',
        category: '生活用品',
        images: ['https://cdn.jsdelivr.net/gh/WeifangCampus2nd/asset/shoes.jpg'],
        location: '操场',
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    ];
    for (const p of testProducts) {
      await db.collection('products').add({ data: p });
    }
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  await autoInitTestData();
  const { action, data } = event

  switch (action) {
    case 'getProductList':
      return await getProductList(data)
    case 'getProductDetail':
      return await getProductDetail(data)
    case 'createProduct':
      return await createProduct(data)
    case 'updateProduct':
      return await updateProduct(data)
    case 'deleteProduct':
      return await deleteProduct(data)
    case 'searchProducts':
      return await searchProducts(data)
    default:
      return {
        success: false,
        message: '未知的操作类型'
      }
  }
} 