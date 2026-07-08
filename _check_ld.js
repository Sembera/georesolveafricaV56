const fs = require('fs');
const files = [
  'dist/drone-magnetic-survey-uganda.html',
  'dist/insar-sar-services-uganda.html'
];
for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m, n = 0;
  while ((m = re.exec(h))) {
    JSON.parse(m[1]);
    n++;
  }
  console.log(f, 'valid JSON-LD blocks:', n);
}
console.log('ALL JSON-LD VALID');
