/**
 * Constantes para validação de senha
 */
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = {
  UPPERCASE: /[A-Z]/,
  LOWERCASE: /[a-z]/,
  NUMBERS: /\d/,
  SPECIAL_CHARS: /[!@#$%^&*(),.?":{}|<>]/
};

/**
 * Constantes para sanitização
 */
const DANGEROUS_PATTERNS = {
  HTML_TAGS: /[<>]/g,
  JAVASCRIPT_PROTOCOL: /javascript:/gi,
  EVENT_HANDLERS: /on\w+=/gi
};

/**
 * Valida uma senha de acordo com critérios de segurança
 * @param {string} password - A senha a ser validada
 * @returns {Object} Objeto com status de validação e erros
 */
export const validatePassword = (password) => {
  const errors = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres`);
  }
  if (!PASSWORD_REGEX.UPPERCASE.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula');
  }
  if (!PASSWORD_REGEX.LOWERCASE.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula');
  }
  if (!PASSWORD_REGEX.NUMBERS.test(password)) {
    errors.push('A senha deve conter pelo menos um número');
  }
  if (!PASSWORD_REGEX.SPECIAL_CHARS.test(password)) {
    errors.push('A senha deve conter pelo menos um caractere especial');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitiza uma string removendo conteúdo potencialmente perigoso
 * @param {string} input - O texto a ser sanitizado
 * @returns {string} Texto sanitizado
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(DANGEROUS_PATTERNS.HTML_TAGS, '') 
    .replace(DANGEROUS_PATTERNS.JAVASCRIPT_PROTOCOL, '')
    .replace(DANGEROUS_PATTERNS.EVENT_HANDLERS, '');
};

/**
 * Verifica se um token JWT está expirado
 * @param {string} token - O token JWT a ser verificado
 * @returns {boolean} true se o token estiver expirado ou inválido
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const [, payloadBase64] = token.split('.');
    if (!payloadBase64) return true;
    
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    
    return payload.exp * 1000 < Date.now();
  } catch (e) {
    console.error('Erro ao verificar expiração do token:', e);
    return true;
  }
};

/**
 * Valida um endereço de email
 * @param {string} email - O email a ser validado
 * @returns {boolean} true se for um email válido
 */
export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};