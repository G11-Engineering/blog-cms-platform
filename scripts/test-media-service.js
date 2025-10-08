const axios = require('axios');
const dotenv = require('dotenv');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: './services/user-service/.env' });
dotenv.config({ path: './services/media-service/.env' });

const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:3001';
const MEDIA_SERVICE_URL = process.env.NEXT_PUBLIC_MEDIA_SERVICE_URL || 'http://localhost:3003';

const authApi = axios.create({
  baseURL: USER_SERVICE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const mediaApi = axios.create({
  baseURL: MEDIA_SERVICE_URL,
  headers: { 'Content-Type': 'application/json' },
});

let adminToken = '';

async function login() {
  try {
    const loginRes = await authApi.post('/api/auth/login', {
      email: 'admin@cms.com',
      password: 'admin123',
    });
    adminToken = loginRes.data.token;
    console.log('✅ Logged in as admin');
    
    mediaApi.interceptors.request.use((config) => {
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
      return config;
    });
  } catch (error) {
    console.error('❌ Failed to login:', error.response?.data || error.message);
    throw error;
  }
}

async function testMediaStats() {
  console.log('\n📊 Testing Media Statistics...');
  
  const statsResponse = await mediaApi.get('/api/media/stats');
  console.log('✅ Media stats:', statsResponse.data.stats);
}

async function testMediaList() {
  console.log('\n📁 Testing Media List...');
  
  const listResponse = await mediaApi.get('/api/media');
  console.log(`✅ Found ${listResponse.data.files.length} media files`);
}

async function testFileUpload() {
  console.log('\n📤 Testing File Upload...');
  
  // Create a test image file
  const testImagePath = path.join(__dirname, 'test-image.txt');
  fs.writeFileSync(testImagePath, 'This is a test file for media upload');
  
  const formData = new FormData();
  formData.append('files', fs.createReadStream(testImagePath));
  formData.append('altText', 'Test image');
  formData.append('caption', 'Test upload');
  formData.append('isPublic', 'true');
  
  const uploadResponse = await mediaApi.post('/api/media/upload', formData, {
    headers: {
      ...formData.getHeaders(),
      'Authorization': `Bearer ${adminToken}`
    }
  });
  
  console.log(`✅ Uploaded ${uploadResponse.data.files.length} files`);
  
  // Clean up test file
  fs.unlinkSync(testImagePath);
  
  return uploadResponse.data.files[0].id;
}

async function testFileRetrieval(fileId) {
  console.log('\n📥 Testing File Retrieval...');
  
  const fileResponse = await mediaApi.get(`/api/media/${fileId}`);
  console.log(`✅ Retrieved file: ${fileResponse.data.file.original_filename}`);
}

async function testFileServing(fileId) {
  console.log('\n🌐 Testing File Serving...');
  
  const serveResponse = await mediaApi.get(`/api/media/${fileId}/serve`, {
    responseType: 'stream'
  });
  console.log('✅ File serving endpoint working');
}

async function testFileUpdate(fileId) {
  console.log('\n✏️ Testing File Update...');
  
  const updateResponse = await mediaApi.put(`/api/media/${fileId}`, {
    altText: 'Updated test image',
    caption: 'Updated caption',
    isPublic: false
  });
  
  console.log(`✅ Updated file: ${updateResponse.data.file.alt_text}`);
}

async function testFileDeletion(fileId) {
  console.log('\n🗑️ Testing File Deletion...');
  
  const deleteResponse = await mediaApi.delete(`/api/media/${fileId}`);
  console.log('✅ File deleted successfully');
}

async function runTests() {
  try {
    console.log('🚀 Starting Media Service Tests...\n');
    
    await login();
    await testMediaStats();
    await testMediaList();
    
    const fileId = await testFileUpload();
    await testFileRetrieval(fileId);
    await testFileServing(fileId);
    await testFileUpdate(fileId);
    await testFileDeletion(fileId);
    
    console.log('\n✅ All Media Service tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Media Statistics - Working');
    console.log('✅ Media List - Working');
    console.log('✅ File Upload - Working');
    console.log('✅ File Retrieval - Working');
    console.log('✅ File Serving - Working');
    console.log('✅ File Update - Working');
    console.log('✅ File Deletion - Working');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

runTests();
