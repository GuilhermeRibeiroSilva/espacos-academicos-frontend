import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador de requisição
api.interceptors.request.use(
  (request) => {
    // Corrigir duplicação de /api nas URLs
    if (request.url.startsWith('/api/')) {
      request.url = request.url.substring(4);
    }

    // Adicionar token de autenticação quando disponível
    const token = localStorage.getItem('token');
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }

    return request;
  },
  (error) => Promise.reject(error)
);

// Interceptador de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratamento específico para erro de autenticação (401)
    if (error.response?.status === 401) {
      // Limpar dados de autenticação
      ['token', 'user', 'auth'].forEach(key => localStorage.removeItem(key));
      
      // Redirecionar para tela de login
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;