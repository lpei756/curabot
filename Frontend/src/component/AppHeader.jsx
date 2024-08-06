import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';

import { styled } from '@mui/material/styles';

import '../App.css';



const AnimatedButton = styled('button')(({ theme }) => ({

  background: 'linear-gradient(45deg, #7AE0F2 30%, #5BC0DE 90%)',

  border: 0,

  borderRadius: 20,

  boxShadow: '0 3px 3px 2px rgba(91, 192, 222, .3)',

  color: 'white',

  height: 40,

  padding: '0 30px',

  fontWeight: 'bold',

  transition: 'all 0.3s ease-in-out',

  cursor: 'pointer',

  '&:hover': {

    background: 'linear-gradient(45deg, #5BC0DE 30%, #7AE0F2 90%)',

    transform: 'scale(1.05)',

    boxShadow: '0 4px 3px 2px rgba(91, 192, 222, .4)',

  },

}));

function AppHeader() {

  const [isHovered, setIsHovered] = useState(false);
  return (
    <AppBar position="static" sx={{ 

      backgroundColor: '#7AE0F2', 

      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',

    }}>

      <Container maxWidth="xl">

        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>

            <IconButton

              size="large"

              edge="start"

              color="inherit"

              aria-label="menu"

              sx={{ mr: 2 }}

            >

              <MenuIcon />

            </IconButton>

            <Typography

              variant="h5"

              noWrap

              component="div"

              sx={{

                fontWeight: 'bold',

                color: 'white',

                textDecoration: 'none',

                letterSpacing: '.2rem',

                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',

              }}

            >

              Cura

            </Typography>

          </Box>

          <AnimatedButton

            onMouseEnter={() => setIsHovered(true)}

            onMouseLeave={() => setIsHovered(false)}

          >

            <span>Login</span>

          </AnimatedButton>
        </Toolbar>

        </Container>

</AppBar>

);

}



export default AppHeader;