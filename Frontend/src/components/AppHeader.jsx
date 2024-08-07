import { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import { styled } from '@mui/material/styles';
import Login from './Login';
import Modal from '@mui/material/Modal';
import '../App.css';

const AnimatedButton = styled('button')({
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
});

function AppHeader() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleLogin = () => {
    setIsLoginOpen(!isLoginOpen);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
      <>
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
                      position: 'absolute',
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                >
                  Cura
                </Typography>
              </Box>
              {isLoggedIn ? (
                  <AnimatedButton onClick={handleLogout}>
                    <span>Logout</span>
                  </AnimatedButton>
              ) : (
                  <AnimatedButton onClick={toggleLogin}>
                    <span>Login</span>
                  </AnimatedButton>
              )}
            </Toolbar>
          </Container>
        </AppBar>
        <Modal
            open={isLoginOpen}
            onClose={toggleLogin}
            aria-labelledby="login-modal-title"
            aria-describedby="login-modal-description"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2
          }}>
            <Login
                onClose={toggleLogin}
                onSuccess={handleLoginSuccess}
            />
          </Box>
        </Modal>
      </>
  );
}

export default AppHeader;
