/**
 * WoundAssessmentScreen.tsx
 * Bildschirm zur Beurteilung und Dokumentation von Wunden
 */

import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import Components
import PageHeader from '../components/PageHeader';
import WoundAssessment from '../components/WoundAssessment';

// Import Hooks
import { useSettings } from '../context/SettingsContext';
import { getDynamicStyles } from '../utils/styleUtils';

const WoundAssessmentScreen: React.FC = () => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <PageHeader 
        title="Wundbeurteilung" 
        subtitle="Systematische Beurteilung von Wunden"
        showBackButton={true}
      />
      <WoundAssessment />
    </View>
  );
};

export default WoundAssessmentScreen; 