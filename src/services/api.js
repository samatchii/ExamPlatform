import axios from 'axios';
const API_URL = 'http://localhost:8080/api';
const apiInstance = axios.create({
  baseURL: API_URL, // Toutes les requêtes utiliseront cette URL racine
});
apiInstance.interceptors.request.use((config) => {
  try {
    const userString = localStorage.getItem('exam_user');
    if (userString) {
      const user = JSON.parse(userString);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  } catch (err) {
    console.error('Error parsing user from localStorage:', err);
  }
  return config;
});
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      localStorage.removeItem('exam_user');
      window.location.href = '/login';
    }
    const message = error.response?.data?.message || error.response?.data?.error || error.message;
    return Promise.reject(new Error(message));
  }
);
export const api = {
  login: async (email, password) => {
    const response = await apiInstance.post('/auth/login', { email, password });
    const data = response.data;
    if (!data) throw new Error('Réponse du serveur invalide.');
    if (!data.token || !data.user) {
      throw new Error(data.message || 'Réponse de connexion invalide du serveur.');
    }
    const { token, user } = data;
    return { ...user, token };
  },
  register: async (name, email, password, role = 'student') => {
    const response = await apiInstance.post('/auth/register', { name, email, password, role });
    const data = response.data;
    if (data && data.pending) {
      return data;
    }
    if (!data || !data.token || !data.user) {
      throw new Error(data?.message || 'Réponse d\'inscription invalide du serveur.');
    }
    const { token, user } = data;
    return { ...user, token };
  },
  getExams: async () => { 
    const response = await apiInstance.get('/exams');
    return response.data;
  },
  getExam: async (id) => { 
    if (!id || id === 'undefined') return null;
    const response = await apiInstance.get(`/exams/${id}`);
    return response.data;
  },
  submitExam: async (examId, score, passed, answers, correctAnswers, userId, textAnswers, flaggedForCheating) => {
    const response = await apiInstance.post('/results', {
      examId,           // Identifiant de l'examen
      userId,           // Identifiant de l'utilisateur
      score,            // Score obtenu (en pourcentage)
      passed,           // Booléen indiquant si l'utilisateur a réussi
      answers,          // Tableau des réponses de l'utilisateur
      correctAnswers,   // Tableau des réponses correctes
      textAnswers,      // Réponses textuelles (questions à développement)
      flaggedForCheating // Indicateur de triche potentielle
    });
    return response.data;
  },
  getUserResults: async (userId) => {
    const response = await apiInstance.get(`/results/user/${userId}`);
    return response.data;
  },
  getExamResults: async (examId) => {
    const response = await apiInstance.get(`/results/exam/${examId}`);
    return response.data;
  },
  getAnalytics: async () => {
    const response = await apiInstance.get('/analytics/stats');
    return response.data;
  },
  getResult: async (id) => (await apiInstance.get(`/results/${id}`)).data,
  getPendingResults: async () => (await apiInstance.get('/results/pending')).data,
  getAllResults: async () => {
    const response = await apiInstance.get('/results');
    return response.data;
  },
  updateResult: async (id, score) => {
    const response = await apiInstance.put(`/results/${id}`, { score });
    return response.data;
  },
  createExam: async (examData) => (await apiInstance.post('/exams', examData)).data,
  updateExam: async (id, examData) => (await apiInstance.put(`/exams/${id}`, examData)).data,
  deleteExam: async (id) => { await apiInstance.delete(`/exams/${id}`); },
  approveExam: async (id) => (await apiInstance.put(`/exams/${id}/approve`)).data,
  rejectExam: async (id) => (await apiInstance.put(`/exams/${id}/reject`)).data,
  getPendingExams: async () => (await apiInstance.get('/exams', { params: { status: 'pending' } })).data,
  getUsers: async (role) => (await apiInstance.get('/users', { params: role ? { role } : {} })).data,
  createUser: async (data) => (await apiInstance.post('/users', data)).data,
  updateUser: async (id, data) => (await apiInstance.put(`/users/${id}`, data)).data,
  deleteUser: async (id) => { await apiInstance.delete(`/users/${id}`); },
  getDepartments: async () => (await apiInstance.get('/departments')).data,
  createDepartment: async (data) => (await apiInstance.post('/departments', data)).data,
  updateDepartment: async (id, data) => (await apiInstance.put(`/departments/${id}`, data)).data,
  deleteDepartment: async (id) => { await apiInstance.delete(`/departments/${id}`); },
  getModules: async () => (await apiInstance.get('/modules')).data,
  createModule: async (data) => (await apiInstance.post('/modules', data)).data,
  updateModule: async (id, data) => (await apiInstance.put(`/modules/${id}`, data)).data,
  deleteModule: async (id) => { await apiInstance.delete(`/modules/${id}`); },
  getRooms: async () => (await apiInstance.get('/rooms')).data,
  createRoom: async (data) => (await apiInstance.post('/rooms', data)).data,
  updateRoom: async (id, data) => (await apiInstance.put(`/rooms/${id}`, data)).data,
  deleteRoom: async (id) => { await apiInstance.delete(`/rooms/${id}`); },
  getSchedules: async () => (await apiInstance.get('/schedules')).data,
  createSchedule: async (data) => (await apiInstance.post('/schedules', data)).data,
  updateSchedule: async (id, data) => (await apiInstance.put(`/schedules/${id}`, data)).data,
  deleteSchedule: async (id) => { await apiInstance.delete(`/schedules/${id}`); },
  backup: async () => (await apiInstance.get('/admin/backup')).data,
  getAdminUsers: async () => (await apiInstance.get('/admin/users')).data,
  getAllUsers: async () => (await apiInstance.get('/admin/users')).data,
  getPendingUsers: async () => (await apiInstance.get('/admin/users/pending')).data,
  approveUser: async (userId) => (await apiInstance.put(`/admin/users/${userId}/approve`)).data,
  rejectUser: async (userId) => (await apiInstance.put(`/admin/users/${userId}/reject`)).data,
  deleteUser: async (userId) => (await apiInstance.delete(`/admin/users/${userId}`)).data,
  updateUserStatus: async (userId, status) => (await apiInstance.put(`/admin/users/${userId}/status`, { status })).data,
  updateAdminUser: async (userId, data) => (await apiInstance.put(`/admin/users/${userId}`, data)).data,
  getAdminStats: async () => (await apiInstance.get('/admin/stats')).data,
  gradeResult: async (id, grade, passed, comment, retakeAvailable) => (await apiInstance.put(`/results/${id}/grade`, { grade, passed, teacherComment: comment, retakeAvailable })).data,
  updateResultWithComment: async (id, score, comment) => (await apiInstance.put(`/results/${id}`, { score, teacherComment: comment })).data,
  deleteResult: async (id) => (await apiInstance.delete(`/results/${id}`)).data,
  getSubjects: async () => (await apiInstance.get('/subjects')).data,
  getSubject: async (id) => (await apiInstance.get(`/subjects/${id}`)).data,
  getScheduledExams: async () => (await apiInstance.get('/scheduled-exams')).data,
  getUpcomingExams: async () => (await apiInstance.get('/scheduled-exams/upcoming')).data,
  getAvailableExams: async () => (await apiInstance.get('/exams/available')).data,
  getUpcomingDatedExams: async () => (await apiInstance.get('/exams/upcoming')).data,
  getTeacherExams: async () => (await apiInstance.get('/exams/teacher')).data,
  startExamSession: async (examId) => (await apiInstance.post('/exam-sessions/start', { examId })).data,
  getExamSession: async (sessionId) => (await apiInstance.get(`/exam-sessions/${sessionId}`)).data,
  reportViolation: async (sessionId, type) => (await apiInstance.post(`/exam-sessions/${sessionId}/violation`, { type })).data,
  saveExamAnswers: async (sessionId, answers, textAnswers) => (await apiInstance.post(`/exam-sessions/${sessionId}/save`, { answers, textAnswers })).data,
  endExamSession: async (sessionId, answers, textAnswers) => (await apiInstance.post(`/exam-sessions/${sessionId}/end`, { answers, textAnswers })).data,
};
