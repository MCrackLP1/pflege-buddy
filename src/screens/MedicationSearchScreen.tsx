import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, ScrollView, Alert } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { getDynamicStyles, standardSpacing } from '../utils/styleUtils';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  searchMedikamente, 
  getMedikamentDetails, 
  testDatabaseConnection,
  MedikamentFilter,
  MedikamentSort,
  getDatabaseTables,
  getTableColumns,
  getFilterOptions
} from '../services/MedikamentService';

// Filter-Optionen mit benutzerfreundlichen Labels
const FILTER_OPTIONS = [
  { key: 'anwendungsgebiet', label: 'Anwendungsgebiet' },
  { key: 'darreichungsform', label: 'Darreichungsform' },
  { key: 'atc_code', label: 'ATC-Code' },
  { key: 'nebenwirkung', label: 'Nebenwirkung' },
  { key: 'kontraindikation', label: 'Kontraindikation' },
  { key: 'wechselwirkung', label: 'Wechselwirkung' },
  { key: 'hersteller', label: 'Hersteller' },
];

// Sortieroptionen
const SORT_OPTIONS = [
  { key: 'name', label: 'Name' },
  { key: 'wirkstoff', label: 'Wirkstoff' },
  { key: 'atc_code', label: 'ATC-Code' },
];

