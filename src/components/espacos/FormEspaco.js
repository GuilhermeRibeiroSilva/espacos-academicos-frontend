import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Paper,
  Container
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { useLoading } from '../../contexts/LoadingContext';
import { useFeedback } from '../common/Feedback';

const FormEspaco = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { showFeedback, FeedbackComponent } = useFeedback();
  const [formData, setFormData] = useState({
    sigla: '',
    nome: '',
    descricao: '',
    capacidadeAlunos: '',
    disponivel: true
  });
  const [errors, setErrors] = useState({});

  const isEdicao = !!id;

  useEffect(() => {
    if (isEdicao) {
      carregarEspaco();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const carregarEspaco = async () => {
    showLoading('Carregando dados do espaço...');
    try {
      const response = await api.get(`/espacos/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Erro ao carregar espaço:', error);
      showFeedback('Erro ao carregar dados do espaço', 'error');
      navigate('/espacos');
    } finally {
      hideLoading();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'capacidadeAlunos' ? (value === '' ? '' : parseInt(value)) : value
    });
    
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validarFormulario = () => {
    const novosErros = {};
    
    if (!formData.sigla || formData.sigla.trim() === '') {
      novosErros.sigla = 'A sigla é obrigatória';
    }
    
    if (!formData.nome || formData.nome.trim() === '') {
      novosErros.nome = 'O nome é obrigatório';
    }
    
    if (!formData.capacidadeAlunos) {
      novosErros.capacidadeAlunos = 'A capacidade é obrigatória';
    } else if (formData.capacidadeAlunos <= 0) {
      novosErros.capacidadeAlunos = 'A capacidade deve ser maior que zero';
    }
    
    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      showFeedback('Por favor, corrija os erros no formulário', 'error');
      return;
    }
    
    showLoading(isEdicao ? 'Atualizando espaço...' : 'Cadastrando espaço...');
    try {
      if (isEdicao) {
        await api.put(`/espacos/${id}`, formData);
        showFeedback('Espaço acadêmico atualizado com sucesso', 'success');
      } else {
        await api.post('/espacos', formData);
        showFeedback('Espaço acadêmico cadastrado com sucesso', 'success');
      }
      navigate('/espacos');
    } catch (error) {
      console.error('Erro ao salvar espaço:', error);
      showFeedback(
        error.response?.data?.message || `Erro ao ${isEdicao ? 'atualizar' : 'cadastrar'} espaço acadêmico`,
        'error'
      );
    } finally {
      hideLoading();
    }
  };

  return (
    <Container maxWidth="md">
      {FeedbackComponent}
      <Typography variant="h4" gutterBottom>
        {isEdicao ? 'Editar Espaço Acadêmico' : 'Cadastrar Espaço Acadêmico'}
      </Typography>
      
      <Paper 
        sx={{ 
          p: 4, 
          mt: 2, 
          bgcolor: '#0F1140', 
          borderRadius: '8px',
          color: 'white'
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="subtitle1" gutterBottom>
            Sigla
          </Typography>
          <TextField
            fullWidth
            name="sigla"
            value={formData.sigla}
            onChange={handleChange}
            placeholder="Digite a sigla"
            error={!!errors.sigla}
            helperText={errors.sigla}
            sx={{ 
              mb: 3,
              bgcolor: '#f8f0ff',
              borderRadius: '4px',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'transparent',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'transparent',
                },
              },
            }}
          />
          
          <Typography variant="subtitle1" gutterBottom>
            Nome
          </Typography>
          <TextField
            fullWidth
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Digite o nome"
            error={!!errors.nome}
            helperText={errors.nome}
            sx={{ 
              mb: 3,
              bgcolor: '#f8f0ff',
              borderRadius: '4px',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'transparent',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'transparent',
                },
              },
            }}
          />
          
          <Typography variant="subtitle1" gutterBottom>
            Descrição
          </Typography>
          <TextField
            fullWidth
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            placeholder="Digite a descrição"
            multiline
            rows={4}
            sx={{ 
              mb: 3,
              bgcolor: '#f8f0ff',
              borderRadius: '4px',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'transparent',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'transparent',
                },
              },
            }}
          />
          
          <Typography variant="subtitle1" gutterBottom>
            Capacidade de Alunos
          </Typography>
          <TextField
            fullWidth
            name="capacidadeAlunos"
            type="number"
            value={formData.capacidadeAlunos}
            onChange={handleChange}
            placeholder="Digite a capacidade"
            error={!!errors.capacidadeAlunos}
            helperText={errors.capacidadeAlunos}
            sx={{ 
              mb: 4,
              bgcolor: '#f8f0ff',
              borderRadius: '4px',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'transparent',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'transparent',
                },
              },
            }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              py: 1.5,
              bgcolor: '#f8f0ff',
              color: '#0F1140',
              '&:hover': {
                bgcolor: '#e0d0f0',
              },
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            {isEdicao ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default FormEspaco;