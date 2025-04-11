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
  Box,
  Chip,
  Grid,
  Alert,
  Dialog,
} from '@mui/material';
import { useFeedback } from '../common/Feedback';
import { useLoading } from '../../contexts/LoadingContext';
import api from '../../services/api';

// Importar estilos e componentes de diálogo
import { 
  PageTitle, 
  StyledButton, 
  ActionButton, 
  StyledDialogTitle, 
  StyledDialogContent, 
  StyledDialogActions,
  StyledField,
  FormLabel
} from './styles';
import NovoUsuarioDialog from './dialogs/NovoUsuarioDialog';

const GerenciarUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resetSenhaDialogOpen, setResetSenhaDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [usuarioToDelete, setUsuarioToDelete] = useState(null);
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

  const handleCloseDialog = () => setDialogOpen(false);
  
  const handleOpenResetSenhaDialog = (usuario) => {
    setSelectedUsuario(usuario);
    setNovaSenha('');
    setResetSenhaDialogOpen(true);
  };

  const handleCloseResetSenhaDialog = () => {
    setResetSenhaDialogOpen(false);
    setSelectedUsuario(null);
  };

  const handleOpenDeleteDialog = (usuario) => {
    setUsuarioToDelete(usuario);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUsuarioToDelete(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    // Validações
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.username)) {
      showFeedback('Por favor, insira um email válido', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showFeedback('A senha deve ter pelo menos 6 caracteres', 'error');
      return;
    }

    if (!formData.professorId) {
      showFeedback('Selecione um professor', 'error');
      return;
    }

    showLoading('Criando usuário...');
    
    try {
      const dadosFormatados = {
        username: formData.username,
        password: formData.password,
        professorId: parseInt(formData.professorId, 10)
      };
      
      await api.post('/admin/usuarios/professor', dadosFormatados);
      
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
    if (!novaSenha || novaSenha.length < 6) {
      showFeedback('A nova senha deve ter pelo menos 6 caracteres', 'error');
      return;
    }

    showLoading('Resetando senha...');
    try {
      await api.put(`/admin/usuarios/${selectedUsuario.id}/resetar-senha`, {
        novaSenha
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

  const confirmDelete = async () => {
    if (!usuarioToDelete) return;
    
    showLoading('Desativando usuário...');
    try {
      await api.delete(`/admin/usuarios/${usuarioToDelete.id}`);
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
      handleCloseDeleteDialog();
    }
  };

  // Filtra professores que ainda não têm usuário
  const professoresSemUsuario = professores.filter(
    (professor) =>
      !usuarios.some((usuario) => usuario.professorId === professor.id)
  );

  return (
    <div>
      <FeedbackComponent />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <PageTitle>Gerenciar Usuários</PageTitle>
        <StyledButton
          variant="contained"
          onClick={handleOpenDialog}
        >
          Novo Usuário
        </StyledButton>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)', borderRadius: '10px' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Professor</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.length > 0 ? (
              usuarios.map((usuario) => (
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
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <ActionButton
                        onClick={() => handleOpenResetSenhaDialog(usuario)}
                        size="small"
                      >
                        Resetar Senha
                      </ActionButton>
                      
                      {usuario.role !== 'ROLE_ADMIN' && (
                        <ActionButton
                          onClick={() => handleOpenDeleteDialog(usuario)}
                          color="error"
                          size="small"
                        >
                          Excluir
                        </ActionButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Nenhum usuário cadastrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Usando o componente de diálogo extraído */}
      <NovoUsuarioDialog 
        open={dialogOpen}
        onClose={handleCloseDialog}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        professoresSemUsuario={professoresSemUsuario}
      />

      {/* Dialog para resetar senha */}
      <Dialog 
        open={resetSenhaDialogOpen} 
        onClose={handleCloseResetSenhaDialog}
        PaperProps={{
          style: {
            borderRadius: '10px',
            maxWidth: '500px',
            width: '100%'
          }
        }}
      >
        <StyledDialogTitle>
          Resetar Senha
        </StyledDialogTitle>
        <StyledDialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Você está resetando a senha do usuário <strong>{selectedUsuario?.username}</strong>
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <FormLabel>Nova Senha</FormLabel>
              <StyledField
                fullWidth
                placeholder="Digite a nova senha"
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
                variant="outlined"
              />
            </Grid>
          </Grid>
        </StyledDialogContent>
        <StyledDialogActions>
          <Box display="flex" justifyContent="space-between" width="100%">
            <StyledButton variant="outlined" onClick={handleCloseResetSenhaDialog}>
              Cancelar
            </StyledButton>
            <StyledButton variant="contained" onClick={handleResetSenha}>
              Resetar
            </StyledButton>
          </Box>
        </StyledDialogActions>
      </Dialog>

      {/* Dialog para confirmar exclusão */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleCloseDeleteDialog}
        PaperProps={{
          style: {
            borderRadius: '10px',
            maxWidth: '500px',
            width: '100%'
          }
        }}
      >
        <StyledDialogTitle>
          Confirmar Exclusão
        </StyledDialogTitle>
        <StyledDialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="warning" sx={{ mb: 3 }}>
                Tem certeza que deseja excluir o usuário <strong>{usuarioToDelete?.username}</strong>?
              </Alert>
            </Grid>
          </Grid>
        </StyledDialogContent>
        <StyledDialogActions>
          <Box display="flex" justifyContent="space-between" width="100%">
            <StyledButton variant="outlined" onClick={handleCloseDeleteDialog}>
              Cancelar
            </StyledButton>
            <StyledButton
              variant="contained"
              color="error"
              onClick={confirmDelete}
              sx={{ 
                backgroundColor: '#f44336',
                '&:hover': {
                  backgroundColor: '#d32f2f'
                }
              }}
            >
              Excluir
            </StyledButton>
          </Box>
        </StyledDialogActions>
      </Dialog>
    </div>
  );
};

export default GerenciarUsuarios;