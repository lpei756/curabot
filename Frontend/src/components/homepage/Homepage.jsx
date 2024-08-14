import Lottie from 'lottie-react';
import animationData from '../../assets/homepage.json';

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

            <Lottie
                animationData={animationData}
                style={{
                    width: '700px',
                    height: '700px',
                    zIndex: 1,
                    justifyContent: 'center',
                    pointerEvents: 'auto'
                }}
            />
        </div>
    );
}

export default Homepage;
