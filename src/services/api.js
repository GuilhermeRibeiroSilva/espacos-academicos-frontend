import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adicionar interceptadores para ajudar no debug
api.interceptors.request.use(
  (request) => {
    // Remover duplicação de /api nas URLs
    if (request.url.startsWith('/api/')) {
      request.url = request.url.substring(4); // Remove /api prefix
      console.warn('Corrigindo URL duplicada:', request.url);
    }

    const token = localStorage.getItem('token');
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }

    console.log('Request:', request.method.toUpperCase(), request.baseURL + request.url);
    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Adicionar este interceptador para logout automático em caso de erros 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se for erro de autenticação (401), limpar o estado de autenticação
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth');
      // Redirecionar para login em vez de usar o contexto diretamente
      window.location.href = '/login';
    }
    
    console.error('Erro na API:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;