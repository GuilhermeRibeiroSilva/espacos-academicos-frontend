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
  Grid,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useFeedback } from '../common/Feedback';
import { useLoading } from '../../contexts/LoadingContext';
import api from '../../services/api';

// Criar um estilo base para campos de formulário
const formFieldStyles = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#F2EEFF',
    borderRadius: '8px',
    '& fieldset': {
      border: 'none',
    },
  },
  marginBottom: '20px',
};

// E aplicar nos componentes styled
const StyledTextField = styled(TextField)(formFieldStyles);
const StyledFormControl = styled(FormControl)(formFieldStyles);

// Estilos personalizados
const FormContainer = styled(Box)({
  backgroundColor: '#0F1140',
  borderRadius: '10px',
  padding: '30px',
  width: '100%',
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
});

const FormLabel = styled(Typography)({
  color: 'white',
  marginBottom: '8px',
  fontSize: '16px',
});

const SaveButton = styled(Button)({
  backgroundColor: '#F2EEFF',
  color: '#0F1140',
  padding: '12px 24px',
  borderRadius: '8px',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: '#E5E0FF',
  },
});

const CancelButton = styled(Button)({
  backgroundColor: 'transparent',
  color: '#F2EEFF',
  padding: '12px 24px',
  borderRadius: '8px',
  fontWeight: 'bold',
  border: '1px solid #F2EEFF',
  '&:hover': {
    backgroundColor: 'rgba(242, 238, 255, 0.1)',
  },
});

const ButtonContainer = styled(Box)({
  display: 'flex',
  gap: '16px',
  justifyContent: 'center',
  marginTop: '30px',
});

const StyledDialogTitle = styled(DialogTitle)({
  backgroundColor: '#0F1140',
  color: 'white',
  textAlign: 'center',
  padding: '20px',
});

const StyledDialogContent = styled(DialogContent)({
  backgroundColor: '#0F1140',
  padding: '20px 30px',
});

const StyledDialogActions = styled(DialogActions)({
  backgroundColor: '#0F1140',
  padding: '20px',
  justifyContent: 'center',
});

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

  // Adicionar validações robustas para emails e senhas
  const handleSubmit = async () => {
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.username)) {
      showFeedback('Por favor, insira um email válido', 'error');
      return;
    }

    // Validar senha
    if (formData.password.length < 6) {
      showFeedback('A senha deve ter pelo menos 6 caracteres', 'error');
      return;
    }

    // Validar seleção de professor
    if (!formData.professorId) {
      showFeedback('Selecione um professor', 'error');
      return;
    }

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
        <Typography variant="h5">Gerenciar Usuários</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenDialog}
          sx={{
            bgcolor: '#0F1140',
            '&:hover': { bgcolor: '#1a1b4b' },
            borderRadius: '4px',
            py: 1.5,
            px: 3
          }}
        >
          Novo Usuário
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
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleOpenResetSenhaDialog(usuario)}
                      sx={{
                        mr: 1,
                        bgcolor: '#0F1140',
                        '&:hover': { bgcolor: '#1a1b4b' }
                      }}
                    >
                      Resetar Senha
                    </Button>
                    {usuario.role !== 'ROLE_ADMIN' && (
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleOpenDeleteDialog(usuario)}
                      >
                        Excluir
                      </Button>
                    )}
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

      {/* Dialog para criar usuário professor - ESTILIZADO */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        PaperProps={{
          style: {
            backgroundColor: '#0F1140',
            borderRadius: '10px',
            maxWidth: '500px',
            width: '100%'
          }
        }}
      >
        <StyledDialogTitle>Criar Usuário Professor</StyledDialogTitle>
        <StyledDialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormLabel>Nome de Usuário (email)</FormLabel>
              <StyledTextField
                fullWidth
                placeholder="Digite o email"
                name="username"
                type="email"
                value={formData.username}
                onChange={handleChange}
                required
                variant="outlined"
                InputLabelProps={{ shrink: false }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormLabel>Senha</FormLabel>
              <StyledTextField
                fullWidth
                placeholder="Digite a senha"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                variant="outlined"
                InputLabelProps={{ shrink: false }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormLabel>Professor</FormLabel>
              <StyledFormControl fullWidth>
                <Select
                  name="professorId"
                  value={formData.professorId}
                  onChange={handleChange}
                  required
                  displayEmpty
                  renderValue={(value) => {
                    if (!value) return 'Escolha um professor';
                    const professor = professoresSemUsuario.find(p => p.id === value);
                    return professor ? `${professor.nome} - ${professor.escola}` : '';
                  }}
                >
                  {professoresSemUsuario.map((professor) => (
                    <MenuItem key={professor.id} value={professor.id}>
                      {professor.nome} - {professor.escola}
                    </MenuItem>
                  ))}
                </Select>
              </StyledFormControl>
            </Grid>
          </Grid>
        </StyledDialogContent>
        <StyledDialogActions>
          <ButtonContainer>
            <CancelButton onClick={handleCloseDialog}>
              Cancelar
            </CancelButton>
            <SaveButton onClick={handleSubmit}>
              Cadastrar
            </SaveButton>
          </ButtonContainer>
        </StyledDialogActions>
      </Dialog>

      {/* Dialog para resetar senha - ESTILIZADO */}
      <Dialog 
        open={resetSenhaDialogOpen} 
        onClose={handleCloseResetSenhaDialog}
        PaperProps={{
          style: {
            backgroundColor: '#0F1140',
            borderRadius: '10px',
            maxWidth: '500px',
            width: '100%'
          }
        }}
      >
        <StyledDialogTitle>Resetar Senha</StyledDialogTitle>
        <StyledDialogContent>
          <FormLabel sx={{ mb: 2 }}>
            Usuário: {selectedUsuario?.username}
          </FormLabel>
          <FormLabel>Nova Senha</FormLabel>
          <StyledTextField
            fullWidth
            placeholder="Digite a nova senha"
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
            variant="outlined"
            InputLabelProps={{ shrink: false }}
          />
        </StyledDialogContent>
        <StyledDialogActions>
          <ButtonContainer>
            <CancelButton onClick={handleCloseResetSenhaDialog}>
              Cancelar
            </CancelButton>
            <SaveButton onClick={handleResetSenha}>
              Resetar
            </SaveButton>
          </ButtonContainer>
        </StyledDialogActions>
      </Dialog>

      {/* Dialog para confirmar exclusão - ESTILIZADO */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleCloseDeleteDialog}
        PaperProps={{
          style: {
            backgroundColor: '#0F1140',
            borderRadius: '10px',
            maxWidth: '500px',
            width: '100%'
          }
        }}
      >
        <StyledDialogTitle>Confirmar Exclusão</StyledDialogTitle>
        <StyledDialogContent>
          <Typography color="white">
            Tem certeza que deseja excluir o usuário {usuarioToDelete?.username}?
          </Typography>
        </StyledDialogContent>
        <StyledDialogActions>
          <ButtonContainer>
            <CancelButton onClick={handleCloseDeleteDialog}>
              Cancelar
            </CancelButton>
            <Button
              onClick={confirmDelete}
              variant="contained"
              color="error"
            >
              Excluir
            </Button>
          </ButtonContainer>
        </StyledDialogActions>
      </Dialog>
    </div>
  );
};

export default GerenciarUsuarios;