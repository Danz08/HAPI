const fs = require('fs');
let data = fs.readFileSync('src/utils/recommendations.js', 'utf8');

data = data.replace(/âš ï¸ /g, '⚠️');
data = data.replace(/ðŸ—£ï¸ /g, '🗣️');
data = data.replace(/âœ¨/g, '✨');
data = data.replace(/ðŸŽ¯/g, '🎯');
data = data.replace(/ðŸ’ª/g, '💪');
data = data.replace(/ðŸ§˜/g, '🧘');
data = data.replace(/ðŸ“‹/g, '📋');
data = data.replace(/ðŸš¨/g, '🚨');
data = data.replace(/ðŸ’¤/g, '💤');
data = data.replace(/ðŸ˜Š/g, '😊');

fs.writeFileSync('src/utils/recommendations.js', data);
console.log("Done");
