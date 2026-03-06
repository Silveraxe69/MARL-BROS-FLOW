/**
 * CSV Parser Utility
 * Fetches and parses CSV files from the public/data folder
 */

/**
 * Parse CSV text into array of objects
 * @param {string} csvText - Raw CSV text
 * @returns {Array} Array of objects with headers as keys
 */
export const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];

  // Extract headers
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];

  // Parse each data line
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const obj = {};
    
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    
    data.push(obj);
  }

  return data;
};

/**
 * Load and parse a CSV file from public/data folder
 * @param {string} filename - Name of the CSV file (e.g., 'buses.csv')
 * @returns {Promise<Array>} Array of parsed objects
 */
export const loadCSV = async (filename) => {
  try {
    const response = await fetch(`/data/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.statusText}`);
    }
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error(`Error loading CSV file ${filename}:`, error);
    return [];
  }
};

/**
 * Load multiple CSV files in parallel
 * @param {Array<string>} filenames - Array of CSV filenames
 * @returns {Promise<Object>} Object with filenames as keys and parsed data as values
 */
export const loadMultipleCSV = async (filenames) => {
  try {
    const promises = filenames.map(filename => loadCSV(filename));
    const results = await Promise.all(promises);
    
    const data = {};
    filenames.forEach((filename, index) => {
      const key = filename.replace('.csv', '');
      data[key] = results[index];
    });
    
    return data;
  } catch (error) {
    console.error('Error loading multiple CSV files:', error);
    return {};
  }
};

export default {
  parseCSV,
  loadCSV,
  loadMultipleCSV,
};
