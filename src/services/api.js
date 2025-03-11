import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true, 
    timeout: 10000 
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
        console.error('Erro na configuração da requisição:', error);
        return Promise.reject(error);
    }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Verifica se há resposta do servidor
        if (error.response) {
            const { status, data } = error.response;
            
            // Erro de autenticação
            if (status === 401) {
                console.error('Sessão expirada ou inválida');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                // Evita redirecionamento infinito se já estiver na página de login
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
            
            // Erro de permissão
            else if (status === 403) {
                console.error('Acesso negado:', data?.message || 'Você não tem permissão para acessar este recurso');
            }

            // Erro do servidor
            else if (status === 500) {
                console.error('Erro interno do servidor:', data?.message || 'Ocorreu um erro no servidor');
            }
            
            // Erro de validação
            else if (status === 400) {
                console.error('Erro de validação:', data?.message || 'Dados inválidos');
            }
            
            // Recurso não encontrado
            else if (status === 404) {
                console.error('Recurso não encontrado:', data?.message || 'O recurso solicitado não existe');
            }
            
            // Outros erros
            else {
                console.error(`Erro ${status}:`, data?.message || 'Ocorreu um erro inesperado');
            }
        } 
        // Erro de conexão (servidor não respondeu)
        else if (error.request) {
            console.error('Erro de conexão com o servidor. Verifique sua internet ou se o servidor está rodando.');
        } 
        // Outros erros
        else {
            console.error('Erro:', error.message || 'Ocorreu um erro inesperado');
        }

        return Promise.reject(error);
    }
);

// Função auxiliar para verificar se o token está expirado
api.isTokenExpired = () => {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    try {
        // Decodifica o token JWT (parte do payload)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        // Verifica se o token expirou
        return payload.exp * 1000 < Date.now();
    } catch (e) {
        console.error('Erro ao verificar token:', e);
        return true;
    }
};

// Função para limpar dados de autenticação
api.logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

export default api;