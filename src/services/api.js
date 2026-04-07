import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

/** POST /api/generate — uses FormData for file uploads */
export async function generateVideo({ prompt, images, videoFiles, audioFiles, aspectRatio, duration }) {
  const formData = new FormData();
  formData.append('prompt', prompt);
  formData.append('aspectRatio', aspectRatio);
  formData.append('duration', duration);

  if (images) {
    images.forEach((file) => formData.append('images', file));
  }
  if (videoFiles) {
    videoFiles.forEach((file) => formData.append('video', file));
  }
  if (audioFiles) {
    audioFiles.forEach((file) => formData.append('audio', file));
  }

  const res = await api.post('/generate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

/** GET /api/status/:requestId */
export async function getStatus(requestId) {
  const res = await api.get(`/status/${requestId}`);
  return res.data;
}

/** GET /api/history */
export async function getHistory({ page = 1, limit = 12, status, search } = {}) {
  const params = { page, limit };
  if (status) params.status = status;
  if (search) params.search = search;
  const res = await api.get('/history', { params });
  return res.data;
}

/** GET /api/generation/:id */
export async function getGeneration(id) {
  const res = await api.get(`/generation/${id}`);
  return res.data;
}

/** POST /api/retry/:id */
export async function retryGeneration(id) {
  const res = await api.post(`/retry/${id}`);
  return res.data;
}

/** DELETE /api/generation/:id */
export async function deleteGeneration(id) {
  const res = await api.delete(`/generation/${id}`);
  return res.data;
}

export default api;
