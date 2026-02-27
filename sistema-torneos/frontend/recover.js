const fs = require('fs');
try {
    const mapPath = 'build/static/js/main.14fb721b.js.map';
    console.log('Reading map from:', mapPath);
    const mapData = fs.readFileSync(mapPath, 'utf8');
    const map = JSON.parse(mapData);
    console.log('Map parsed. Sources count:', map.sources.length);

    // Find App.js (matches "App.js" or "src/App.js")
    const appIndex = map.sources.findIndex(s => s.endsWith('App.js') && !s.includes('node_modules'));

    if (appIndex !== -1) {
        console.log('Found App.js at index:', appIndex, 'Name:', map.sources[appIndex]);
        const content = map.sourcesContent[appIndex];
        if (content) {
            fs.writeFileSync('src/App.js', content);
            console.log('Successfully recovered src/App.js (' + content.length + ' bytes)');
        } else {
            console.log('Content is null for App.js');
        }
    } else {
        console.log('App.js not found in sources. Available sources:', map.sources.filter(s => s.includes('src')));
    }
} catch (e) {
    console.error('Error:', e.message);
}
