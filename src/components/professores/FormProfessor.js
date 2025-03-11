import React, { useState } from 'react';
import { 
    TextField, 
    Button, 
    Box, 
    Paper,
    Typography 
} from '@mui/material';
import api from '../../services/api';

const FormProfessor = () => {
    const [formData, setFormData] = useState({
        nome: '',
        escola: ''
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
            await api.post('/professores', formData);
            alert('Professor cadastrado com sucesso!');
            setFormData({
                nome: '',
                escola: ''
            });
        } catch (error) {
            console.error('Erro ao cadastrar professor:', error);
            alert('Erro ao cadastrar professor');
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Cadastrar Professor
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
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
                    label="Escola"
                    name="escola"
                    value={formData.escola}
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

export default FormProfessor;