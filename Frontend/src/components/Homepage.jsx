import Lottie from 'lottie-react';
import animationData from '../assets/homepage.json';

function Homepage() {
    return (
        <div style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            height: '100%'
        }}>
            {/* Text elements */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '80%',
                transform: 'translate(-50%, -50%)',
                color: 'black',
                fontSize: '60px',
                fontFamily: '"Ubuntu", sans-serif',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                whiteSpace: 'nowrap'
            }}>
                <div>secure and smart.</div>
            </div>
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '20%',
                transform: 'translate(-50%, -50%)',
                color: 'black',
                fontSize: '60px',
                fontFamily: '"Ubuntu", sans-serif',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                whiteSpace: 'nowrap'
            }}>
                <div>Effortless booking</div>
            </div>
            
            {/* Lottie animation */}
            <Lottie 
                animationData={animationData} 
                style={{ 
                    width: '700px', 
                    height: '700px', 
                    zIndex: 1, // Ensure the animation is on top
                    justifyContent: 'center',
                    pointerEvents: 'auto' // Ensure it can receive pointer events
                }}
            />
        </div>
    );
}

export default Homepage;