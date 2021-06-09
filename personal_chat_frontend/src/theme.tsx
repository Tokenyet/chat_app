import { createTheme } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#fff',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          WebkitFontSmoothing: 'auto',
          '*::-webkit-scrollbar': {
            width: '0.4em',
          },
          '*::-webkit-scrollbar-track': {
            WebkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
            borderRadius: 64,
          },
          '*::-webkit-scrollbar-thumb': {
            borderRadius: 64,
            backgroundColor: 'rgba(0,0,0,.5)',
            // outline: '1px solid slategrey'
          },
        },
      },
    },
  },
});

export default theme;
