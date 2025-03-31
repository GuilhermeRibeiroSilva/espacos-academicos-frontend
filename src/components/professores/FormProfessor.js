import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Box,
  Grid
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { useLoading } from '../../contexts/LoadingContext';
import { useFeedback } from '../common/Feedback';

const FormProfessor = () => {
  const { id } = useParams();
  const isEdicao = !!id;
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { showFeedback, FeedbackComponent } = useFeedback();
  
  const [formData, setFormData] = useState({
    nome: '',
    escola: ''
  });
  
  useEffect(() => {
    if (isEdicao) {
      carregarProfessor();
    }
  }, [id, isEdicao]);
  
  const carregarProfessor = async () => {
    showLoading('Carregando dados do professor...');
    try {
      const response = await api.get(`/api/professores/${id}`); // Corrigido para incluir /api/
      setFormData({
        nome: response.data.nome || '',
        escola: response.data.escola || ''
      });
    } catch (error) {
      console.error('Erro ao carregar professor:', error);
      showFeedback('Erro ao carregar dados do professor', 'error');
      navigate('/professores');
    } finally {
      hideLoading();
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.escola) {
      showFeedback('Preencha todos os campos obrigatórios', 'error');
      return;
    }
    
    showLoading(isEdicao ? 'Atualizando professor...' : 'Cadastrando professor...');
    
    try {
      if (isEdicao) {
        await api.put(`/api/professores/${id}`, formData); // Corrigido
        showFeedback('Professor atualizado com sucesso', 'success');
      } else {
        await api.post('/api/professores', formData); // Corrigido
        showFeedback('Professor cadastrado com sucesso', 'success');
      }
      navigate('/professores');
    } catch (error) {
      console.error('Erro ao salvar professor:', error);
      showFeedback(
        error.response?.data?.message || 'Erro ao salvar professor', 
        'error'
      );
    } finally {
      hideLoading();
    }
  };
  
  const handleCancelar = () => {
    navigate('/professores');
  };
  
  return (
    <div>
      {FeedbackComponent}
      <Typography variant="h4" sx={{ mb: 4 }}>
        {isEdicao ? 'Editar Professor' : 'Cadastrar Professor'}
      </Typography>
      
      <Paper 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          p: 4, 
          borderRadius: '8px',
          boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
          bgcolor: '#0F1140'
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ color: 'white', mb: 1 }}>
              Nome
            </Typography>
            <TextField
              fullWidth
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Digite o nome"
              variant="outlined"
              required
              sx={{ 
                bgcolor: '#f8f5ff',
                borderRadius: '4px'
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ color: 'white', mb: 1 }}>
              Escola
            </Typography>
            <TextField
              fullWidth
              name="escola"
              value={formData.escola}
              onChange={handleChange}
              placeholder="Digite a escola"
              variant="outlined"
              required
              sx={{ 
                bgcolor: '#f8f5ff',
                borderRadius: '4px'
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                onClick={handleCancelar}
                variant="outlined"
                sx={{ 
                  color: '#f8f5ff',
                  borderColor: '#f8f5ff',
                  '&:hover': { 
                    borderColor: '#e8e5ef',
                    color: '#e8e5ef'
                  },
                  px: 4,
                  py: 1.5,
                  borderRadius: '4px',
                  width: '48%'
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{ 
                  bgcolor: '#f8f5ff', 
                  color: '#0F1140',
                  '&:hover': { bgcolor: '#e8e5ef' },
                  px: 4,
                  py: 1.5,
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  width: '48%'
                }}
              >
                {isEdicao ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export default FormProfessor;