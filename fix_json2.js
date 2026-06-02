const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'locales', 'en');

function capitalize(s) {
    if (typeof s !== 'string') return s;
    return s.charAt(0).toUpperCase() + s.slice(1).replace(/([A-Z])/g, ' $1').trim();
}

function processObj(obj) {
    for (const key in obj) {
        if (typeof obj[key] === 'object') {
            processObj(obj[key]);
        } else if (obj[key] === '__NOT_TRANSLATED__') {
            obj[key] = capitalize(key);
        }
    }
}

fs.readdirSync(enPath).forEach(file => {
    if (file.endsWith('.json')) {
        const filePath = path.join(enPath, file);
        let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        processObj(data);
        
        // Manual overrides for known weird ones
        if (file === 'sidebar.json') {
            if (data.home) data.home = 'Home';
            if (data.logout) data.logout = 'Logout';
        }
        if (file === 'analytics.json') {
            if (data.disconnect) data.disconnect = 'Disconnect';
            if (data.confirmDisconnect) data.confirmDisconnect = 'Disconnect Google Calendar?';
            if (data.resync) data.resync = 'Resync';
        }
        if (file === 'dashboard.json') {
            if (data.error_500) data.error_500 = '500 - Server Error';
            if (data.load_error) data.load_error = 'Failed to load dashboard.';
        }
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
});
console.log('Fixed all __NOT_TRANSLATED__ keys');
