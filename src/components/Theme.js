import { createTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

const useCustomTheme = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  return createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 500,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
  });
};

export default useCustomTheme;
