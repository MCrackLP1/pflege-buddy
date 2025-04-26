/**
 * styleUtils.ts
 * Utility-Funktionen für dynamische Styles
 */

import { StyleSheet } from 'react-native';

export const getDynamicStyles = (theme: 'light' | 'dark', scaledFontSize: number) => {
  const colors = theme === 'dark' 
    ? {
        background: '#121212',
        card: '#1e1e1e',
        surface: '#252525',
        text: '#e1e1e1',
        subText: '#b0b0b0',
        border: '#333333',
        input: '#2a2a2a',
        button: '#bb86fc',
        buttonText: '#ffffff',
        primary: '#bb86fc', // violett
        accent: '#bb86fc',
        inactive: '#777777',
        error: '#cf6679', // rot
        notification: '#03dac6', // türkis
        highlight: '#1f1f1f',
        headerBg: '#1e1e1e',
        divider: '#333333',
        ripple: 'rgba(255, 255, 255, 0.1)',
      }
    : {
        background: '#f5f5f5',
        card: '#ffffff',
        surface: '#ffffff',
        text: '#333333',
        subText: '#666666',
        border: '#dddddd',
        input: '#ffffff',
        button: '#0066cc',
        buttonText: '#ffffff',
        primary: '#0066cc', // blau
        accent: '#0066cc',
        inactive: '#999999',
        error: '#e53935', // rot
        notification: '#00acc1', // türkis
        highlight: '#f0f0f0',
        headerBg: '#ffffff',
        divider: '#e0e0e0',
        ripple: 'rgba(0, 0, 0, 0.1)',
      };

  // Standardisierte Abstandswerte für einheitliches Design
  const spacing = {
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
    xxl: 32,
  };

  // Standardisierte Radius-Werte
  const radius = {
    s: 4,
    m: 8,
    l: 12,
    xl: 16,
    xxl: 24,
  };

  return StyleSheet.create({
    // Allgemeine Stile
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.m,
      padding: spacing.l,
      marginVertical: spacing.s,
      marginHorizontal: spacing.l,
      shadowColor: theme === 'dark' ? '#000000' : '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: theme === 'dark' ? 0.4 : 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    headerContainer: {
      paddingVertical: spacing.l,
      paddingHorizontal: spacing.l,
      paddingTop: 40,
      backgroundColor: colors.headerBg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: scaledFontSize * 1.3,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.s,
    },
    headerSubtitle: {
      fontSize: scaledFontSize,
      color: colors.subText,
      textAlign: 'center',
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: scaledFontSize * 1.2,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: spacing.m,
      paddingHorizontal: spacing.l,
    },
    searchContainer: {
      padding: spacing.l,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchInput: {
      height: 46,
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.m,
      paddingHorizontal: spacing.l,
      fontSize: scaledFontSize,
      color: colors.text,
    },
    listItem: {
      paddingVertical: spacing.m,
      paddingHorizontal: spacing.l,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    itemTitle: {
      fontSize: scaledFontSize * 1.1,
      color: colors.text,
      fontWeight: '500',
    },
    itemSubtitle: {
      fontSize: scaledFontSize * 0.9,
      color: colors.subText,
      marginTop: spacing.xs,
    },
    button: {
      backgroundColor: colors.button,
      borderRadius: radius.m,
      paddingVertical: spacing.m,
      paddingHorizontal: spacing.l,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: spacing.s,
    },
    buttonText: {
      color: colors.buttonText,
      fontSize: scaledFontSize,
      fontWeight: '500',
    },
    buttonOutline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.button,
    },
    buttonOutlineText: {
      color: colors.button,
    },
    icon: {
      color: colors.text,
    },
    centeredContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.l,
    },
    errorText: {
      color: colors.error,
      fontSize: scaledFontSize,
      textAlign: 'center',
      marginVertical: spacing.l,
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: spacing.l,
    },
    chip: {
      backgroundColor: colors.highlight,
      borderRadius: radius.xl,
      paddingVertical: spacing.xs + 2,
      paddingHorizontal: spacing.m,
      marginRight: spacing.s,
      marginBottom: spacing.s,
    },
    chipText: {
      color: colors.text,
      fontSize: scaledFontSize * 0.9,
    },
    linkText: {
      color: colors.accent,
      fontSize: scaledFontSize,
      textDecorationLine: 'underline',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.m,
      paddingHorizontal: spacing.l,
      backgroundColor: colors.headerBg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: scaledFontSize * 1.1,
      fontWeight: 'bold',
      color: colors.text,
      flex: 1,
      textAlign: 'center',
    },
    modalContent: {
      flex: 1,
      padding: spacing.l,
    },
    badge: {
      backgroundColor: colors.error,
      borderRadius: radius.m,
      paddingHorizontal: spacing.s,
      paddingVertical: spacing.xs,
      minWidth: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: scaledFontSize * 0.8,
      fontWeight: 'bold',
    },
    // Standardisierte Abstands-Styles
    paddingXS: {
      padding: spacing.xs,
    },
    paddingS: {
      padding: spacing.s,
    },
    paddingM: {
      padding: spacing.m,
    },
    paddingL: {
      padding: spacing.l,
    },
    paddingXL: {
      padding: spacing.xl,
    },
    marginXS: {
      margin: spacing.xs,
    },
    marginS: {
      margin: spacing.s,
    },
    marginM: {
      margin: spacing.m,
    },
    marginL: {
      margin: spacing.l,
    },
    marginXL: {
      margin: spacing.xl,
    },
    paddingHorizontalXS: {
      paddingHorizontal: spacing.xs,
    },
    paddingHorizontalS: {
      paddingHorizontal: spacing.s,
    },
    paddingHorizontalM: {
      paddingHorizontal: spacing.m,
    },
    paddingHorizontalL: {
      paddingHorizontal: spacing.l,
    },
    paddingHorizontalXL: {
      paddingHorizontal: spacing.xl,
    },
    paddingVerticalXS: {
      paddingVertical: spacing.xs,
    },
    paddingVerticalS: {
      paddingVertical: spacing.s,
    },
    paddingVerticalM: {
      paddingVertical: spacing.m,
    },
    paddingVerticalL: {
      paddingVertical: spacing.l,
    },
    paddingVerticalXL: {
      paddingVertical: spacing.xl,
    },
    marginHorizontalXS: {
      marginHorizontal: spacing.xs,
    },
    marginHorizontalS: {
      marginHorizontal: spacing.s,
    },
    marginHorizontalM: {
      marginHorizontal: spacing.m,
    },
    marginHorizontalL: {
      marginHorizontal: spacing.l,
    },
    marginHorizontalXL: {
      marginHorizontal: spacing.xl,
    },
    marginVerticalXS: {
      marginVertical: spacing.xs,
    },
    marginVerticalS: {
      marginVertical: spacing.s,
    },
    marginVerticalM: {
      marginVertical: spacing.m,
    },
    marginVerticalL: {
      marginVertical: spacing.l,
    },
    marginVerticalXL: {
      marginVertical: spacing.xl,
    },
  });
};

// Farben für spezifische Statusanzeigen
export const getStatusColors = (theme: 'light' | 'dark') => {
  return {
    success: theme === 'dark' ? '#81c784' : '#4caf50', // grün
    warning: theme === 'dark' ? '#ffb74d' : '#ff9800', // orange
    error: theme === 'dark' ? '#e57373' : '#f44336',   // rot
    info: theme === 'dark' ? '#64b5f6' : '#2196f3',    // blau
  };
};

// Exportiere die Standardwerte für Konsistenz
export const standardSpacing = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
};

export const standardRadius = {
  s: 4,
  m: 8,
  l: 12,
  xl: 16,
  xxl: 24,
}; 