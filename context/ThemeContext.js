import React, { createContext, useContext, useState } from 'react';

const DARK = {
  darkNavy: '#2D3A48',
  contentBg: '#626C72',
  logoutBg: '#424E58',
  activeBtn: '#8EA8BE',
  floatBtn: '#7F8CDA',
  headerBg: '#838D95',
  lightBg: '#b7c0c8',
  navBg: '#2D3A48',
  navInactive: '#848FA9',
  navActive: '#CBDAFF',
  navIndicator: 'rgba(203, 218, 255, 0.12)',
};

const LIGHT = {
  darkNavy: '#A79E8D',
  contentBg: '#C1B69C',
  logoutBg: '#B1A893',
  activeBtn: '#FFF4DC',
  floatBtn: '#EADF8B',
  headerBg: '#D8D1B9',
  lightBg: '#ddd9d0',
  navBg: '#A79E8D',
  navInactive: '#9E554D',
  navActive: '#F3C0BA',
  navIndicator: 'rgba(243, 192, 186, 0.12)',
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState('dark');
  const colors = themeMode === 'dark' ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
