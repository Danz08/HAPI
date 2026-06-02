const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ejs')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace data-i18n="xxx" with <%= t('xxx') %> 
      // <element data-i18n="key">Text</element> -> <element>Text</element>
      let modified = content;
      
      // Basic text replacement: <span data-i18n="key">Text</span> -> <span>Text</span>
      modified = modified.replace(/<([^>\s]+)([^>]*)data-i18n="([^"]+)"([^>]*)>([^<]*)<\/\1>/g, (match, tag, beforeArgs, key, afterArgs, text) => {
          let innerText = text.trim();
          if (innerText) {
            // Escape single quotes in text for default value
            innerText = innerText.replace(/'/g, "\\'");
            return `<${tag}${beforeArgs}${afterArgs}>${innerText}</${tag}>`;
          } else {
            return `<${tag}${beforeArgs}${afterArgs}><%= t('${key}') %></${tag}>`;
          }
      });
      
      // Also for empty tags like <span data-i18n="key" /> ?? No, typically EJS doesn't use empty span
      
      // Replace data-i18n-placeholder="key"
      modified = modified.replace(/data-i18n-placeholder="([^"]+)"/g, (match, key) => {
         // the script must replace the placeholder attribute as well, wait, what if it's already there?
         return `placeholder="<%= t('${key}') %>"`;
      });
      // Replace data-i18n-title="key"
      modified = modified.replace(/data-i18n-title="([^"]+)"/g, (match, key) => {
         return `title="<%= t('${key}') %>"`;
      });

      // Remove duplicate placeholders or titles if they exist
      modified = modified.replace(/placeholder="[^"]*"\s+placeholder="/g, 'placeholder="');
      modified = modified.replace(/title="[^"]*"\s+title="/g, 'title="');

      if (content !== modified) {
        fs.writeFileSync(fullPath, modified, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

const viewsDir = path.join(__dirname, 'views');
processDir(viewsDir);
console.log('EJS refactoring complete!');
