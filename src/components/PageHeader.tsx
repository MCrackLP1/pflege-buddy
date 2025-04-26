/**
 * PageHeader.tsx
 * Einheitlicher Header für alle Seiten
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

// Import Hooks
import { useSettings } from '../context/SettingsContext';

// Import Style-Utilities
import { getDynamicStyles } from '../utils/styleUtils';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  withBackground?: boolean;
  showBackButton?: boolean;
};

/**
 * Einheitlicher Header für alle Seiten der App
 * @param props Component properties
 * @returns JSX.Element
 */
const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle,
  withBackground = true,
  showBackButton = false
}) => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[
      styles.headerContainer, 
      { 
        paddingTop: Math.max(insets.top + 10, 20),
        backgroundColor: withBackground ? (theme === 'dark' ? '#1e1e1e' : '#ffffff') : 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
      }
    ]}>
      {showBackButton && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12, padding: 4 }}>
          <Icon name="arrow-back" size={26} color={theme === 'dark' ? '#e1e1e1' : '#333'} />
        </TouchableOpacity>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

export default PageHeader; 