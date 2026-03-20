const fs = require('fs');
let code = fs.readFileSync('SafeRouteDemo.jsx', 'utf8');
code = code.replace(/\\`/g, '`');
code = code.replace(/\\\$/g, '$');
fs.writeFileSync('SafeRouteDemo.jsx', code);
