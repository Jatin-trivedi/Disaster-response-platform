import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LiveDisasterMap from './map.tsx';
import DisasterResponseAppBar from './navbar.tsx';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f4f6f8',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

const App: React.FC = () => {
  return (<>
    <DisasterResponseAppBar/>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LiveDisasterMap />
    </ThemeProvider>
  </>
  );
};

export default App;
