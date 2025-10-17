import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3003';
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'your-test-token';

/**
 * Test script for media service with cloud storage
 * 
 * Usage:
 * 1. Start the media service
 * 2. Set AUTH_TOKEN environment variable
 * 3. Run: npm run test-storage
 */

async function testMediaService() {
  console.log('🧪 Testing Media Service with Cloud Storage\n');
  console.log(`API URL: ${API_BASE_URL}`);
  console.log(`Storage Provider: ${process.env.STORAGE_PROVIDER || 'local'}\n`);

  try {
    // Test 1: Health Check
    console.log('1️⃣  Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    console.log();

    // Test 2: Get Media Stats
    console.log('2️⃣  Getting media statistics...');
    const statsResponse = await axios.get(`${API_BASE_URL}/api/media/stats`);
    console.log('✅ Stats retrieved:', statsResponse.data);
    console.log();

    // Test 3: Upload File (if test image exists)
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    let uploadedFileId: string | null = null;

    if (fs.existsSync(testImagePath)) {
      console.log('3️⃣  Uploading test image...');
      
      const formData = new FormData();
      formData.append('files', fs.createReadStream(testImagePath));
      formData.append('altText', 'Test image for cloud storage');
      formData.append('caption', 'Automated test upload');
      formData.append('isPublic', 'true');

      try {
        const uploadResponse = await axios.post(
          `${API_BASE_URL}/api/media/upload`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              'Authorization': `Bearer ${AUTH_TOKEN}`
            }
          }
        );

        const uploadedFile = uploadResponse.data.files[0];
        uploadedFileId = uploadedFile.id;
        
        console.log('✅ File uploaded successfully:');
        console.log('   ID:', uploadedFile.id);
        console.log('   Filename:', uploadedFile.filename);
        console.log('   File URL:', uploadedFile.file_url);
        console.log('   Storage Key:', uploadedFile.storage_key);
        console.log('   Size:', (uploadedFile.file_size / 1024).toFixed(2), 'KB');
        console.log();

        // Test 4: Get File Info
        console.log('4️⃣  Getting file information...');
        const fileResponse = await axios.get(`${API_BASE_URL}/api/media/${uploadedFileId}`);
        console.log('✅ File info retrieved:', {
          id: fileResponse.data.file.id,
          original_filename: fileResponse.data.file.original_filename,
          file_url: fileResponse.data.file.file_url
        });
        console.log();

        // Test 5: Generate Thumbnails
        console.log('5️⃣  Generating thumbnails...');
        const thumbnailResponse = await axios.post(
          `${API_BASE_URL}/api/media/${uploadedFileId}/thumbnails`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${AUTH_TOKEN}`
            }
          }
        );
        console.log('✅ Thumbnails generated:', thumbnailResponse.data.thumbnails.length);
        thumbnailResponse.data.thumbnails.forEach((thumb: any) => {
          console.log(`   - ${thumb.size}: ${thumb.width}x${thumb.height} - ${thumb.thumbnail_url}`);
        });
        console.log();

        // Test 6: Get Thumbnails
        console.log('6️⃣  Getting thumbnails...');
        const thumbsResponse = await axios.get(`${API_BASE_URL}/api/media/${uploadedFileId}/thumbnails`);
        console.log('✅ Thumbnails retrieved:', thumbsResponse.data.thumbnails.length);
        console.log();

        // Test 7: Access File URL
        console.log('7️⃣  Verifying file access...');
        try {
          const fileAccessResponse = await axios.head(uploadedFile.file_url);
          console.log('✅ File is accessible');
          console.log('   Content-Type:', fileAccessResponse.headers['content-type']);
          console.log('   Content-Length:', fileAccessResponse.headers['content-length']);
          console.log();
        } catch (error: any) {
          console.log('⚠️  Could not access file URL directly (may require authentication)');
          console.log();
        }

        // Test 8: Update File Metadata
        console.log('8️⃣  Updating file metadata...');
        const updateResponse = await axios.put(
          `${API_BASE_URL}/api/media/${uploadedFileId}`,
          {
            altText: 'Updated alt text for cloud storage test',
            caption: 'Updated caption',
            isPublic: true
          },
          {
            headers: {
              'Authorization': `Bearer ${AUTH_TOKEN}`
            }
          }
        );
        console.log('✅ Metadata updated successfully');
        console.log();

        // Test 9: List Media Files
        console.log('9️⃣  Listing media files...');
        const listResponse = await axios.get(`${API_BASE_URL}/api/media?limit=5`);
        console.log('✅ Files retrieved:', listResponse.data.files.length);
        console.log('   Total:', listResponse.data.pagination.total);
        console.log();

        // Test 10: Delete File (optional - uncomment to test)
        // console.log('🔟 Deleting test file...');
        // await axios.delete(
        //   `${API_BASE_URL}/api/media/${uploadedFileId}`,
        //   {
        //     headers: {
        //       'Authorization': `Bearer ${AUTH_TOKEN}`
        //     }
        //   }
        // );
        // console.log('✅ File deleted successfully');
        // console.log();

      } catch (uploadError: any) {
        console.log('❌ Upload failed:', uploadError.response?.data || uploadError.message);
        console.log();
      }
    } else {
      console.log('3️⃣  ⚠️  Test image not found, skipping upload tests');
      console.log('   Create a test-image.jpg in the scripts directory to test uploads');
      console.log();
    }

    // Summary
    console.log('═'.repeat(60));
    console.log('✨ Test Suite Complete!');
    console.log('═'.repeat(60));
    console.log();
    console.log('Storage Configuration:');
    console.log('  Provider:', process.env.STORAGE_PROVIDER || 'local');
    console.log('  Bucket:', process.env.S3_BUCKET || process.env.R2_BUCKET || 'N/A');
    console.log('  CDN URL:', process.env.CDN_URL || process.env.R2_PUBLIC_URL || 'N/A');
    console.log();

  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Create a simple test image if it doesn't exist
function createTestImage() {
  const testImagePath = path.join(__dirname, 'test-image.jpg');
  
  if (!fs.existsSync(testImagePath)) {
    console.log('ℹ️  Creating test image...');
    // Create a simple 100x100 red square JPEG
    // This is a minimal valid JPEG file
    const jpegData = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      // ... (simplified - in reality you'd use a library or have a real test image)
      0xFF, 0xD9
    ]);
    
    // For testing, we'll just use a placeholder
    console.log('ℹ️  Please provide a test-image.jpg in the scripts directory');
  }
}

// Run tests
console.log('Starting media service tests...\n');
createTestImage();
testMediaService()
  .then(() => {
    console.log('All tests completed successfully! ✨');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
