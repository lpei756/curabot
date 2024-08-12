import axiosApiInstance from '../utils/axiosInstance';
import { API_PATH } from '../utils/urlRoutes';

// 用于解析和检查 token 是否有效的函数
function parseToken(token) {
  try {
    const payloadBase64 = token.split('.')[1]; // 获取 payload 部分
    const decodedPayload = atob(payloadBase64); // 解码 Base64 字符串
    const payload = JSON.parse(decodedPayload); // 解析 JSON

    const currentTime = Math.floor(Date.now() / 1000); // 当前时间戳（秒）
    if (payload.exp && currentTime > payload.exp) {
      console.log('Token 已过期');
      return false;
    } else {
      console.log('Token 有效');
      return true;
    }
  } catch (e) {
    console.error('解析 token 时出错:', e);
    return false;
  }
}

// 创建预约
export const createAppointment = async (appointmentData) => {
  try {
    const response = await axiosApiInstance.post(API_PATH.appointment.create, appointmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating appointment:', error.message);
    throw error;
  }
};

// 获取用户的预约列表
export const fetchUserAppointments = async () => {
  const token = localStorage.getItem('token');
  const isValid = parseToken(token);  // 检查 token 是否有效

  if (!isValid) {
    console.error('Token 无效，无法发送请求');
    alert('Your session has expired, please log in again.');
    return; // 或者抛出错误，或者重定向
  }

  try {
    console.log('Token used for fetch:', token);
    const response = await fetch(API_PATH.appointment.all, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch appointments');
    }

    const appointments = await response.json();
    return appointments;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

// 读取单个预约的详细信息
export const readAppointment = async (appointmentID) => {
  try {
    const url = API_PATH.appointment.read.replace(':appointmentID', appointmentID);
    const response = await axiosApiInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching appointment:', error);
    throw error;
  }
};

// 删除预约
export const deleteAppointment = async (appointmentId) => {
  try {
    const url = `${API_PATH.appointment.delete.replace(':id', appointmentId)}`;
    console.log(`Sending DELETE request to URL: ${url}`);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust if needed
      }
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error('Failed to delete appointment:', errorMessage);
      throw new Error('Failed to delete appointment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};
