// 加载 dotenv 库
import axios from 'axios';

// 创建 Axios 实例
const api = axios.create({
  // 使用 .env 文件中配置的 API_BASE_URL
  baseURL: process.env.REACT_APP_API_BASE_URL, 
  timeout: 10000, // 请求超时时间
});

// 封装上传图片的请求
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await api.post('/gridfs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('上传图片失败:', error);
    throw error;
  }
};

// 封装获取图片列表的请求
export const getImageList = async () => {
  try {
    const response = await api.get('/gridfs/list');
    return response.data;
  } catch (error) {
    console.error('获取图片列表失败:', error);
    throw error;
  }
};

// 封装下载图片的请求
export const downloadImage = async (filename) => {
  try {
    const response = await api.get(`/gridfs/download/${filename}`, {
      responseType: 'blob', // 以二进制流形式接收响应
    });
    return response.data;
  } catch (error) {
    console.error('下载图片失败:', error);
    throw error;
  }
};