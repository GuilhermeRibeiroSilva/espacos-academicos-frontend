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

const RecuperarSenha = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const steps = ['Solicitar recuperação', 'Verificar token', 'Nova senha'];

    const handleSolicitarRecuperacao = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            await api.post('/auth/recuperar-senha/solicitar', { email });
            setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
            setActiveStep(1);
        } catch (error) {
            setError(error.response?.data?.message || 'Erro ao solicitar recuperação');
        }
    };

    const handleConfirmarToken = async (e) => {
        e.preventDefault();
        if (!token) {
            setError('Token é obrigatório');
            return;
        }
        setActiveStep(2);
    };

    const handleAlterarSenha = async (e) => {
        e.preventDefault();
        setError('');

        if (novaSenha !== confirmarSenha) {
            setError('As senhas não coincidem');
            return;
        }

        try {
            await api.post('/auth/recuperar-senha/confirmar', {
                token,
                novaSenha
            });
            setSuccess('Senha alterada com sucesso!');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } catch (error) {
            setError(error.response?.data?.message || 'Erro ao alterar senha');
        }
    };

    const renderStep = () => {
        switch (activeStep) {
            case 0:
                return (
                    <form onSubmit={handleSolicitarRecuperacao}>
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
            case 1:
                return (
                    <form onSubmit={handleConfirmarToken}>
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
            case 2:
                return (
                    <form onSubmit={handleAlterarSenha}>
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

                    {renderStep()}
                </Paper>
            </Box>
        </Container>
    );
};

export default RecuperarSenha;