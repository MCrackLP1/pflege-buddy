import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface PickerItem {
  id: string;
  label: string;
  icon?: string; // optionales Icon
  description?: string; // optionale Beschreibung
}

interface CustomModalPickerProps {
  label: string;
  items: PickerItem[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  theme: 'light' | 'dark';
  fontSize: number;
}

const CustomModalPicker: React.FC<CustomModalPickerProps> = ({
  label,
  items,
  selectedValue,
  onValueChange,
  theme,
  fontSize,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const isDark = theme === 'dark';
  const styles = getStyles(fontSize, isDark);

  // Die Akzentfarbe ist in der gesamten App konsistent (blau)
  const accentColor = '#32b8ca';

  const selectedItem = items.find(i => i.id === selectedValue);
  const selectedLabel = selectedItem?.label || '';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {selectedItem?.icon && (
            <Icon name={selectedItem.icon} size={20} color={accentColor} style={{ marginRight: 8 }} />
          )}
          <Text style={[styles.inputText, !selectedLabel && styles.placeholder]}>
            {selectedLabel || 'Bitte auswählen...'}
          </Text>
        </View>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label}</Text>
            <FlatList
              data={items}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.id === selectedValue && styles.selectedOption,
                  ]}
                  onPress={() => {
                    onValueChange(item.id);
                    setModalVisible(false);
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {item.icon && (
                      <Icon name={item.icon} size={22} color={item.id === selectedValue ? accentColor : (isDark ? '#e1e1e1' : '#222')} style={{ marginRight: 10 }} />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.optionText,
                          item.id === selectedValue && styles.selectedOptionText,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {item.description && (
                        <Text style={styles.optionDescription}>{item.description}</Text>
                      )}
                    </View>
                    {item.id === selectedValue && (
                      <Icon name="checkmark" size={22} color={accentColor} style={{ marginLeft: 8 }} />
                    )}
                  </View>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              style={{ maxHeight: 320 }}
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Abbrechen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (fontSize: number, isDark: boolean) => {
  const { width, height } = Dimensions.get('window');
  const accentColor = '#32b8ca';
  
  return StyleSheet.create({
    container: {
      marginBottom: 12,
    },
    label: {
      marginBottom: 4,
      color: isDark ? '#e1e1e1' : '#333',
      fontSize: fontSize * 1.05,
      fontWeight: '500',
    },
    input: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? '#444' : '#ccc',
      backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
      paddingVertical: Platform.OS === 'ios' ? 14 : 8,
      paddingHorizontal: 12,
      minHeight: 44,
      justifyContent: 'center',
    },
    inputText: {
      color: isDark ? '#fff' : '#222',
      fontSize,
    },
    placeholder: {
      color: isDark ? '#888' : '#aaa',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: width * 0.85,
      backgroundColor: isDark ? '#1e1e1e' : '#fff',
      borderRadius: 12,
      padding: 20,
      maxHeight: height * 0.7,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalTitle: {
      fontSize: fontSize * 1.15,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#222',
      marginBottom: 16,
      textAlign: 'center',
    },
    option: {
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 6,
    },
    selectedOption: {
      backgroundColor: isDark ? '#333' : '#e0e0e0',
    },
    optionText: {
      fontSize,
      color: isDark ? '#e1e1e1' : '#222',
    },
    selectedOptionText: {
      fontWeight: 'bold',
      color: accentColor,
    },
    optionDescription: {
      fontSize: fontSize * 0.85,
      color: isDark ? '#b0b0b0' : '#666',
      marginTop: 2,
    },
    separator: {
      height: 1,
      backgroundColor: isDark ? '#333' : '#eee',
    },
    cancelButton: {
      marginTop: 18,
      alignSelf: 'center',
      paddingVertical: 10,
      paddingHorizontal: 24,
      borderRadius: 6,
      backgroundColor: isDark ? '#333' : '#eee',
    },
    cancelButtonText: {
      color: isDark ? '#fff' : '#222',
      fontSize: fontSize * 1.05,
      fontWeight: '500',
    },
  });
};

export default CustomModalPicker; 