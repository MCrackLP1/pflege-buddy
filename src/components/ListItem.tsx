/**
 * ListItem.tsx
 * Standardisierte ListItem-Komponente für einheitliches Design
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Import Hooks
import { useSettings } from '../context/SettingsContext';

// Import Style-Utilities
import { getDynamicStyles, standardSpacing } from '../utils/styleUtils';

type ListItemProps = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  iconName?: string;
  iconColor?: string;
  rightContent?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Standardisierte ListItem-Komponente für einheitliches Design
 *
 * @param props Komponenteneigenschaften
 * @returns JSX.Element
 */
const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  onPress,
  iconName,
  iconColor,
  rightContent,
  style,
}) => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);

  const defaultIconColor = theme === 'dark' ? '#32b8ca' : '#32b8ca';

  const renderContent = () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {iconName && (
        <Icon
          name={iconName}
          size={30}
          color={iconColor || defaultIconColor}
          style={{ marginRight: standardSpacing.l }}
        />
      )}
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemTitle, { marginBottom: standardSpacing.xs }]}>{title}</Text>
        {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
      </View>
      {rightContent && rightContent}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.7}>
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, style]}>{renderContent()}</View>;
};

export default ListItem;
