// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, data } = event

  switch (action) {
    case 'upload':
      return await uploadImage(data)
    case 'delete':
      return await deleteImage(data)
    default:
      return {
        success: false,
        message: '未知的操作类型'
      }
  }
}

// 上传图片
async function uploadImage(data) {
  try {
    const { fileID } = data
    if (!fileID) {
      throw new Error('缺少文件ID')
    }

    // 获取文件信息
    const { fileList } = await cloud.getTempFileURL({
      fileList: [fileID]
    })

    if (!fileList || fileList.length === 0) {
      throw new Error('获取文件信息失败')
    }

    return {
      success: true,
      data: fileList[0].tempFileURL
    }
  } catch (error) {
    console.error('上传图片失败：', error)
    return {
      success: false,
      message: error.message || '上传图片失败'
    }
  }
}

// 删除图片
async function deleteImage(data) {
  try {
    const { fileID } = data
    if (!fileID) {
      throw new Error('缺少文件ID')
    }

    await cloud.deleteFile({
      fileList: [fileID]
    })

    return {
      success: true,
      message: '删除成功'
    }
  } catch (error) {
    console.error('删除图片失败：', error)
    return {
      success: false,
      message: error.message || '删除图片失败'
    }
  }
} 