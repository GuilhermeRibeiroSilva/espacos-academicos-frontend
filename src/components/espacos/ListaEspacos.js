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

const ListaEspacos = () => {
    const [espacos, setEspacos] = useState([]);

    useEffect(() => {
        carregarEspacos();
    }, []);

    const carregarEspacos = async () => {
        try {
            const response = await api.get('/espacos');
            setEspacos(response.data);
        } catch (error) {
            console.error('Erro ao carregar espaços:', error);
        }
    };

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Sigla</TableCell>
                        <TableCell>Nome</TableCell>
                        <TableCell>Capacidade</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Ações</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {espacos.map((espaco) => (
                        <TableRow key={espaco.id}>
                            <TableCell>{espaco.sigla}</TableCell>
                            <TableCell>{espaco.nome}</TableCell>
                            <TableCell>{espaco.capacidadeAlunos}</TableCell>
                            <TableCell>
                                {espaco.disponivel ? 'Disponível' : 'Indisponível'}
                            </TableCell>
                            <TableCell>
                                <Button 
                                    variant="contained" 
                                    color="primary"
                                    onClick={() => {/* Implementar edição */}}
                                >
                                    Editar
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ListaEspacos;