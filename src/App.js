import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import ListaEspacos from './components/espacos/ListaEspacos';
import FormEspaco from './components/espacos/FormEspaco';

function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Sistema de Espaços Acadêmicos
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Espaços
          </Button>
          <Button color="inherit" component={Link} to="/espacos/novo">
            Novo Espaço
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<ListaEspacos />} />
          <Route path="/espacos/novo" element={<FormEspaco />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;