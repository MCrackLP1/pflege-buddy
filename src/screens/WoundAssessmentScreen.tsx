/**
 * WoundAssessmentScreen.tsx
 * Bildschirm zur Beurteilung und Dokumentation von Wunden
 */

import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <PageHeader
        title={t('wound_assessment.title')}
        subtitle={t('wound_assessment.subtitle')}
        showBackButton={true}
      />
      <WoundAssessment />
    </View>
  );
};

export default WoundAssessmentScreen;
