import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
} from '@mui/material';
import { useFeedback } from '../common/Feedback';
import { useLoading } from '../../contexts/LoadingContext';
import api from '../../services/api';

const GerenciarUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resetSenhaDialogOpen, setResetSenhaDialogOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    professorId: '',
  });
  const [novaSenha, setNovaSenha] = useState('');
  const { showFeedback, FeedbackComponent } = useFeedback();
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarDados = async () => {
    showLoading('Carregando dados...');
    try {
      const [usuariosResponse, professoresResponse] = await Promise.all([
        api.get('/admin/usuarios'),
        api.get('/professores'),
      ]);
      setUsuarios(usuariosResponse.data);
      setProfessores(professoresResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showFeedback('Erro ao carregar dados', 'error');
    } finally {
      hideLoading();
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      username: '',
      password: '',
      professorId: '',
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleOpenResetSenhaDialog = (usuario) => {
    setSelectedUsuario(usuario);
    setNovaSenha('');
    setResetSenhaDialogOpen(true);
  };

  const handleCloseResetSenhaDialog = () => {
    setResetSenhaDialogOpen(false);
    setSelectedUsuario(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    showLoading('Criando usuário...');
    try {
      await api.post('/admin/usuarios/professor', formData);
      showFeedback('Usuário criado com sucesso', 'success');
      handleCloseDialog();
      carregarDados();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      showFeedback(
        error.response?.data?.message || 'Erro ao criar usuário',
        'error'
      );
    } finally {
      hideLoading();
    }
  };

  const handleResetSenha = async () => {
    if (!novaSenha) {
      showFeedback('A nova senha é obrigatória', 'error');
      return;
    }

    showLoading('Resetando senha...');
    try {
      await api.post(`/admin/usuarios/${selectedUsuario.id}/resetar-senha`, {
        novaSenha,
      });
      showFeedback('Senha resetada com sucesso', 'success');
      handleCloseResetSenhaDialog();
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      showFeedback(
        error.response?.data?.message || 'Erro ao resetar senha',
        'error'
      );
    } finally {
      hideLoading();
    }
  };

  const handleDesativarUsuario = async (id) => {
    if (!window.confirm('Tem certeza que deseja desativar este usuário?')) {
      return;
    }

    showLoading('Desativando usuário...');
    try {
      await api.delete(`/admin/usuarios/${id}`);
      showFeedback('Usuário desativado com sucesso', 'success');
      carregarDados();
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      showFeedback(
        error.response?.data?.message || 'Erro ao desativar usuário',
        'error'
      );
    } finally {
      hideLoading();
    }
  };

  // Filtra professores que ainda não têm usuário
  const professoresSemUsuario = professores.filter(
    (professor) =>
      !usuarios.some((usuario) => usuario.professorId === professor.id)
  );

  return (
    <div>
      {FeedbackComponent}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Gerenciar Usuários</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenDialog}
        >
          Novo Usuário Professor
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Professor</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>{usuario.username}</TableCell>
                <TableCell>
                  <Chip
                    label={
                      usuario.role === 'ROLE_ADMIN' ? 'Administrador' : 'Professor'
                    }
                    color={usuario.role === 'ROLE_ADMIN' ? 'primary' : 'secondary'}
                  />
                </TableCell>
                <TableCell>{usuario.professorNome || '-'}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                    onClick={() => handleOpenResetSenhaDialog(usuario)}
                  >
                    Resetar Senha
                  </Button>
                  {usuario.role !== 'ROLE_ADMIN' && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDesativarUsuario(usuario.id)}
                    >
                      Desativar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para criar usuário professor */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Criar Usuário Professor</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Username (email)"
            name="username"
            type="email"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Senha"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Professor</InputLabel>
            <Select
              name="professorId"
              value={formData.professorId}
              onChange={handleChange}
              required
            >
              {professoresSemUsuario.map((professor) => (
                <MenuItem key={professor.id} value={professor.id}>
                  {professor.nome} - {professor.escola}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} color="primary">
            Criar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para resetar senha */}
      <Dialog open={resetSenhaDialogOpen} onClose={handleCloseResetSenhaDialog}>
        <DialogTitle>Resetar Senha</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Usuário: {selectedUsuario?.username}
          </Typography>
          <TextField
            fullWidth
            label="Nova Senha"
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResetSenhaDialog}>Cancelar</Button>
          <Button onClick={handleResetSenha} color="primary">
            Resetar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default GerenciarUsuarios;