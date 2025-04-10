import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  styled
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

// Estilos personalizados
const LoginContainer = styled(Box)({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: '#F2F2F2',
});

const Panel = styled(Box)(({ theme, isLeft }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(4),
  ...(isLeft && {
    backgroundColor: '#0F1140',
    color: '#F2F2F2',
  }),
}));

const LoginForm = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: '100%',
  maxWidth: 400,
  backgroundColor: 'white',
  borderRadius: 8,
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#181B59',
    },
    '&:hover fieldset': {
      borderColor: '#181B59',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#181B59',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#181B59',
  },
}));

const LoginButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#181B59',
  color: 'white',
  padding: '12px',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: '#0F1140',
  },
}));

const TitleText = styled(Typography)(({ theme }) => ({
  fontFamily: 'Orbitron, Arial, sans-serif',
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
  color: '#F2E085',
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  width: '200px',
  height: '200px',
  marginBottom: theme.spacing(4),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.username)) {
      setError('Por favor, insira um email válido');
      return;
    }
    
    // Validar preenchimento de senha
    if (!formData.password.trim()) {
      setError('Por favor, insira sua senha');
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await login(formData.username, formData.password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Credenciais inválidas');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Falha no login. Verifique suas credenciais.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <Panel isLeft>
        <LogoContainer>
          <img 
            src={`${process.env.PUBLIC_URL}/img/Logo-Ucsal.png`}
            alt="Logo" 
            style={{ width: '80%', height: '80%', objectFit: 'contain' }} 
          />
        </LogoContainer>
        <TitleText variant="h3">
          Sistema de Controle de Espaços Acadêmicos
        </TitleText>
      </Panel>

      <Panel>
        <LoginForm elevation={3}>
          <Typography
            variant="h4"
            sx={{
              mb: 4,
              fontFamily: 'Orbitron, Arial, sans-serif',
              fontWeight: 'bold',
              color: '#181B59',
              textAlign: 'center'
            }}
          >
            Login
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
              {error}
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <StyledTextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoFocus
            />

            <StyledTextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <LoginButton
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </LoginButton>
          </form>
        </LoginForm>
      </Panel>
    </LoginContainer>
  );
};

export default Login;