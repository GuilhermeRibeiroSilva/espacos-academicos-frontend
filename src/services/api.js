import axios from 'axios';

const api = axios.create({
  // Certifique-se que o path inclui /api corretamente
  baseURL: 'http://localhost:8080/api', 
  // OU mantenha desta forma se o backend já inclui /api nos controllers
  // baseURL: 'http://localhost:8080', 
});

// Intercepta todas as requisições
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
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