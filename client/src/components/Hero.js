
import { Box, Typography, Grid, Button, ThemeProvider, createTheme } from '@mui/material';
import gymImg from '../static/img/gym-landing.jpg';
import './styles/hero.css'; 
import { useNavigate } from 'react-router-dom';

const theme = createTheme({
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
    },
  });

function Hero() {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/signup')
    }
    return (
        <div className='hero-image' 
            style={{ backgroundImage: `url(${gymImg})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <Box sx={{ backgroundColor: 'rgba(0,0,0,0.6)' }} p={5}>
            <Grid container spacing={6}  direction="column" alignItems="center" justifyContent="center">
            <Grid item spacing={2} xs={12} md={6}>
            <ThemeProvider theme={theme}>
                <Typography sx={{ color: 'white', textShadow: 'black 1px 0 10px', marginBottom: '15px' }} variant="h3">
                Toronto Fitness Club
                </Typography>
                <Typography sx={{ color: 'white', textShadow: 'black 1px 0 10px' }} variant="h5" m={1}>
                Best Gym Ever!
                </Typography>
                <Button
                onClick={handleClick}
                variant="contained"
                color="primary"
                sx={{ width: '175px', height: '40px', fontSize: '16px', marginTop: '20px'}}
                >
                    GET STARTED
                </Button>
            </ThemeProvider>
            </Grid>
            </Grid>
        </Box>
        </div>
    );
}

export default Hero;