import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api'
});

// Interceptor para adicionar token em todas as requisições
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

// Interceptor para tratamento de erros
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Erro de autenticação
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            
            // Erro de permissão
            if (error.response.status === 403) {
                // Redirecionar para página de acesso negado ou mostrar mensagem
                console.error('Acesso negado');
            }

            // Erro do servidor
            if (error.response.status === 500) {
                console.error('Erro interno do servidor');
            }
        } else if (error.request) {
            // Erro de conexão
            console.error('Erro de conexão com o servidor');
        }

        return Promise.reject(error);
    }
);

export default api;