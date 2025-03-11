import React, { useState, useEffect } from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper,
    Button 
} from '@mui/material';
import api from '../../services/api';

const ListaProfessores = () => {
    const [professores, setProfessores] = useState([]);

    useEffect(() => {
        carregarProfessores();
    }, []);

    const carregarProfessores = async () => {
        try {
            const response = await api.get('/professores');
            setProfessores(response.data);
        } catch (error) {
            console.error('Erro ao carregar professores:', error);
        }
    };

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Nome</TableCell>
                        <TableCell>Escola</TableCell>
                        <TableCell>Ações</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {professores.map((professor) => (
                        <TableRow key={professor.id}>
                            <TableCell>{professor.nome}</TableCell>
                            <TableCell>{professor.escola}</TableCell>
                            <TableCell>
                                <Button 
                                    variant="contained" 
                                    color="primary"
                                    sx={{ mr: 1 }}
                                >
                                    Editar
                                </Button>
                                <Button 
                                    variant="contained" 
                                    color="secondary"
                                >
                                    Reservas
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ListaProfessores;