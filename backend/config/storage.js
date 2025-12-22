// Cloudflare R2 Storage Configuration
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// Initialize Cloudflare R2 client (compatible S3 API)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; // e.g., https://pub-xxxxx.r2.dev

/**
 * Upload file to Cloudflare R2
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} fileName - File name with path
 * @param {String} contentType - MIME type
 * @returns {Promise<String>} Public URL of uploaded file
 */
const uploadToR2 = async (fileBuffer, fileName, contentType) => {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await r2Client.send(command);

    // Return public URL
    return `${R2_PUBLIC_URL}/${fileName}`;
  } catch (error) {
    console.error('R2 Upload Error:', error);
    throw new Error('Failed to upload file to R2');
  }
};

/**
 * Get file from Cloudflare R2
 * @param {String} fileName - File name with path
 * @returns {Promise<Buffer>} File buffer
 */
const getFromR2 = async (fileName) => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    const response = await r2Client.send(command);
    const chunks = [];
    
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    
    return Buffer.concat(chunks);
  } catch (error) {
    console.error('R2 Get Error:', error);
    throw new Error('Failed to get file from R2');
  }
};

/**
 * Delete file from Cloudflare R2
 * @param {String} fileName - File name with path
 * @returns {Promise<void>}
 */
const deleteFromR2 = async (fileName) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    await r2Client.send(command);
  } catch (error) {
    console.error('R2 Delete Error:', error);
    throw new Error('Failed to delete file from R2');
  }
};

module.exports = {
  uploadToR2,
  getFromR2,
  deleteFromR2,
  r2Client
};

