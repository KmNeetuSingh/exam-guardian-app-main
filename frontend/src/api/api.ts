import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL|| 'http://localhost:5000/api',
});

// Add JWT token to headers if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { api }; // Export the api instance

// Auth
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const register = (name: string, email: string, password: string, role: string) =>
  api.post('/auth/register', { name, email, password, role });

// Exams
export const getExams = () => api.get('/exams');
export const createExam = (data: { title: string; description?: string; date: string; duration: number }) =>
  api.post('/exams', data);
export const getExamById = (id: string) => api.get(`/exams/${id}`);

// Sessions
export const startSession = (data: { examId: string; proctorId?: string }) =>
  api.post('/sessions/start', data);
export const updateSessionStatus = (id: string, status: string) =>
  api.patch(`/sessions/${id}/status`, { status });
export const getSessions = () => api.get('/sessions');

// Users
export const getUsers = (role: string) => api.get(`/users?role=${role}`);

// Verify a student's ID (sets their account isIdVerified flag to true)
export const verifyStudentId = async (userId: string) => {
  return api.patch(`/users/${userId}/verify-id`, { isIdVerified: true });
};

export const uploadProfilePicture = async (formData: FormData) => {
  const { data } = await api.post('/users/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  // The backend returns the updated user object in the response
  // under the 'user' key, along with filePath
  return data.user;
};

// Submit ID for verification (Placeholder)
export const submitIdForVerification = async (examId: string, idImageDataUrl: string) => {
  console.log("Submitting ID for verification (Exam:", examId, "Data URL length:", idImageDataUrl.length, ")");
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, message: "ID submitted for verification." };
  // throw new Error("Simulated backend error during ID submission.");
};

// Simulate Face Verification (Placeholder)
export const verifyFaceMatch = async (liveSnapshotDataUrl: string, profilePicUrl: string) => {
  console.log("Simulating face match between snapshot (length:", liveSnapshotDataUrl.length, ") and profile pic (", profilePicUrl, ")");
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
  
  // TESTING MODE: Always return success
  const isMatch = true; // Changed from random to always true for testing
  console.log("Simulated match result:", isMatch);

  // The following condition will never execute now, but keeping for future reference
  if (!isMatch) {
    return { isMatch: false, message: "Simulated Failure: Faces do not match. Please try again." };
  }
  return { isMatch: true, message: "Simulated Success: Faces match." };
};

// Placeholder for submitting exam answers
export const submitExamAnswers = async (examId: string, answers: { [key: string]: string }) => {
  // In a real application, this would likely be associated with an exam session ID,
  // not just the examId.
  console.log(`Submitting answers for exam ${examId}:`, answers);
  // Example: POST to something like /sessions/:sessionId/submit or /exams/:examId/submit
  // const response = await api.post(`/exams/${examId}/submit`, { answers });
  // return response.data;

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000)); 
  // Simulate success
  return { success: true, message: "Answers submitted successfully." };
  // Simulate failure:
  // throw new Error("Simulated error submitting answers.");
};

// Placeholder for marking face verified for an exam session
// export const markFaceVerifiedForExam = async (examId: string) => {
//   console.log(`Marking face as verified for exam ${examId}`);
//   await new Promise(resolve => setTimeout(resolve, 500));
//   return { success: true };
// };

// Fetch User Profile
// ... existing code ... 