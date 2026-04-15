import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000';

export const fetchDiaries = () => axios.get(`${API_BASE}/diaries`);
export const fetchNovels = () => axios.get(`${API_BASE}/novels`);
export const addDiary = (content) => axios.post(`${API_BASE}/diaries`, { content });
export const generateNovel = (data) => axios.post(`${API_BASE}/novels/generate`, data);
