const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
code = code.replace(/change=\{prices\?\.([a-z]+)\?\.change\}/g, "change={prices?.$1?.change}\n            direction={prices?.$1?.direction}");
fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log('done');