const MedicationSearchScreen: React.FC = () => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<MedikamentFilter>({});
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMed, setSelectedMed] = useState<any | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilterKey, setActiveFilterKey] = useState<string | null>(null);
  const [filterInput, setFilterInput] = useState('');
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [dbInfo, setDbInfo] = useState<string>('');
  const [filterOptions, setFilterOptions] = useState<string[]>([]);
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(false);
  const [filterSearchQuery, setFilterSearchQuery] = useState('');
  const [filterTypeModalVisible, setFilterTypeModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // Hilfsfunktion zum Anzeigen der aktiven Filter
  const getActiveFiltersText = () => {
    const activeFilters = Object.keys(filter);
    if (activeFilters.length === 0) return "Keine Filter";
    
    return activeFilters.map(key => {
      const option = FILTER_OPTIONS.find(opt => opt.key === key);
      return option ? option.label : key;
    }).join(", ");
  };

  // Get current sort option label
  const getSortLabel = () => {
    const option = SORT_OPTIONS.find(opt => opt.key === sortBy);
    return option ? option.label : 'Name';
  };

  // Datenbankverbindung testen beim Komponenten-Mount
  useEffect(() => {
    const checkDatabase = async () => {
      setLoading(true);
      try {
        await testDatabaseConnection();
        console.log('Database connection successful');
        
        // Get database structure info
        const tables = await getDatabaseTables();
        let info = `Tables: ${tables.join(', ')}`;
        
        if (tables.includes('medikamente')) {
          const columns = await getTableColumns('medikamente');
          const columnNames = columns.map(c => c.name).join(', ');
          info += `\nMedikamente columns: ${columnNames}`;
        }
        
        setDbInfo(info);
        setDbInitialized(true);
        performSearch();
      } catch (error) {
        console.error('Database connection error:', error);
        setDbError(error instanceof Error ? error.message : 'Database connection failed');
        setDbInitialized(false);
        setLoading(false);
      }
    };
    
    checkDatabase();
  }, []);

  // When search parameters change
  useEffect(() => {
    if (dbInitialized) {
      console.log('Search parameters changed, performing search...');
      console.log('Query:', query);
      console.log('Filter:', filter);
      console.log('Sort:', sortBy, sortOrder);
      performSearch();
    }
  }, [query, filter, sortBy, sortOrder, dbInitialized]);

  const performSearch = () => {
    if (!dbInitialized) return;
    
    setLoading(true);
    
    // Zeige an, wie viele Filter aktiv sind
    const activeFilterCount = Object.keys(filter).length;
    console.log(`Performing search with ${activeFilterCount} active filters`);
    
    searchMedikamente({ 
      query, 
      filter, 
      sortBy, 
      sortOrder, 
      callback: (meds) => {
        console.log(`Search completed, found ${meds.length} results`);
        setResults(meds);
        setLoading(false);
      }
    });
  };

  const openDetail = (med: any) => {
    if (!dbInitialized) return;
    
    setLoading(true);
    getMedikamentDetails(med.id, (details) => {
      setSelectedMed(details);
      setDetailModalVisible(true);
      setLoading(false);
    });
  };

  const loadFilterOptions = (filterKey: string) => {
    if (!dbInitialized) return;
    
    setFilterOptionsLoading(true);
    setFilterOptions([]);
    
    getFilterOptions(filterKey, (options) => {
      setFilterOptions(options);
      setFilterOptionsLoading(false);
    });
  };

  const openFilterModal = (filterKey: string) => {
    setActiveFilterKey(filterKey);
    setFilterSearchQuery('');
    loadFilterOptions(filterKey);
    setFilterModalVisible(true);
  };

  const handleFilterChange = (key: string, value: string) => {
    console.log(`Filter selected: ${key} = ${value}`);
    
    // Erstelle eine Kopie des aktuellen Filters
    const newFilter = { ...filter };
    
    // Setze den Wert für den ausgewählten Filtertyp
    newFilter[key as keyof MedikamentFilter] = value;
    
    // Aktualisiere den Filter und schließe den Modal
    setFilter(newFilter);
    setFilterModalVisible(false);
    setActiveFilterKey(null);
    
    // Kein erneuter Aufruf von performSearch nötig, da der useEffect
    // durch die Änderung von filter automatisch ausgelöst wird
  };

  const clearFilter = (key: string) => {
    console.log(`Clearing filter: ${key}`);
    
    // Erstelle eine Kopie des aktuellen Filters
    const newFilter = { ...filter };
    
    // Lösche den Wert für den ausgewählten Filtertyp
    delete newFilter[key as keyof MedikamentFilter];
    
    // Aktualisiere den Filter
    setFilter(newFilter);
    
    // Kein erneuter Aufruf von performSearch nötig, da der useEffect
    // durch die Änderung von filter automatisch ausgelöst wird
  };

  // Alle Filter löschen
  const clearAllFilters = () => {
    setFilter({});
  };

  // Show database info for debugging
  const showDebugInfo = () => {
    Alert.alert('Database Info', dbInfo);
  };

  // Filter the options based on search query
  const filteredOptions = filterSearchQuery
    ? filterOptions.filter(option => 
        option.toLowerCase().includes(filterSearchQuery.toLowerCase()))
    : filterOptions;

  // Show database error message if there's an issue
  if (dbError) {
    return (
      <View style={[styles.container, { padding: standardSpacing.m, alignItems: 'center', justifyContent: 'center' }]}>
        <Icon name="alert-circle-outline" size={48} color="#e74c3c" style={{ marginBottom: 16 }} />
        <Text style={{ fontSize: 18, marginBottom: 8, textAlign: 'center' }}>Datenbank konnte nicht geladen werden</Text>
        <Text style={{ color: '#666', textAlign: 'center', marginBottom: 20 }}>{dbError}</Text>
        <TouchableOpacity 
          style={{ 
            backgroundColor: '#32b8ca', 
            paddingVertical: 12, 
            paddingHorizontal: 24, 
            borderRadius: 8,
            marginBottom: 10
          }}
          onPress={() => {
            setDbError(null);
            testDatabaseConnection()
              .then(() => {
                setDbInitialized(true);
                performSearch();
              })
              .catch(error => {
                setDbError(error instanceof Error ? error.message : 'Unknown database error');
              });
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Erneut versuchen</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={showDebugInfo}>
          <Text style={{ color: '#666', marginTop: 10 }}>Debug-Infos anzeigen</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Main UI
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}> 
      <View style={{ padding: standardSpacing.m }}>
        <TextInput
          style={[
            styles.input, 
            { 
              marginBottom: standardSpacing.s,
              borderWidth: 1.5,
              borderColor: '#32b8ca',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: baseFontSize * fontSizeScale * 1.1,
              backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fff',
              color: theme === 'dark' ? '#e1e1e1' : '#333',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              paddingLeft: 44,
            }
          ]}
          placeholder="Name, Wirkstoff, ATC-Code, Hersteller, PZN ..."
          placeholderTextColor={theme === 'dark' ? '#888' : '#aaa'}
          value={query}
          onChangeText={setQuery}
        />
        <View style={{ 
          position: 'absolute', 
          top: standardSpacing.m + 12, 
          left: standardSpacing.m + 14
        }}>
          <Icon name="search" size={24} color="#32b8ca" />
        </View>
        
        {/* Filter-Auswahl Zeile */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: standardSpacing.s }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                borderRadius: 8,
                padding: 12,
                borderWidth: 1,
                borderColor: theme === 'dark' ? '#444' : '#ddd'
              }}
              onPress={() => setFilterTypeModalVisible(true)}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme === 'dark' ? '#888' : '#555', fontSize: 12 }}>Filter</Text>
                <Text numberOfLines={1} ellipsizeMode="tail" 
                  style={{ 
                    color: theme === 'dark' ? '#e1e1e1' : '#333', 
                    fontWeight: Object.keys(filter).length > 0 ? 'bold' : 'normal' 
                  }}
                >
                  {getActiveFiltersText()}
                </Text>
              </View>
              <Icon name="chevron-down" size={22} color={theme === 'dark' ? '#888' : '#555'} />
            </TouchableOpacity>
          </View>
          
          <View style={{ flex: 1 }}>
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                borderRadius: 8,
                padding: 12,
                borderWidth: 1,
                borderColor: theme === 'dark' ? '#444' : '#ddd'
              }}
              onPress={() => setSortModalVisible(true)}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme === 'dark' ? '#888' : '#555', fontSize: 12 }}>Sortieren nach</Text>
                <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: theme === 'dark' ? '#e1e1e1' : '#333', fontWeight: 'normal' }}>
                  {getSortLabel()}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="chevron-down" size={22} color={theme === 'dark' ? '#888' : '#555'} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Aktive Filter anzeigen */}
        {Object.keys(filter).length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: standardSpacing.s }}>
            {Object.keys(filter).map(key => {
              const option = FILTER_OPTIONS.find(opt => opt.key === key);
              const value = filter[key as keyof MedikamentFilter];
              
              return (
                <View key={key} style={{ 
                  backgroundColor: '#32b8ca', 
                  borderRadius: 16, 
                  paddingHorizontal: 10, 
                  paddingVertical: 4, 
                  marginRight: 6, 
                  marginBottom: 4,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}>
                  <Text style={{ color: '#fff', fontSize: 12 }}>
                    {option?.label}: <Text style={{ fontWeight: 'bold' }}>{value}</Text>
                  </Text>
                  <TouchableOpacity onPress={() => clearFilter(key)} style={{ marginLeft: 4 }}>
                    <Icon name="close-circle" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              );
            })}
            <TouchableOpacity 
              onPress={clearAllFilters}
              style={{ 
                backgroundColor: theme === 'dark' ? '#444' : '#eee', 
                borderRadius: 16, 
                paddingHorizontal: 8, 
                paddingVertical: 4, 
                marginBottom: 4,
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <Text style={{ color: theme === 'dark' ? '#e1e1e1' : '#666', fontSize: 12 }}>Alle löschen</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#32b8ca" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id?.toString()}
          contentContainerStyle={{ padding: standardSpacing.m }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 40, color: theme === 'dark' ? '#e1e1e1' : '#333' }}>
              Keine Medikamente gefunden.
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => openDetail(item)} 
              style={[
                screenStyles.listItem,
                { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f7f7f7' }
              ]}
            >
              <Text style={[screenStyles.medName, { color: theme === 'dark' ? '#e1e1e1' : '#333' }]}>{item.name}</Text>
              <Text style={[screenStyles.medSub, { color: theme === 'dark' ? '#aaa' : '#666' }]}>{item.wirkstoff} | {item.atc_code}</Text>
              <Text style={[screenStyles.medSub, { color: theme === 'dark' ? '#aaa' : '#666' }]}>{item.hersteller}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      
      {/* Filter-Typ Modal */}
      <Modal visible={filterTypeModalVisible} transparent animationType="slide">
        <View style={screenStyles.modalBg}>
          <View style={[
            screenStyles.modalContent, 
            { 
              width: '85%',
              backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' 
            }
          ]}>
            <Text style={{ 
              fontWeight: 'bold', 
              marginBottom: 12, 
              fontSize: 16,
              color: theme === 'dark' ? '#e1e1e1' : '#333'
            }}>
              Filter auswählen
            </Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {FILTER_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={{
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: theme === 'dark' ? '#333' : '#eee',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onPress={() => {
                    setFilterTypeModalVisible(false);
                    openFilterModal(option.key);
                  }}
                >
                  <Text style={{ fontSize: 16, color: theme === 'dark' ? '#e1e1e1' : '#333' }}>{option.label}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {filter[option.key as keyof MedikamentFilter] && (
                      <View style={{ 
                        backgroundColor: '#32b8ca', 
                        borderRadius: 10,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        marginRight: 8
                      }}>
                        <Text style={{ color: '#fff', fontSize: 12 }}>Aktiv</Text>
                      </View>
                    )}
                    <Icon name="chevron-forward" size={18} color={theme === 'dark' ? '#888' : '#aaa'} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              onPress={() => setFilterTypeModalVisible(false)} 
              style={{ 
                marginTop: 16, 
                alignSelf: 'flex-end',
                padding: 8
              }}
            >
              <Text style={{ color: '#32b8ca', fontWeight: 'bold' }}>Schließen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Add Sort Options Modal */}
      <Modal visible={sortModalVisible} transparent animationType="slide">
        <View style={screenStyles.modalBg}>
          <View style={[
            screenStyles.modalContent, 
            { 
              width: '85%',
              backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' 
            }
          ]}>
            <Text style={{ 
              fontWeight: 'bold', 
              marginBottom: 12, 
              fontSize: 16,
              color: theme === 'dark' ? '#e1e1e1' : '#333'
            }}>
              Sortieren nach
            </Text>
            
            {/* Add sort order controls at the top */}
            <View style={{ 
              flexDirection: 'row', 
              marginBottom: 16, 
              paddingBottom: 12, 
              borderBottomWidth: 1, 
              borderBottomColor: theme === 'dark' ? '#333' : '#eee',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: 16, color: theme === 'dark' ? '#e1e1e1' : '#333' }}>Reihenfolge:</Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity 
                  style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    backgroundColor: sortOrder === 'ASC' ? '#32b8ca' : (theme === 'dark' ? '#2a2a2a' : '#f0f0f0'),
                    padding: 8,
                    borderRadius: 8,
                    marginRight: 8
                  }}
                  onPress={() => setSortOrder('ASC')}
                >
                  <Icon name="arrow-up" size={18} color={sortOrder === 'ASC' ? '#fff' : (theme === 'dark' ? '#e1e1e1' : '#555')} style={{ marginRight: 4 }} />
                  <Text style={{ color: sortOrder === 'ASC' ? '#fff' : (theme === 'dark' ? '#e1e1e1' : '#555') }}>Aufsteigend</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    backgroundColor: sortOrder === 'DESC' ? '#32b8ca' : (theme === 'dark' ? '#2a2a2a' : '#f0f0f0'),
                    padding: 8,
                    borderRadius: 8
                  }}
                  onPress={() => setSortOrder('DESC')}
                >
                  <Icon name="arrow-down" size={18} color={sortOrder === 'DESC' ? '#fff' : (theme === 'dark' ? '#e1e1e1' : '#555')} style={{ marginRight: 4 }} />
                  <Text style={{ color: sortOrder === 'DESC' ? '#fff' : (theme === 'dark' ? '#e1e1e1' : '#555') }}>Absteigend</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <ScrollView style={{ maxHeight: 300 }}>
              {SORT_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={{
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: theme === 'dark' ? '#333' : '#eee',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onPress={() => {
                    setSortBy(option.key);
                    setSortModalVisible(false);
                  }}
                >
                  <Text style={{ fontSize: 16, color: theme === 'dark' ? '#e1e1e1' : '#333' }}>{option.label}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {sortBy === option.key && (
                      <View style={{ 
                        backgroundColor: '#32b8ca', 
                        borderRadius: 10,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        marginRight: 8
                      }}>
                        <Text style={{ color: '#fff', fontSize: 12 }}>Aktiv</Text>
                      </View>
                    )}
                    <Icon name="chevron-forward" size={18} color={theme === 'dark' ? '#888' : '#aaa'} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              onPress={() => setSortModalVisible(false)} 
              style={{ 
                marginTop: 16, 
                alignSelf: 'flex-end',
                padding: 8
              }}
            >
              <Text style={{ color: '#32b8ca', fontWeight: 'bold' }}>Schließen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Filter-Optionen Modal */}
      <Modal visible={filterModalVisible} transparent animationType="slide">
        <View style={screenStyles.modalBg}>
          <View style={[
            screenStyles.modalContent, 
            { 
              maxHeight: '80%',
              backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff' 
            }
          ]}>
            <Text style={{ 
              fontWeight: 'bold', 
              marginBottom: 8,
              color: theme === 'dark' ? '#e1e1e1' : '#333'
            }}>
              Filter: {FILTER_OPTIONS.find(f => f.key === activeFilterKey)?.label}
            </Text>
            
            <TextInput
              style={[
                styles.input, 
                { 
                  marginBottom: 12,
                  backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fff',
                  color: theme === 'dark' ? '#e1e1e1' : '#333',
                  borderWidth: 1,
                  borderColor: theme === 'dark' ? '#444' : '#ddd',
                  borderRadius: 8,
                  padding: 10
                }
              ]}
              placeholder="In Optionen suchen..."
              placeholderTextColor={theme === 'dark' ? '#888' : '#aaa'}
              value={filterSearchQuery}
              onChangeText={setFilterSearchQuery}
              autoFocus
            />
            
            {filterOptionsLoading ? (
              <ActivityIndicator size="small" color="#32b8ca" style={{ marginVertical: 20 }} />
            ) : (
              <ScrollView style={{ maxHeight: 300 }}>
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        padding: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: theme === 'dark' ? '#333' : '#eee',
                      }}
                      onPress={() => handleFilterChange(activeFilterKey || '', option)}
                    >
                      <Text style={{ color: theme === 'dark' ? '#e1e1e1' : '#333' }}>{option}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={{ textAlign: 'center', marginTop: 20, color: theme === 'dark' ? '#888' : '#666' }}>
                    Keine Optionen gefunden
                  </Text>
                )}
              </ScrollView>
            )}
            
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
              <TouchableOpacity 
                onPress={() => setFilterModalVisible(false)} 
                style={{ 
                  marginRight: 16,
                  padding: 8 
                }}
              >
                <Text style={{ color: theme === 'dark' ? '#e1e1e1' : '#333' }}>Abbrechen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Detail Modal */}
      <Modal visible={detailModalVisible} animationType="slide">
        <ScrollView style={{ flex: 1, backgroundColor: theme === 'dark' ? '#121212' : '#fff' }}>
          <View style={{ padding: standardSpacing.l }}>
            <TouchableOpacity onPress={() => setDetailModalVisible(false)} style={{ alignSelf: 'flex-end', marginBottom: 8 }}>
              <Icon name="close" size={28} color="#32b8ca" />
            </TouchableOpacity>
            {selectedMed ? (
              <>
                <Text style={[screenStyles.detailTitle, { color: theme === 'dark' ? '#e1e1e1' : '#333' }]}>{selectedMed.name}</Text>
                <Text style={screenStyles.detailSub}>{selectedMed.wirkstoff} | {selectedMed.atc_code}</Text>
                <Text style={screenStyles.detailSub}>{selectedMed.hersteller}</Text>
                <Text style={[screenStyles.detailLabel, { color: theme === 'dark' ? '#e1e1e1' : '#333' }]}>
                  PZN: <Text style={[screenStyles.detailValue, { color: theme === 'dark' ? '#b0b0b0' : '#333' }]}>{selectedMed.pzn}</Text>
                </Text>
                <Text style={[screenStyles.detailLabel, { color: theme === 'dark' ? '#e1e1e1' : '#333' }]}>
                  Darreichungsform: <Text style={[screenStyles.detailValue, { color: theme === 'dark' ? '#b0b0b0' : '#333' }]}>{selectedMed.darreichungsform}</Text>
                </Text>
                <Text style={[screenStyles.detailLabel, { color: theme === 'dark' ? '#e1e1e1' : '#333' }]}>Anwendungsgebiete:</Text>
                {selectedMed.anwendungsgebiete?.length ? selectedMed.anwendungsgebiete.map((a: any, i: number) => (
                  <Text key={i} style={[screenStyles.detailValue, { color: theme === 'dark' ? '#b0b0b0' : '#333' }]}>- {a.gebiet}</Text>
                )) : <Text style={[screenStyles.detailValue, { color: theme === 'dark' ? '#b0b0b0' : '#333' }]}>Keine</Text>}
                <Text style={[screenStyles.detailLabel, { color: theme === 'dark' ? '#e1e1e1' : '#333' }]}>Nebenwirkungen:</Text>
                {selectedMed.nebenwirkungen?.length ? selectedMed.nebenwirkungen.map((n: any, i: number) => (
                  <Text key={i} style={[screenStyles.detailValue, { color: theme === 'dark' ? '#b0b0b0' : '#333' }]}>- {n.nebenwirkung}</Text>
                )) : <Text style={[screenStyles.detailValue, { color: theme === 'dark' ? '#b0b0b0' : '#333' }]}>Keine</Text>}
                <Text style={[screenStyles.detailLabel, { color: theme === 'dark' ? '#e1e1e1' : '#333' }]}>Kontraindikationen:</Text>
                {selectedMed.kontraindikationen?.length ? selectedMed.kontraindikationen.map((k: any, i: number) => (
                  <Text key={i} style={[screenStyles.detailValue, { color: theme === 'dark' ? '#b0b0b0' : '#333' }]}>- {k.kontraindikation}</Text>
                )) : <Text style={[screenStyles.detailValue, { color: theme === 'dark' ? '#b0b0b0' : '#333' }]}>Keine</Text>}
                {selectedMed.wechselwirkungen?.length > 0 && (
                  <>
                    <Text style={[screenStyles.detailLabel, { color: theme === 'dark' ? '#e1e1e1' : '#333' }]}>Wechselwirkungen:</Text>
                    {selectedMed.wechselwirkungen.map((w: any, i: number) => (
                      <Text key={i} style={[screenStyles.detailValue, { color: theme === 'dark' ? '#b0b0b0' : '#333' }]}>- {w.wechselwirkung}</Text>
                    ))}
                  </>
                )}
              </>
            ) : (
              <Text style={{ color: theme === 'dark' ? '#e1e1e1' : '#333' }}>Lade Details ...</Text>
            )}
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
};

const screenStyles = StyleSheet.create({
  listItem: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    elevation: 1,
  },
  medName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 2,
  },
  medSub: {
    color: '#666',
    fontSize: 14,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    elevation: 4,
  },
  detailTitle: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 4,
  },
  detailSub: {
    color: '#32b8ca',
    fontSize: 16,
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: 'bold',
    marginTop: 12,
  },
  detailValue: {
    marginLeft: 8,
    color: '#333',
  },
});

export default MedicationSearchScreen; 