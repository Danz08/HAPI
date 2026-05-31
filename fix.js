const fs = require('fs');
let data = fs.readFileSync('src/utils/recommendations.js', 'utf8');
data = data.replace(/title: '.*Waspada Kelelahan',/, "title: '⚠️ Waspada Kelelahan',");
data = data.replace(/title: '.*Jangan Ragu Bercerita',/, "title: '🗣️ Jangan Ragu Bercerita',");
fs.writeFileSync('src/utils/recommendations.js', data);
console.log('Fixed');
