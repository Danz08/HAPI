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

      // Replace data-i18n="key" with <%= t('key') %>
      // Example: <span data-i18n="dashboard.greeting">Selamat datang</span>
      // To: <span><%= t('dashboard.greeting') %></span>
      content = content.replace(/<([^>]+)\sdata-i18n="([^"]+)"([^>]*)>([^<]*)<\/\1>/g, '<$1$3><%= t(\'$2\') %></$1>');
      
      // Sometimes it's just data-i18n="key" on an element with children or other things, regex above might fail if nested tags.
      // Better approach: Just replace data-i18n attributes. But we want to replace the TEXT inside it too.
      
      // Let's just do it manually in the code via multi_replace_file_content or write a better regex.
      // Actually, since there are hardcoded text that DOES NOT have data-i18n, the regex won't catch everything.
    }
  }
}

// Just output to console to see what we have
console.log("Use manual replace to be safe and accurate.");
