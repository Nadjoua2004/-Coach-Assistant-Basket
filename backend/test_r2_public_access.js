require('dotenv').config();
const https = require('https');
const { uploadToR2 } = require('./config/storage');

async function debugPublicAccess() {
    console.log('--- R2 PUBLIC ACCESS DIAGNOSTIC ---');
    console.log(`Bucket Name: ${process.env.R2_BUCKET_NAME}`);
    console.log(`Public URL Base: ${process.env.R2_PUBLIC_URL}`);

    const testContent = `Diagnostic test at ${new Date().toISOString()}`;
    const testFileName = `diagnostic/test-${Date.now()}.txt`;

    try {
        console.log(`\n1. Uploading test file: ${testFileName}...`);
        const publicUrl = await uploadToR2(Buffer.from(testContent), testFileName, 'text/plain');
        console.log(`✅ Upload successful!`);
        console.log(`🔗 Generated URL: ${publicUrl}`);

        console.log(`\n2. Attempting to fetch file via public URL...`);

        https.get(publicUrl, (res) => {
            console.log(`Status Code: ${res.statusCode}`);
            console.log(`Status Message: ${res.statusMessage}`);

            if (res.statusCode === 200) {
                console.log('✅ Success! File is publicly accessible.');
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => console.log('Response content:', data));
            } else {
                console.error(`❌ Fetch Failed! Status: ${res.statusCode}`);
                if (res.statusCode === 404) {
                    console.log('\n💡 SUGGESTION: "Object not found" usually means:');
                    console.log('   a) The R2.dev subdomain is NOT enabled in Cloudflare settings for this bucket.');
                    console.log('   b) There is a typo in R2_PUBLIC_URL in your .env file.');
                }
            }
        }).on('error', (err) => {
            console.error('❌ Error:', err.message);
        });
    } catch (uploadError) {
        console.error('❌ Upload Failed!');
        console.error(uploadError.message);
    }
}

debugPublicAccess();
