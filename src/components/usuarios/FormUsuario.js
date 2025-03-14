import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const FormUsuario = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'ROLE_PROFESSOR',
    professorId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [professores, setProfessores] = useState([]);

  useEffect(() => {
    carregarProfessores();
    if (id) {
      carregarUsuario();
    }
  }, [id]);

  const carregarProfessores = async () => {
    try {
      const response = await api.get('/api/professores');
      setProfessores(response.data);
    } catch (error) {
      console.error('Erro ao carregar professores:', error);
      setError('Erro ao carregar lista de professores');
    }
  };

  const carregarUsuario = async () => {
    try {
      const response = await api.get(`/api/usuarios/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setError('Erro ao carregar dados do usuário');
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
    setLoading(true);
    setError(null);

    try {
      if (id) {
        await api.put(`/api/usuarios/${id}`, formData);
      } else {
        await api.post('/api/usuarios', formData);
      }
      navigate('/usuarios');
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      setError('Erro ao salvar usuário. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {id ? 'Editar Usuário' : 'Novo Usuário'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </Grid>

            {!id && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Senha"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!id}
                  disabled={loading}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Usuário</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <MenuItem value="ROLE_ADMIN">Administrador</MenuItem>
                  <MenuItem value="ROLE_PROFESSOR">Professor</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.role === 'ROLE_PROFESSOR' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Professor</InputLabel>
                  <Select
                    name="professorId"
                    value={formData.professorId}
                    onChange={handleChange}
                    required={formData.role === 'ROLE_PROFESSOR'}
                    disabled={loading}
                  >
                    {professores.map(professor => (
                      <MenuItem key={professor.id} value={professor.id}>
                        {professor.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/usuarios')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default FormUsuario;