import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme, useWindowDimensions, StyleSheet } from 'react-native';

export const getThemeColors = (theme) => {
    const isDark = theme === 'dark';
    return {
        background: isDark ? '#1C1C1E' : '#EAECEF', 
        primaryAccent: '#58D68D',
        inputBackground: isDark ? '#2C2C2E' : '#FFFFFF',
        textMain: isDark ? '#FFFFFF' : '#1C1C1E',
        textGrey: '#A0A0A0',
        errorRed: '#FF4D4D',
        successGreen: '#4DFF88',
        borderColor: isDark ? '#333333' : '#D1D5DB',
        cardBackground: isDark ? '#2C2C2E' : '#FFFFFF',
    };
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const systemTheme = useColorScheme();
    const theme = systemTheme || 'light';
    const colors = getThemeColors(theme);
    
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;

    const value = useMemo(() => ({
        theme,
        colors,
        isLandscape,
        width,
        height
    }), [theme, colors, isLandscape, width, height]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useAppTheme = () => useContext(ThemeContext);

export const useStyles = (styleGenerator) => {
    const { colors, isLandscape, width } = useAppTheme();
    return useMemo(() => StyleSheet.create(styleGenerator(colors, isLandscape, width)), [colors, isLandscape, width]);
};