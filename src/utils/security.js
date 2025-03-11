export const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];

    if (password.length < minLength) {
        errors.push(`A senha deve ter pelo menos ${minLength} caracteres`);
    }
    if (!hasUpperCase) {
        errors.push('A senha deve conter pelo menos uma letra maiúscula');
    }
    if (!hasLowerCase) {
        errors.push('A senha deve conter pelo menos uma letra minúscula');
    }
    if (!hasNumbers) {
        errors.push('A senha deve conter pelo menos um número');
    }
    if (!hasSpecialChar) {
        errors.push('A senha deve conter pelo menos um caractere especial');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const sanitizeInput = (input) => {
    return input.replace(/[<>]/g, '');
};

export const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const { exp } = JSON.parse(jsonPayload);
        return exp * 1000 < Date.now();
    } catch (e) {
        return true;
    }
};