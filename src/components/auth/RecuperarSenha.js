import React, { useState } from 'react';
import { 
    Container, 
    Paper, 
    TextField, 
    Button, 
    Typography, 
    Box, 
    Alert,
    Stepper,
    Step,
    StepLabel 
} from '@mui/material';
import api from '../../services/api';

// Componente para exibir mensagens
const Mensagem = ({ error, success }) => (
    <>
        {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        )}
        {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
                {success}
            </Alert>
        )}
    </>
);

// Formulário de solicitação de recuperação
const FormSolicitacao = ({ email, setEmail, onSubmit }) => (
    <form onSubmit={onSubmit}>
        <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
        />
        <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
        >
            Solicitar Recuperação
        </Button>
    </form>
);

// Formulário de verificação de token
const FormToken = ({ token, setToken, onSubmit }) => (
    <form onSubmit={onSubmit}>
        <TextField
            fullWidth
            label="Token de Recuperação"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            margin="normal"
            required
        />
        <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
        >
            Verificar Token
        </Button>
    </form>
);

// Formulário de alteração de senha
const FormNovaSenha = ({ novaSenha, setNovaSenha, confirmarSenha, setConfirmarSenha, onSubmit }) => (
    <form onSubmit={onSubmit}>
        <TextField
            fullWidth
            label="Nova Senha"
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            margin="normal"
            required
        />
        <TextField
            fullWidth
            label="Confirmar Nova Senha"
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            margin="normal"
            required
        />
        <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
        >
            Alterar Senha
        </Button>
    </form>
);

const RecuperarSenha = () => {
    // Estados unificados em grupos lógicos
    const [formData, setFormData] = useState({
        email: '',
        token: '',
        novaSenha: '',
        confirmarSenha: ''
    });
    const [status, setStatus] = useState({
        activeStep: 0,
        error: '',
        success: ''
    });
    
    // Desestruturação para facilitar o acesso
    const { email, token, novaSenha, confirmarSenha } = formData;
    const { activeStep, error, success } = status;
    
    const steps = ['Solicitar recuperação', 'Verificar token', 'Nova senha'];

    // Helper para atualizar campos do formulário
    const updateForm = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Helper para atualizar estados de status
    const updateStatus = (updates) => {
        setStatus(prev => ({ ...prev, ...updates }));
    };

    // Limpar mensagens de erro e sucesso
    const resetMessages = () => {
        updateStatus({ error: '', success: '' });
    };

    const handleSolicitarRecuperacao = async (e) => {
        e.preventDefault();
        resetMessages();
        
        if (!email.trim()) {
            updateStatus({ error: 'Por favor, informe seu email' });
            return;
        }
        
        try {
            await api.post('/auth/recuperar-senha/solicitar', { email });
            updateStatus({ 
                success: 'Email de recuperação enviado! Verifique sua caixa de entrada.',
                activeStep: 1 
            });
        } catch (error) {
            updateStatus({ 
                error: error.response?.data?.message || 'Erro ao solicitar recuperação' 
            });
        }
    };

    const handleConfirmarToken = async (e) => {
        e.preventDefault();
        resetMessages();
        
        if (!token.trim()) {
            updateStatus({ error: 'Token é obrigatório' });
            return;
        }
        
        updateStatus({ activeStep: 2 });
    };

    const handleAlterarSenha = async (e) => {
        e.preventDefault();
        resetMessages();

        if (!novaSenha || !confirmarSenha) {
            updateStatus({ error: 'Todos os campos são obrigatórios' });
            return;
        }

        if (novaSenha !== confirmarSenha) {
            updateStatus({ error: 'As senhas não coincidem' });
            return;
        }

        if (novaSenha.length < 6) {
            updateStatus({ error: 'A senha deve ter pelo menos 6 caracteres' });
            return;
        }

        try {
            await api.post('/auth/recuperar-senha/confirmar', {
                token,
                novaSenha
            });
            updateStatus({ success: 'Senha alterada com sucesso!' });
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } catch (error) {
            updateStatus({ 
                error: error.response?.data?.message || 'Erro ao alterar senha' 
            });
        }
    };

    const renderStep = () => {
        switch (activeStep) {
            case 0:
                return (
                    <FormSolicitacao 
                        email={email} 
                        setEmail={(value) => updateForm('email', value)} 
                        onSubmit={handleSolicitarRecuperacao}
                    />
                );
            case 1:
                return (
                    <FormToken 
                        token={token} 
                        setToken={(value) => updateForm('token', value)} 
                        onSubmit={handleConfirmarToken}
                    />
                );
            case 2:
                return (
                    <FormNovaSenha 
                        novaSenha={novaSenha}
                        setNovaSenha={(value) => updateForm('novaSenha', value)}
                        confirmarSenha={confirmarSenha}
                        setConfirmarSenha={(value) => updateForm('confirmarSenha', value)}
                        onSubmit={handleAlterarSenha}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8 }}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h5" align="center" gutterBottom>
                        Recuperar Senha
                    </Typography>

                    <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    <Mensagem error={error} success={success} />
                    {renderStep()}
                </Paper>
            </Box>
        </Container>
    );
};

export default RecuperarSenha;