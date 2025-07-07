/**
 * ProgressComponents.tsx
 * UI-Komponenten für die Simulation-Fortschrittsanzeige
 */

import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';

interface ProgressBarProps {
  percentage: number;
  height?: number;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

/**
 * Fortschrittsbalken-Komponente
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  height = 6,
  showPercentage = false,
  color,
  backgroundColor,
  style
}) => {
  const { theme } = useSettings();
  
  const defaultProgressColor = color || (theme === 'dark' ? '#4caf50' : '#2e7d32');
  const defaultBackgroundColor = backgroundColor || (theme === 'dark' ? '#555' : '#e0e0e0');
  
  return (
    <View style={[{ alignItems: 'center' }, style]}>
      <View style={{
        width: '100%',
        height: height,
        backgroundColor: defaultBackgroundColor,
        borderRadius: height / 2,
        overflow: 'hidden'
      }}>
        <View style={{
          height: '100%',
          width: `${Math.min(100, Math.max(0, percentage))}%`,
          backgroundColor: defaultProgressColor,
          borderRadius: height / 2,
          transition: 'width 0.3s ease'
        }} />
      </View>
      {showPercentage && (
        <Text style={{
          marginTop: 4,
          fontSize: 12,
          color: theme === 'dark' ? '#ccc' : '#666',
          fontWeight: '500'
        }}>
          {Math.round(percentage)}%
        </Text>
      )}
    </View>
  );
};

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  style?: ViewStyle;
}

/**
 * Kreisförmiger Fortschrittsanzeiger
 */
export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 40,
  strokeWidth = 4,
  color,
  backgroundColor,
  showPercentage = true,
  style
}) => {
  const { theme } = useSettings();
  
  const defaultProgressColor = color || (theme === 'dark' ? '#4caf50' : '#2e7d32');
  const defaultBackgroundColor = backgroundColor || (theme === 'dark' ? '#555' : '#e0e0e0');
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <View style={[{
      width: size,
      height: size,
      alignItems: 'center',
      justifyContent: 'center'
    }, style]}>
      <View style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: defaultBackgroundColor
      }} />
      <View style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: defaultProgressColor,
        borderTopColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        transform: [{ rotate: `${(percentage / 100) * 360}deg` }]
      }} />
      {showPercentage && (
        <Text style={{
          fontSize: size * 0.25,
          color: theme === 'dark' ? '#fff' : '#000',
          fontWeight: '600'
        }}>
          {Math.round(percentage)}%
        </Text>
      )}
    </View>
  );
};

interface ProgressBadgeProps {
  percentage: number;
  isCompleted?: boolean;
  style?: ViewStyle;
}

/**
 * Fortschritts-Badge für Karten
 */
export const ProgressBadge: React.FC<ProgressBadgeProps> = ({
  percentage,
  isCompleted = false,
  style
}) => {
  const { theme } = useSettings();
  const { t } = useTranslation();
  
  const getProgressColor = () => {
    if (isCompleted) {
      return theme === 'dark' ? '#4caf50' : '#2e7d32';
    }
    if (percentage >= 80) {
      return theme === 'dark' ? '#8bc34a' : '#4caf50';
    }
    if (percentage >= 50) {
      return theme === 'dark' ? '#ff9800' : '#f57c00';
    }
    if (percentage >= 20) {
      return theme === 'dark' ? '#ff5722' : '#d32f2f';
    }
    return theme === 'dark' ? '#757575' : '#9e9e9e';
  };
  
  const getProgressText = () => {
    if (isCompleted) {
      return t('interactive_cases.completed');
    }
    if (percentage === 0) {
      return t('interactive_cases.not_started');
    }
    return `${Math.round(percentage)}%`;
  };
  
  return (
    <View style={[{
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: getProgressColor(),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 50
    }, style]}>
      {isCompleted && (
        <Icon 
          name="checkmark-circle" 
          size={12} 
          color="#fff" 
          style={{ marginRight: 4 }} 
        />
      )}
      <Text style={{
        color: '#fff',
        fontSize: 10,
        fontWeight: '600'
      }}>
        {getProgressText()}
      </Text>
    </View>
  );
};

interface SimulationCardProps {
  title: string;
  subtitle: string;
  percentage: number;
  isCompleted?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

/**
 * Simulation-Karte mit Fortschrittsanzeige
 */
export const SimulationCard: React.FC<SimulationCardProps> = ({
  title,
  subtitle,
  percentage,
  isCompleted = false,
  onPress,
  style
}) => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  
  const getCardBackgroundColor = () => {
    if (isCompleted) {
      return theme === 'dark' ? '#1b5e20' : '#e8f5e8';
    }
    if (percentage >= 50) {
      return theme === 'dark' ? '#2d2d2d' : '#f8f9fa';
    }
    return theme === 'dark' ? '#333' : '#ffffff';
  };
  
  const getBorderColor = () => {
    if (isCompleted) {
      return theme === 'dark' ? '#4caf50' : '#2e7d32';
    }
    if (percentage >= 50) {
      return theme === 'dark' ? '#555' : '#e0e0e0';
    }
    return theme === 'dark' ? '#444' : '#e0e0e0';
  };
  
  return (
    <View style={[{
      backgroundColor: getCardBackgroundColor(),
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: getBorderColor(),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    }, style]}>
      {/* Header mit Badge */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8
      }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={{
            fontSize: baseFontSize * fontSizeScale * 1.1,
            fontWeight: '600',
            color: isCompleted 
              ? (theme === 'dark' ? '#c8e6c9' : '#2e7d32')
              : (theme === 'dark' ? '#fff' : '#000'),
            marginBottom: subtitle ? 4 : 0
          }}>
            {title}
          </Text>
          {subtitle && (
            <Text style={{
              fontSize: baseFontSize * fontSizeScale * 0.9,
              color: isCompleted 
                ? (theme === 'dark' ? '#a5d6a7' : '#388e3c')
                : (theme === 'dark' ? '#ccc' : '#666'),
              lineHeight: 18
            }}>
              {subtitle}
            </Text>
          )}
        </View>
        <ProgressBadge percentage={percentage} isCompleted={isCompleted} />
      </View>
      
      {/* Fortschrittsbalken */}
      <ProgressBar 
        percentage={percentage} 
        height={4}
        color={isCompleted ? (theme === 'dark' ? '#4caf50' : '#2e7d32') : undefined}
        style={{ marginTop: 8 }}
      />
    </View>
  );
};

interface StatisticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: string;
  style?: ViewStyle;
}

/**
 * Statistik-Karte für Übersichtsseite
 */
export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  style
}) => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  
  const cardColor = color || (theme === 'dark' ? '#2196f3' : '#1976d2');
  
  return (
    <View style={[{
      backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
      borderLeftColor: cardColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        {icon && (
          <Icon 
            name={icon} 
            size={20} 
            color={cardColor} 
            style={{ marginRight: 8 }} 
          />
        )}
        <Text style={{
          fontSize: baseFontSize * fontSizeScale * 0.9,
          color: theme === 'dark' ? '#ccc' : '#666',
          fontWeight: '500'
        }}>
          {title}
        </Text>
      </View>
      <Text style={{
        fontSize: baseFontSize * fontSizeScale * 1.4,
        fontWeight: '700',
        color: cardColor,
        marginBottom: 4
      }}>
        {value}
      </Text>
      {subtitle && (
        <Text style={{
          fontSize: baseFontSize * fontSizeScale * 0.8,
          color: theme === 'dark' ? '#999' : '#777'
        }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}; 