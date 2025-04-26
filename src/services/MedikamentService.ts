import SQLite from 'react-native-sqlite-storage';
import { Platform } from 'react-native';

// Type definitions
export type MedikamentFilter = {
  anwendungsgebiet?: string;
  darreichungsform?: string;
  atc_code?: string;
  nebenwirkung?: string;
  kontraindikation?: string;
  wechselwirkung?: string;
  hersteller?: string;
};

// Updated sort options based on actual table columns
export type MedikamentSort = 'medikamentenname' | 'wirkstoff' | 'atc_code';

// Configure SQLite to output debug information
SQLite.DEBUG(true);
SQLite.enablePromise(false);

// Pre-populate database from assets folder
let db;

try {
  db = SQLite.openDatabase(
    { 
      name: 'medikamente.db', 
      createFromLocation: '~/www/medikamente.db',  // Look in the www subdirectory 
      location: 'default'
    },
    () => console.log('✅ SQLite database opened successfully'),
    error => console.error('❌ Error opening database:', error)
  );
} catch (error) {
  console.error('Exception in database initialization:', error);
}

// Get database tables
export function getDatabaseTables() {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    db.transaction(tx => {
      tx.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table'",
        [],
        (_, results) => {
          if (results && results.rows) {
            const tables = [];
            for (let i = 0; i < results.rows.length; i++) {
              tables.push(results.rows.item(i).name);
            }
            console.log('Database tables:', tables);
            resolve(tables);
          } else {
            reject(new Error('No tables found'));
          }
        },
        (_, error) => {
          console.error('Error getting tables:', error);
          reject(error);
          return true;
        }
      );
    });
  });
}

// Get table structure
export function getTableColumns(tableName) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    db.transaction(tx => {
      tx.executeSql(
        `PRAGMA table_info(${tableName})`,
        [],
        (_, results) => {
          if (results && results.rows) {
            const columns = [];
            for (let i = 0; i < results.rows.length; i++) {
              columns.push(results.rows.item(i));
            }
            console.log(`Columns in ${tableName}:`, columns);
            resolve(columns);
          } else {
            reject(new Error(`No columns found in ${tableName}`));
          }
        },
        (_, error) => {
          console.error(`Error getting columns for ${tableName}:`, error);
          reject(error);
          return true;
        }
      );
    });
  });
}

// Simple database connection test
export function testDatabaseConnection() {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    db.transaction(tx => {
      tx.executeSql(
        'SELECT 1 AS test',
        [],
        (_, results) => {
          if (results && results.rows && results.rows.length > 0) {
            console.log('✅ Database test query successful');
            
            // After successful connection, inspect database structure
            getDatabaseTables()
              .then(tables => {
                // Check columns of the medikamente table if it exists
                if (tables.includes('medikamente')) {
                  return getTableColumns('medikamente');
                }
                return [];
              })
              .then(() => resolve(true))
              .catch(error => {
                console.warn('Database structure check failed:', error);
                resolve(true); // Still resolve as connection is successful
              });
          } else {
            console.error('❌ Database test query failed to return results');
            reject(new Error('Database test query failed'));
          }
        },
        (_, error) => {
          console.error('❌ Database test query error:', error);
          reject(error);
          return true; // Roll back transaction
        }
      );
    }, error => {
      console.error('❌ Database transaction error:', error);
      reject(error);
    });
  });
}

// Map the sortBy values to actual column names
function mapSortByToColumn(sortBy) {
  const mapping = {
    'name': 'medikamentenname',
    'wirkstoff': 'wirkstoff',
    'atc_code': 'atc_code'
  };
  
  return mapping[sortBy] || 'medikamentenname';
}

