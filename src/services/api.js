import axios from 'axios';

// Verificar se a configuração base da API está correta
const api = axios.create({
  // Corrigir para não duplicar o "api" no caminho
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepta todas as respostas
api.interceptors.response.use(
  response => response,
  error => {
    // Se o erro for 401 (Unauthorized), o token expirou ou é inválido
    if (error.response && error.response.status === 401) {
      // Limpar dados de autenticação
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth');
      
      // Redirecionar para a página de login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;