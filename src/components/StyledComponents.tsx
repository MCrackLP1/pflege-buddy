/**
 * StyledComponents.tsx
 * 
 * Diese Datei enthält vorgefertigte, stilisierte React Native Komponenten,
 * die in der gesamten Anwendung wiederverwendet werden können.
 * Dies reduziert den Einsatz von Inline-Styles und fördert die Konsistenz.
 */

import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { standardSpacing } from '../utils/styleUtils';

// Card-Komponente für Container mit Schatten und abgerundeten Ecken
interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  noPadding?: boolean;
}

export const Card = ({ children, style, noPadding = false }: CardProps) => {
  const { theme } = useSettings();
  const backgroundColor = theme === 'dark' ? '#2a2a2a' : '#ffffff';
  const borderColor = theme === 'dark' ? '#444444' : '#eeeeee';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor,
          padding: noPadding ? 0 : standardSpacing.m,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

// Überschrift-Komponenten
interface HeadingProps {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}

export const H1 = ({ children, style }: HeadingProps) => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const textColor = theme === 'dark' ? '#e1e1e1' : '#333333';

  return (
    <Text
      style={[
        styles.heading,
        {
          fontSize: baseFontSize * fontSizeScale * 1.8,
          color: textColor,
          marginBottom: standardSpacing.m,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export const H2 = ({ children, style }: HeadingProps) => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const textColor = theme === 'dark' ? '#e1e1e1' : '#333333';

  return (
    <Text
      style={[
        styles.heading,
        {
          fontSize: baseFontSize * fontSizeScale * 1.5,
          color: textColor,
          marginBottom: standardSpacing.s,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export const H3 = ({ children, style }: HeadingProps) => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const textColor = theme === 'dark' ? '#e1e1e1' : '#333333';

  return (
    <Text
      style={[
        styles.heading,
        {
          fontSize: baseFontSize * fontSizeScale * 1.3,
          color: textColor,
          marginBottom: standardSpacing.xs,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

// Paragraph-Komponente
interface ParagraphProps {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}

export const Paragraph = ({ children, style }: ParagraphProps) => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const textColor = theme === 'dark' ? '#b0b0b0' : '#555555';

  return (
    <Text
      style={[
        {
          fontSize: baseFontSize * fontSizeScale,
          color: textColor,
          marginBottom: standardSpacing.s,
          lineHeight: baseFontSize * fontSizeScale * 1.4,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

// StyledInput-Komponente für TextInputs
interface StyledInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const StyledInput = ({ label, error, style, ...props }: StyledInputProps) => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const textColor = theme === 'dark' ? '#e1e1e1' : '#333333';
  const backgroundColor = theme === 'dark' ? '#1e1e1e' : '#ffffff';
  const borderColor = error
    ? '#e74c3c'
    : theme === 'dark'
    ? '#444444'
    : '#dddddd';

  return (
    <View style={styles.inputContainer}>
      {label && (
        <Text
          style={{
            fontSize: baseFontSize * fontSizeScale * 0.9,
            marginBottom: standardSpacing.xs,
            color: theme === 'dark' ? '#888888' : '#666666',
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            fontSize: baseFontSize * fontSizeScale,
            backgroundColor,
            color: textColor,
            borderColor,
          },
          style,
        ]}
        placeholderTextColor={theme === 'dark' ? '#666666' : '#999999'}
        {...props}
      />
      {error && (
        <Text
          style={{
            fontSize: baseFontSize * fontSizeScale * 0.8,
            color: '#e74c3c',
            marginTop: standardSpacing.xs,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

// Button-Komponente
interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

export const Button = ({
  title,
  onPress,
  type = 'primary',
  style,
  textStyle,
  disabled = false,
}: ButtonProps) => {
  const { theme } = useSettings();
  
  // Button-Typ-spezifische Stile
  const buttonStyles: Record<string, ViewStyle> = {
    primary: {
      backgroundColor: disabled ? '#888888' : '#32b8ca',
    },
    secondary: {
      backgroundColor: disabled 
        ? theme === 'dark' ? '#333333' : '#cccccc'
        : theme === 'dark' ? '#444444' : '#eeeeee',
    },
    success: {
      backgroundColor: disabled ? '#888888' : '#27ae60',
    },
    danger: {
      backgroundColor: disabled ? '#888888' : '#e74c3c',
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#444444' : '#dddddd',
    },
  };

  // Text-Farben je nach Button-Typ
  const textColors: Record<string, string> = {
    primary: '#ffffff',
    secondary: theme === 'dark' ? '#e1e1e1' : '#555555',
    success: '#ffffff',
    danger: '#ffffff',
    outline: theme === 'dark' ? '#e1e1e1' : '#555555',
  };

  return (
    <TouchableOpacity
      style={[styles.button, buttonStyles[type], style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.buttonText,
          { color: textColors[type], opacity: disabled ? 0.7 : 1 },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// Divider-Komponente (horizontale Linie)
interface DividerProps {
  style?: StyleProp<ViewStyle>;
}

export const Divider = ({ style }: DividerProps) => {
  const { theme } = useSettings();
  const backgroundColor = theme === 'dark' ? '#444444' : '#eeeeee';

  return (
    <View
      style={[
        {
          height: 1,
          backgroundColor,
          marginVertical: standardSpacing.m,
        },
        style,
      ]}
    />
  );
};

// Badge-Komponente
interface BadgeProps {
  text: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Badge = ({ text, color = '#32b8ca', style, textStyle }: BadgeProps) => {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color,
        },
        style,
      ]}
    >
      <Text style={[styles.badgeText, textStyle]}>{text}</Text>
    </View>
  );
};

// Spacer-Komponente für einfaches Spacing
interface SpacerProps {
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';
  horizontal?: boolean;
}

export const Spacer = ({ size = 'm', horizontal = false }: SpacerProps) => {
  const sizes = {
    xs: standardSpacing.xs,
    s: standardSpacing.s,
    m: standardSpacing.m,
    l: standardSpacing.l,
    xl: standardSpacing.xl,
  };

  return (
    <View
      style={{
        [horizontal ? 'width' : 'height']: sizes[size],
      }}
    />
  );
};

// Basis-Styles
const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: standardSpacing.m,
  },
  heading: {
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: standardSpacing.m,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: standardSpacing.m,
    paddingVertical: standardSpacing.s,
  },
  button: {
    borderRadius: 8,
    paddingVertical: standardSpacing.s,
    paddingHorizontal: standardSpacing.m,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  badge: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default {
  Card,
  H1,
  H2,
  H3,
  Paragraph,
  StyledInput,
  Button,
  Divider,
  Badge,
  Spacer,
}; 