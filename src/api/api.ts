import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL|| 'http://localhost:5000/api',
});
console.log("Base URL used by Axios:", import.meta.env.VITE_API_BASE_URL);
// Add JWT token to headers if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (email: string, password: string) =>
  API.post('/auth/login', { email, password });

export const register = (name: string, email: string, password: string, role: string) =>
  API.post('/auth/register', { name, email, password, role });

// Exams
export const getExams = () => API.get('/exams');
export const createExam = (data: { title: string; description?: string; date: string; duration: number }) =>
  API.post('/exams', data);
export const getExamById = (id: string) => API.get(`/exams/${id}`);

// Sessions
export const startSession = (examId: string) =>
  API.post('/sessions/start', { examId });
export const updateSessionStatus = (id: string, status: string) =>
  API.patch(`/sessions/${id}/status`, { status });
export const getSessions = () => API.get('/sessions'); 