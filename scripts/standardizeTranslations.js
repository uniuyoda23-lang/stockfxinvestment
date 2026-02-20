import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');
const EN_FILE = path.join(LOCALES_DIR, 'en.json');

// Read reference files (complete translations)
const enData = JSON.parse(fs.readFileSync(EN_FILE, 'utf8'));
const esData = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, 'es.json'), 'utf8'));
const frData = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, 'fr.json'), 'utf8'));
const deData = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, 'de.json'), 'utf8'));

// Function to find missing keys by comparing structures
function getMissingKeys(obj, template, prefix = '') {
  const missing = [];
  
  function traverse(curr, temp, path) {
    for (const key in temp) {
      const newPath = path ? `${path}.${key}` : key;
      
      if (typeof temp[key] === 'object' && !Array.isArray(temp[key])) {
        if (!curr[key]) {
          curr[key] = {};
        }
        traverse(curr[key], temp[key], newPath);
      } else {
        if (!curr[key]) {
          missing.push(newPath);
          curr[key] = temp[key]; // Use English as fallback
        }
      }
    }
  }
  
  traverse(obj, template);
  return missing;
}

// Apply structure from template to incomplete files
console.log('📚 Standardizing translation file structures...\n');

const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json') && f !== 'en.json');
let totalFixed = 0;

files.forEach(file => {
  const langCode = file.replace('.json', '');
  const filePath = path.join(LOCALES_DIR, file);
  
  try {
    const langData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const missing = getMissingKeys(langData, enData);
    
    if (missing.length > 0) {
      // Write back the completed structure
      fs.writeFileSync(filePath, JSON.stringify(langData, null, 2), 'utf8');
      console.log(`✅ ${langCode.padEnd(12)} - Added ${missing.length} missing keys (now using English fallback)`);
      totalFixed++;
    }
  } catch (err) {
    // Skip unparseable files
  }
});

console.log(`\n✨ Fixed ${totalFixed} translation files with proper structure!`);
console.log('💡 Note: Missing keys now fallback to English. These can be professionally translated later.\n');

export { getMissingKeys };
