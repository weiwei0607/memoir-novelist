import axios from 'axios';

const API_BASE = 'https://memoir-novelist-backend-799111991622.asia-east1.run.app';

export const fetchDiaries = () => axios.get(`${API_BASE}/diaries`);
export const fetchNovels = () => axios.get(`${API_BASE}/novels`);
export const addDiary = (content) => axios.post(`${API_BASE}/diaries`, { content });
export const generateNovel = (data) => axios.post(`${API_BASE}/novels/generate`, data);
export const deleteDiary = (id) => axios.delete(`${API_BASE}/diaries/${id}`);
export const deleteNovel = (id) => axios.delete(`${API_BASE}/novels/${id}`);
