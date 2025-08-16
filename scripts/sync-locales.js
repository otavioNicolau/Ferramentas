const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'src', 'locales');
const basePath = path.join(localesDir, 'en.json');
const base = JSON.parse(fs.readFileSync(basePath, 'utf8'));

fs.readdirSync(localesDir).forEach((file) => {
  if (file === 'en.json' || !file.endsWith('.json')) return;
  const localePath = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(localePath, 'utf8'));
  const result = {};
  for (const key of Object.keys(base)) {
    result[key] = Object.prototype.hasOwnProperty.call(data, key) ? data[key] : base[key];
  }
  fs.writeFileSync(localePath, JSON.stringify(result, null, 2) + '\n', 'utf8');
  console.log(`Synced ${file}`);
});
