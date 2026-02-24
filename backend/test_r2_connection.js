require('dotenv').config();
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

const client = new S3Client({
    region: 'us-east-1',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

async function run() {
    try {
        console.log('--- R2 CONFIGURATION TEST ---');
        console.log(`Endpoint: ${process.env.R2_ENDPOINT}`);
        console.log(`Account ID: ${process.env.R2_ACCOUNT_ID}`);
        console.log(`Access Key ID: ${process.env.R2_ACCESS_KEY_ID ? '***' + process.env.R2_ACCESS_KEY_ID.slice(-4) : 'MISSING'}`);
        console.log(`Bucket: ${process.env.R2_BUCKET_NAME}`);
        console.log('-----------------------------');

        console.log('Attempting to list buckets...');
        const command = new ListBucketsCommand({});
        const data = await client.send(command);
        console.log('✅ Connection Successful!');
        console.log('Buckets found:', data.Buckets.map(b => b.Name));
    } catch (err) {
        console.error('❌ Connection Failed!');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        if (err.code) console.error('Error Code:', err.code);
    }
}

run();
