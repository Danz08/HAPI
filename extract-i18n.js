const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'client/modules/i18n.js'), 'utf-8');
const match = content.match(/export const translations = ({[\s\S]*?});\n\nlet/);

if (!match) {
  console.error("Could not parse translations");
  process.exit(1);
}

// Evaluate the object (unsafe in general, but safe here)
const translations = eval('(' + match[1] + ')');

const localesDir = path.join(__dirname, 'locales');
if (!fs.existsSync(localesDir)) fs.mkdirSync(localesDir);

['id', 'en'].forEach(lang => {
  const langDir = path.join(localesDir, lang);
  if (!fs.existsSync(langDir)) fs.mkdirSync(langDir);
  
  const strings = translations[lang];
  const namespaces = {};
  
  for (const [key, value] of Object.entries(strings)) {
    let [namespace, ...rest] = key.split('.');
    
    // Custom mapping for some prefixes to fit the user's requested namespaces
    if (namespace === 'nav' || namespace === 'general' || namespace === 'btn' || namespace === 'page' || namespace === 'breakdown') namespace = 'common';
    if (namespace === 'pomo') namespace = 'pomodoro';
    if (namespace === 'form') namespace = 'dashboard';
    if (namespace === 'chat') namespace = 'chatbot';
    
    if (!namespaces[namespace]) namespaces[namespace] = {};
    
    // Reconstruct the nested object
    let current = namespaces[namespace];
    for (let i = 0; i < rest.length - 1; i++) {
      if (!current[rest[i]]) current[rest[i]] = {};
      current = current[rest[i]];
    }
    const finalKey = rest.length > 0 ? rest[rest.length - 1] : key;
    current[finalKey] = value;
  }
  
  for (const [ns, obj] of Object.entries(namespaces)) {
    fs.writeFileSync(path.join(langDir, `${ns}.json`), JSON.stringify(obj, null, 2));
  }
});

console.log("Extraction complete!");
