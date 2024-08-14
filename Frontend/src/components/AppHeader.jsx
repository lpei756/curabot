import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import { styled } from '@mui/material/styles';
import Login from './Login';
import UserOptionsList from './Menu';
import Drawer from '@mui/material/Drawer';
import Modal from '@mui/material/Modal';
import '../App.css';
import logo from '../../public/logo.png';

const MenuIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'transparent',
  border: '2px solid black',
  borderRadius: '50%',
  height: 30,
  width: 30,
  padding: 20
}));

const AnimatedButton = styled('button')(({ variant }) => ({
  background: variant === 'login' ? '#03035d' : 'transparent',
  border: '2px solid black',
  borderRadius: 20,
  boxShadow: 'none',
  color: variant === 'login' ? 'white' : 'black',
  height: 40,
  padding: '0 30px',
  fontWeight: 'bold',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    background: variant === 'login' ? '#03035d' : 'rgba(0, 0, 0, 0.1)',
    transform: 'scale(1.05)',
    boxShadow: 'none',
    borderColor: 'black'
  },
}));

function AppHeader() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  const toggleLogin = () => {
    setIsLoginOpen(!isLoginOpen);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    if (token) {
      setIsLoggedIn(true);
    }
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MenuIconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer}
              >
                <MenuIcon sx={{ color: 'black' }} />
              </MenuIconButton>
              <Link to="/">
              <Typography
                variant="h5"
                noWrap
                component="div"
                sx={{
                  fontWeight: 'bold',
                  color: 'black',
                  textDecoration: 'none',
                  letterSpacing: '.2rem',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                <img src={logo} alt="FRW Healthcare Logo" style={{ height: 20, marginRight: 10 }} />
                FRW Healthcare
              </Typography>
              </Link>
            </Box>

            {isLoggedIn ? (
              <AnimatedButton variant="login" onClick={handleLogout}>
                <span>Logout</span>
              </AnimatedButton>
            ) : (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Link to="/register">
                  <AnimatedButton>
                    <span>Register</span>
                  </AnimatedButton>
                </Link>
                <AnimatedButton variant="login" onClick={toggleLogin}>
                  <span>Login</span>
                </AnimatedButton>
              </Box>
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
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={toggleDrawer}
      >
        <Box
          sx={{ width: 250, padding: 2 }}
          role="presentation"
          onClick={toggleDrawer}
          onKeyDown={toggleDrawer}
        >
          {isLoggedIn ? (
            <UserOptionsList options={['Profile', 'Appointment']} userId={userId} />
          ) : (
            <Typography>Please login to see user information</Typography>
          )}
        </Box>
      </Drawer>
    </>
  );
}

export default AppHeader;