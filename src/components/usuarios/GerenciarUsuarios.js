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

// Componentes estilizados padronizados
const FormContainer = styled(Paper)(({ theme }) => ({
  borderRadius: '10px',
  padding: '30px',
  width: '100%',
  maxWidth: '800px',
  margin: '30px auto',
  boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
}));

const PageTitle = styled(Typography)({
  color: '#0F1140',
  marginBottom: '24px',
  fontSize: '24px',
  fontWeight: 'bold',
});

const FormLabel = styled(Typography)({
  marginBottom: '8px',
  fontWeight: '500',
  color: '#0F1140',
});

const StyledButton = styled(Button)(({ variant }) => ({
  backgroundColor: variant === 'contained' ? '#0F1140' : 'transparent',
  color: variant === 'contained' ? 'white' : '#0F1140',
  border: variant === 'outlined' ? '1px solid #0F1140' : 'none',
  borderRadius: '8px',
  padding: '10px 20px',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: variant === 'contained' ? '#1a1b4b' : 'rgba(15, 17, 64, 0.1)',
  },
  minWidth: '120px', // Garante largura mínima para os botões
}));

// Botão de ação padronizado para tabela
const ActionButton = styled(Button)(({ color }) => ({
  margin: '0 5px',
  borderRadius: '8px',
  padding: '6px 16px',
  minWidth: '120px',
  textTransform: 'none',
  fontWeight: 'bold',
  backgroundColor: color === 'error' ? '#f44336' : '#0F1140',
  color: 'white',
  '&:hover': {
    backgroundColor: color === 'error' ? '#d32f2f' : '#1a1b4b',
  }
}));

const StyledField = styled(TextField)({
  marginBottom: '20px',
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
  },
});

const StyledSelect = styled(Select)({
  width: '100%',
  borderRadius: '8px',
  marginBottom: '20px', // Adicionando margem inferior
});

// Componentes de diálogo estilizados
const StyledDialogTitle = styled(DialogTitle)({
  color: '#0F1140',
  fontSize: '22px',
  fontWeight: 'bold',
  padding: '20px 24px 16px', // Aumentado o padding inferior
  marginBottom: '8px', // Adicionado espaço após o título
});

const StyledDialogContent = styled(DialogContent)({
  padding: '8px 24px 16px', // Ajustado padding para compensar
});

const StyledDialogActions = styled(DialogActions)({
  padding: '16px 24px',
  marginTop: '8px', // Adicionado espaço antes das ações
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
    if (!novaSenha) {
      showFeedback('A nova senha é obrigatória', 'error');
      return;
    }

    if (novaSenha.length < 6) {
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
      console.error('Detalhes da resposta:', error.response?.data);
      
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

      {/* Dialog para criar usuário professor - CORRIGIDO ESPAÇAMENTO */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        PaperProps={{
          style: {
            borderRadius: '10px',
            maxWidth: '600px',
            width: '100%'
          }
        }}
      >
        <StyledDialogTitle>
          Criar Usuário Professor
        </StyledDialogTitle>
        <StyledDialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormLabel>Nome de Usuário (email)</FormLabel>
              <StyledField
                fullWidth
                placeholder="Digite o email"
                name="username"
                type="email"
                value={formData.username}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormLabel>Senha</FormLabel>
              <StyledField
                fullWidth
                placeholder="Digite a senha"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormLabel>Professor</FormLabel>
              <FormControl fullWidth>
                <StyledSelect
                  name="professorId"
                  value={formData.professorId}
                  onChange={handleChange}
                  required
                  displayEmpty
                  renderValue={(value) => {
                    if (!value) return 'Escolha um professor';
                    const professor = professoresSemUsuario.find(p => p.id === value);
                    return professor ? `${professor.nome} - ${professor.escola ? professor.escola : 'Sem Escola/Disciplina'}` : '';
                  }}
                >
                  <MenuItem value="" disabled>Selecione um professor</MenuItem>
                  {professoresSemUsuario.map((professor) => (
                    <MenuItem key={professor.id} value={professor.id}>
                      {professor.nome} - {professor.escola}
                    </MenuItem>
                  ))}
                </StyledSelect>
              </FormControl>
            </Grid>
          </Grid>
        </StyledDialogContent>
        <StyledDialogActions>
          <Box display="flex" justifyContent="space-between" width="100%">
            <StyledButton
              variant="outlined"
              onClick={handleCloseDialog}
            >
              Cancelar
            </StyledButton>
            <StyledButton
              variant="contained"
              onClick={handleSubmit}
            >
              Cadastrar
            </StyledButton>
          </Box>
        </StyledDialogActions>
      </Dialog>

      {/* Dialog para resetar senha - CORRIGIDO ESPAÇAMENTO */}
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
            <StyledButton
              variant="outlined"
              onClick={handleCloseResetSenhaDialog}
            >
              Cancelar
            </StyledButton>
            <StyledButton
              variant="contained"
              onClick={handleResetSenha}
            >
              Resetar
            </StyledButton>
          </Box>
        </StyledDialogActions>
      </Dialog>

      {/* Dialog para confirmar exclusão - CORRIGIDO ESPAÇAMENTO */}
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
            <Grid item xs={12}>
              <Typography variant="body1">
                Esta ação não pode ser desfeita.
              </Typography>
            </Grid>
          </Grid>
        </StyledDialogContent>
        <StyledDialogActions>
          <Box display="flex" justifyContent="space-between" width="100%">
            <StyledButton
              variant="outlined"
              onClick={handleCloseDeleteDialog}
            >
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