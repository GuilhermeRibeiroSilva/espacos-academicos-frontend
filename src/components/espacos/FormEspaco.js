import React, { useState } from 'react';
import { 
    TextField, 
    Button, 
    Box, 
    Paper,
    Typography 
} from '@mui/material';
import api from '../../services/api';

const FormEspaco = () => {
    const [formData, setFormData] = useState({
        sigla: '',
        nome: '',
        descricao: '',
        capacidadeAlunos: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/espacos', {
                ...formData,
                capacidadeAlunos: parseInt(formData.capacidadeAlunos),
                disponivel: true
            });
            alert('Espaço acadêmico cadastrado com sucesso!');
            setFormData({
                sigla: '',
                nome: '',
                descricao: '',
                capacidadeAlunos: '',
            });
        } catch (error) {
            console.error('Erro ao cadastrar espaço:', error);
            alert('Erro ao cadastrar espaço acadêmico');
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Cadastrar Espaço Acadêmico
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Sigla"
                    name="sigla"
                    value={formData.sigla}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Descrição"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    margin="normal"
                    multiline
                    rows={3}
                />
                <TextField
                    fullWidth
                    label="Capacidade de Alunos"
                    name="capacidadeAlunos"
                    type="number"
                    value={formData.capacidadeAlunos}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    sx={{ mt: 2 }}
                >
                    Cadastrar
                </Button>
            </Box>
        </Paper>
    );
};

export default FormEspaco;