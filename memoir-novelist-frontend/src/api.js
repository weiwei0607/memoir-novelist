import axios from 'axios';
import { auth } from './firebase';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://memoir-novelist-backend-799111991622.asia-east1.run.app';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchDiaries = () => api.get('/diaries');
export const fetchNovels = () => api.get('/novels');
export const addDiary = (content) => api.post('/diaries', { content });
export const generateNovel = (data) => api.post('/novels/generate', data);
export const deleteDiary = (id) => api.delete(`/diaries/${id}`);
export const deleteNovel = (id) => api.delete(`/novels/${id}`);
export const fetchStreak = () => api.get('/streak');
