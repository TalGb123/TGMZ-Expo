import { StyleSheet } from "react-native";

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
    inputBorder: isDark ? 'transparent' : '#D1D5DB',
  };
};

export const getStyles = (theme, isLandscape) => {
  const colors = getThemeColors(theme);

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardAvoiding: {
      flex: 1,
    },
    mainContainer: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 24,
      paddingTop: isLandscape ? 10 : 20, 
      paddingBottom: isLandscape ? 10 : 20,
    },
    
    headerContainer: {
      alignItems: 'center',
      marginBottom: isLandscape ? 5 : 10, 
    },
    mainTitle: {
      fontFamily: 'Jomhuria', 
      fontSize: isLandscape ? 40 : 50, 
      color: colors.primaryAccent,
      textAlign: 'center',
      paddingTop: 10,
    },

    formContainer: {
      flex: 1,
    },
    landscapeRow: {
      flex: 1,
      flexDirection: 'row',
      gap: 20, 
    },
    landscapeColumn: {
      flex: 1,
      justifyContent: 'flex-start',
    },
    portraitScroll: {
      flexGrow: 1,
      justifyContent: 'center',
    },

    inputContainer: {
      marginBottom: isLandscape ? 6 : 12,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMain,
      marginBottom: 4,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 24,
      paddingHorizontal: 16,
      height: isLandscape ? 40 : 45, 
      backgroundColor: colors.inputBackground,
      borderColor: colors.inputBorder,
    },
    input: {
      flex: 1,
      height: '100%',
      color: colors.textMain,
    },
    errorText: {
      color: colors.errorRed,
      fontSize: 11,
      marginTop: 4,
      marginLeft: 10,
    },
    validText: {
      color: colors.successGreen,
      fontSize: 11,
      marginTop: 4,
      marginLeft: 10,
    },

    registerButton: {
      backgroundColor: colors.inputBackground,
      padding: isLandscape ? 12 : 18, 
      borderRadius: 28,
      alignItems: 'center',
      marginTop: isLandscape ? 35 : 25, 
      borderColor: colors.inputBorder,
      borderWidth: 1,
    },
    registerButtonActive: {
      backgroundColor: colors.primaryAccent,
      borderWidth: 0,
    },
    registerButtonText: {
      color: colors.textMain,
      fontWeight: 'bold',
      fontSize: 18,
    },
    registerButtonSubtext: {
      color: colors.textMain,
      fontSize: 12,
      opacity: 0.8,
    },
    dateValue: { 
      flex: 1, 
      color: colors.textMain 
    },
  });
};