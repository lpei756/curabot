import { Box, Typography } from '@mui/material';
import Lottie from 'lottie-react';
import animationData from '../../assets/homepage.json';

function Homepage() {

    return (
        <Box
            sx={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
            }}
        >
            <Typography
                sx={{
                    position: 'absolute',
                    top: {xs: '75%', sm: '85%', md: '85%', lg: '50%'},
                    left: {xs: '50%', lg: '80%'},
                    transform: 'translate(-50%, -50%)',
                    color: 'black',
                    fontSize: {xs: '50px', lg: '60px'},
                    fontFamily: '"Ubuntu", sans-serif',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                }}
            >
                secure and smart.
            </Typography>

            <Typography
                sx={{
                    position: 'absolute',
                    top: {xs: '25%', sm: '15%', md: '15%', lg: '50%'},
                    left: {xs: '50%', lg: '20%'},
                    transform: 'translate(-50%, -50%)',
                    color: 'black',
                    fontSize: {xs: '50px', lg: '60px'},
                    fontFamily: '"Ubuntu", sans-serif',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                }}
            >
                Effortless booking
            </Typography>

            <Lottie
                animationData={animationData}
                style={{
                    width: '700px',
                    height: '700px',
                    zIndex: 1,
                    justifyContent: 'center',
                    pointerEvents: 'auto',
                }}
            />
        </Box>
    );
}

export default Homepage;
