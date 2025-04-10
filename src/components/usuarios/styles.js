import { styled } from '@mui/material/styles';
import {
  Typography,
  Paper,
  Button,
  TextField,
  Select,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

export const FormContainer = styled(Paper)(({ theme }) => ({
  borderRadius: '10px',
  padding: '30px',
  width: '100%',
  maxWidth: '800px',
  margin: '30px auto',
  boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
}));

export const PageTitle = styled(Typography)({
  color: '#0F1140',
  marginBottom: '24px',
  fontSize: '24px',
  fontWeight: 'bold',
});

export const FormLabel = styled(Typography)({
  marginBottom: '8px',
  fontWeight: '500',
  color: '#0F1140',
});

export const StyledButton = styled(Button)(({ variant }) => ({
  backgroundColor: variant === 'contained' ? '#0F1140' : 'transparent',
  color: variant === 'contained' ? 'white' : '#0F1140',
  border: variant === 'outlined' ? '1px solid #0F1140' : 'none',
  borderRadius: '8px',
  padding: '10px 20px',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: variant === 'contained' ? '#1a1b4b' : 'rgba(15, 17, 64, 0.1)',
  },
  minWidth: '120px',
}));

export const ActionButton = styled(Button)(({ color }) => ({
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

export const StyledField = styled(TextField)({
  marginBottom: '20px',
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
  },
});

export const StyledSelect = styled(Select)({
  width: '100%',
  borderRadius: '8px',
  marginBottom: '20px',
});

export const StyledDialogTitle = styled(DialogTitle)({
  color: '#0F1140',
  fontSize: '22px',
  fontWeight: 'bold',
  padding: '20px 24px 16px',
  marginBottom: '8px',
});

export const StyledDialogContent = styled(DialogContent)({
  padding: '8px 24px 16px',
});

export const StyledDialogActions = styled(DialogActions)({
  padding: '16px 24px',
  marginTop: '8px',
});