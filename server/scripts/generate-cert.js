const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

const attrs = [{ name: 'commonName', value: '192.168.155.163' }];
const pems = selfsigned.generate(attrs, { days: 365 });

console.log('Keys generated:', Object.keys(pems));

fs.writeFileSync(path.join(__dirname, '..', 'server.key'), pems.private || pems.privateKey);
fs.writeFileSync(path.join(__dirname, '..', 'server.cert'), pems.cert || pems.public);

console.log('Certificates generated successfully!');
