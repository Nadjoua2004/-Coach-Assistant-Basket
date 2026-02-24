const https = require('https');

const accountId = '49bb7052e47b644d42978754cc7977d7';
const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

console.log('Testing connection to:', endpoint);

const req = https.request(endpoint, {
    method: 'GET',
}, (res) => {
    console.log('StatusCode:', res.statusCode);
    console.log('Headers:', res.headers);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (e) => {
    console.error('HTTPS Request Error:', e);
});

req.end();