// Search medications
export function searchMedikamente({
  query = '',
  filter = {},
  sortBy = 'name',
  sortOrder = 'ASC',
  callback,
}) {
  if (!db) {
    console.error('Cannot search: Database not initialized');
    callback([]);
    return;
  }

  // Use the correct column names for the actual database schema
  const mappedSortBy = mapSortByToColumn(sortBy);
  
  // Basis-SQL mit Tabellen und Basis-Joins
  let sql = 'SELECT DISTINCT m.* FROM medikamente m';
  let joins = [];
  let conditions = [];
  let params = [];
  
  // Suchbegriff für Medikamenten-Attribute
  if (query) {
    conditions.push('(m.medikamentenname LIKE ? OR m.wirkstoff LIKE ? OR m.atc_code LIKE ? OR m.hersteller LIKE ? OR m.pzn LIKE ?)');
    params.push(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`);
  }
  
  // Filter anwenden
  if (filter.anwendungsgebiet) {
    joins.push('LEFT JOIN anwendungsgebiete ag ON m.id = ag.medikament_id');
    conditions.push('ag.gebiet LIKE ?');
    params.push(`%${filter.anwendungsgebiet}%`);
  }
  
  if (filter.darreichungsform) {
    conditions.push('m.darreichungsform LIKE ?');
    params.push(`%${filter.darreichungsform}%`);
  }
  
  if (filter.atc_code) {
    conditions.push('m.atc_code LIKE ?');
    params.push(`%${filter.atc_code}%`);
  }
  
  if (filter.nebenwirkung) {
    joins.push('LEFT JOIN nebenwirkungen nw ON m.id = nw.medikament_id');
    conditions.push('nw.nebenwirkung LIKE ?');
    params.push(`%${filter.nebenwirkung}%`);
  }
  
  if (filter.kontraindikation) {
    joins.push('LEFT JOIN kontraindikationen ki ON m.id = ki.medikament_id');
    conditions.push('ki.kontraindikation LIKE ?');
    params.push(`%${filter.kontraindikation}%`);
  }
  
  if (filter.hersteller) {
    conditions.push('m.hersteller LIKE ?');
    params.push(`%${filter.hersteller}%`);
  }
  
  if (filter.wechselwirkung) {
    joins.push('LEFT JOIN wechselwirkungen ww ON m.id = ww.medikament_id');
    conditions.push('ww.wechselwirkung LIKE ?');
    params.push(`%${filter.wechselwirkung}%`);
  }
  
  // Joins hinzufügen, wenn welche vorhanden sind
  if (joins.length > 0) {
    sql += ' ' + joins.join(' ');
  }
  
  // Bedingungen hinzufügen, wenn welche vorhanden sind
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  
  // Sortierung hinzufügen
  sql += ` ORDER BY ${mappedSortBy} ${sortOrder}`;
  
  console.log('Executing SQL:', sql);
  console.log('With params:', params);
  console.log('Applied filters:', filter);
  
  // Execute the query
  db.transaction(tx => {
    tx.executeSql(
      sql,
      params,
      (_, results) => {
        let meds = [];
        if (results && results.rows) {
          for (let i = 0; i < results.rows.length; i++) {
            // Map column names to the expected properties in the UI
            const item = results.rows.item(i);
            meds.push({
              id: item.id,
              name: item.medikamentenname, // Map to expected property name
              wirkstoff: item.wirkstoff,
              atc_code: item.atc_code,
              hersteller: item.hersteller,
              pzn: item.pzn,
              darreichungsform: item.darreichungsform
            });
          }
        }
        console.log(`Found ${meds.length} medications`);
        callback(meds);
      },
      (_, error) => {
        console.error('Search query error:', error);
        if (error && error.message) {
          console.error('Error message:', error.message);
          
          // Versuche einen Fallback, falls die SQL-Abfrage fehlschlägt
          console.log('Attempting fallback query without filters...');
          tx.executeSql(
            'SELECT * FROM medikamente ORDER BY medikamentenname',
            [],
            (_, fallbackResults) => {
              let fallbackMeds = [];
              if (fallbackResults && fallbackResults.rows) {
                for (let i = 0; i < fallbackResults.rows.length; i++) {
                  const item = fallbackResults.rows.item(i);
                  fallbackMeds.push({
                    id: item.id,
                    name: item.medikamentenname,
                    wirkstoff: item.wirkstoff,
                    atc_code: item.atc_code,
                    hersteller: item.hersteller,
                    pzn: item.pzn,
                    darreichungsform: item.darreichungsform
                  });
                }
              }
              console.log(`Fallback found ${fallbackMeds.length} medications`);
              callback(fallbackMeds);
            },
            (_, fallbackError) => {
              console.error('Fallback query error:', fallbackError);
              callback([]);
              return true;
            }
          );
        } else {
          callback([]);
        }
        return true;
      }
    );
  }, error => {
    console.error('Transaction error:', error);
    callback([]);
  });
}

// Get medication details with related information
export function getMedikamentDetails(medikamentId, callback) {
  if (!db) {
    console.error('Cannot get details: Database not initialized');
    callback(null);
    return;
  }
  
  db.transaction(tx => {
    // Get the basic medication details
    tx.executeSql(
      `SELECT * FROM medikamente WHERE id = ?`,
      [medikamentId],
      (_, results) => {
        if (results && results.rows && results.rows.length > 0) {
          const item = results.rows.item(0);
          
          // Map to expected property names
          const med = {
            id: item.id,
            name: item.medikamentenname,
            wirkstoff: item.wirkstoff,
            atc_code: item.atc_code,
            hersteller: item.hersteller,
            pzn: item.pzn,
            darreichungsform: item.darreichungsform,
            stärke: item.stärke,
            dosierung: item.dosierung,
            pharmakokinetik: item.pharmakokinetik,
            lagerung: item.lagerung,
            anwendungshinweise: item.anwendungshinweise,
            besonderheiten: item.besonderheiten,
            schwangerschaft_stillzeit: item.schwangerschaft_stillzeit,
            monitoring: item.monitoring,
            weitere_hinweise: item.weitere_hinweise
          };
          
          // Get related information
          Promise.all([
            new Promise(resolve => {
              tx.executeSql(
                'SELECT gebiet FROM anwendungsgebiete WHERE medikament_id = ?', 
                [medikamentId], 
                (_, r) => {
                  const results = [];
                  for (let i = 0; i < r.rows.length; i++) {
                    results.push({ gebiet: r.rows.item(i).gebiet });
                  }
                  resolve(results);
                },
                (_, err) => { 
                  console.error('Error fetching anwendungsgebiete:', err); 
                  resolve([]); 
                  return true; 
                }
              );
            }),
            new Promise(resolve => {
              tx.executeSql(
                'SELECT nebenwirkung FROM nebenwirkungen WHERE medikament_id = ?', 
                [medikamentId], 
                (_, r) => {
                  const results = [];
                  for (let i = 0; i < r.rows.length; i++) {
                    results.push({ nebenwirkung: r.rows.item(i).nebenwirkung });
                  }
                  resolve(results);
                },
                (_, err) => { 
                  console.error('Error fetching nebenwirkungen:', err); 
                  resolve([]); 
                  return true; 
                }
              );
            }),
            new Promise(resolve => {
              tx.executeSql(
                'SELECT kontraindikation FROM kontraindikationen WHERE medikament_id = ?', 
                [medikamentId], 
                (_, r) => {
                  const results = [];
                  for (let i = 0; i < r.rows.length; i++) {
                    results.push({ kontraindikation: r.rows.item(i).kontraindikation });
                  }
                  resolve(results);
                },
                (_, err) => { 
                  console.error('Error fetching kontraindikationen:', err); 
                  resolve([]); 
                  return true; 
                }
              );
            })
          ])
          .then(([anwendungsgebiete, nebenwirkungen, kontraindikationen]) => {
            callback({
              ...med,
              anwendungsgebiete,
              nebenwirkungen,
              kontraindikationen
            });
          })
          .catch(error => {
            console.error('Error fetching related data:', error);
            callback(med); // Return at least the basic medication data
          });
        } else {
          callback(null);
        }
      },
      (_, error) => {
        console.error('Error getting medication details:', error);
        callback(null);
        return true;
      }
    );
  }, error => {
    console.error('Transaction error:', error);
    callback(null);
  });
}

// Funktion zum Laden verfügbarer Filterwerte
export function getFilterOptions(filterType: string, callback: (options: string[]) => void) {
  if (!db) {
    console.error('Cannot load filter options: Database not initialized');
    callback([]);
    return;
  }

  let sql = '';
  let params: any[] = [];

  // Je nach Filtertyp die passende Abfrage erstellen
  switch (filterType) {
    case 'anwendungsgebiet':
      sql = 'SELECT DISTINCT gebiet FROM anwendungsgebiete ORDER BY gebiet';
      break;
    case 'darreichungsform':
      sql = 'SELECT DISTINCT darreichungsform FROM medikamente WHERE darreichungsform IS NOT NULL ORDER BY darreichungsform';
      break;
    case 'atc_code':
      sql = 'SELECT DISTINCT atc_code FROM medikamente WHERE atc_code IS NOT NULL ORDER BY atc_code';
      break;
    case 'nebenwirkung':
      sql = 'SELECT DISTINCT nebenwirkung FROM nebenwirkungen ORDER BY nebenwirkung';
      break;
    case 'kontraindikation':
      sql = 'SELECT DISTINCT kontraindikation FROM kontraindikationen ORDER BY kontraindikation';
      break;
    case 'hersteller':
      sql = 'SELECT DISTINCT hersteller FROM medikamente WHERE hersteller IS NOT NULL ORDER BY hersteller';
      break;
    default:
      callback([]);
      return;
  }

  // Abfrage ausführen
  db.transaction(tx => {
    tx.executeSql(
      sql,
      params,
      (_, results) => {
        let options: string[] = [];
        if (results && results.rows) {
          for (let i = 0; i < results.rows.length; i++) {
            const item = results.rows.item(i);
            // Den Wert aus der ersten Spalte nehmen, unabhängig vom Namen
            const value = item[Object.keys(item)[0]];
            if (value && typeof value === 'string' && value.trim() !== '') {
              options.push(value);
            }
          }
        }
        console.log(`Loaded ${options.length} options for ${filterType}`);
        callback(options);
      },
      (_, error) => {
        console.error(`Error loading filter options for ${filterType}:`, error);
        callback([]);
        return true;
      }
    );
  }, error => {
    console.error('Transaction error:', error);
    callback([]);
  });
} 