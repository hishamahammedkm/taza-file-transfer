// Import necessary modules and utilities

import { ExpoSecureStoreAdapter, supabase } from '~/utils/supabase';

import axios from 'axios';

// Create an Axios instance for API requests
const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_SERVER_URI,
  withCredentials: true,
  timeout: 120000,
});

// Add an interceptor to set authorization header with user token before requests
apiClient.interceptors.request.use(
  async function (config) {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      // console.log('token from supabse at axios ini:', token);

      // Set authorization header with bearer token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// API functions for different actions
const loginUser = (data: { username: string; password: string }) => {
  return apiClient.post('/users/login', data);
};

const registerUser = (data: { email: string; password: string; username: string }) => {
  return apiClient.post('/users/register', data);
};

const logoutUser = () => {
  return apiClient.post('/users/logout');
};

const getAvailableUsers = () => {
  return apiClient.get('/chat-app/chats/users');
};

const getUserChats = () => {
  return apiClient.get(`/chat-app/chats`);
};

const createUserChat = (receiverId: string) => {
  return apiClient.post(`/chat-app/chats/c/${receiverId}`);
};

const createGroupChat = (data: { name: string; participants: string[] }) => {
  return apiClient.post(`/chat-app/chats/group`, data);
};

const getGroupInfo = (chatId: string) => {
  return apiClient.get(`/chat-app/chats/group/${chatId}`);
};

const updateGroupName = (chatId: string, name: string) => {
  return apiClient.patch(`/chat-app/chats/group/${chatId}`, { name });
};

const deleteGroup = (chatId: string) => {
  return apiClient.delete(`/chat-app/chats/group/${chatId}`);
};

const deleteOneOnOneChat = (chatId: string) => {
  return apiClient.delete(`/chat-app/chats/remove/${chatId}`);
};

const addParticipantToGroup = (chatId: string, participantId: string) => {
  return apiClient.post(`/chat-app/chats/group/${chatId}/${participantId}`);
};

const removeParticipantFromGroup = (chatId: string, participantId: string) => {
  return apiClient.delete(`/chat-app/chats/group/${chatId}/${participantId}`);
};

const getChatMessages = (chatId: string) => {
  return apiClient.get(`/chat-app/messages/${chatId}`);
};

const sendMessage = async (chatId: string, content: string, attachments: File[]) => {
  const formData = new FormData();
  if (content) {
    formData.append('content', content);
  }
  attachments?.forEach((file) => {
    formData.append('attachments', file);
  });

  try {
    return apiClient.post(`/chat-app/messages/${chatId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // console.log('API Response:', response.data);
    // return response.data;
  } catch (error) {
    console.error('API Error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios Error Response:', error.response);
      console.error('Axios Error Request:', error.request);
    }
    throw error;
  }
};
const deleteMessage = (chatId: string, messageId: string) => {
  return apiClient.delete(`/chat-app/messages/${chatId}/${messageId}`);
};

// Export all the API functions
export {
  addParticipantToGroup,
  createGroupChat,
  createUserChat,
  deleteGroup,
  deleteOneOnOneChat,
  getAvailableUsers,
  getChatMessages,
  getGroupInfo,
  getUserChats,
  loginUser,
  logoutUser,
  registerUser,
  removeParticipantFromGroup,
  sendMessage,
  updateGroupName,
  deleteMessage,
};
