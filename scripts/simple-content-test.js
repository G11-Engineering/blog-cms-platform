const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({ path: './services/user-service/.env' });
dotenv.config({ path: './services/content-service/.env' });

const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:3001';
const CONTENT_SERVICE_URL = process.env.NEXT_PUBLIC_CONTENT_SERVICE_URL || 'http://localhost:3002';

const authApi = axios.create({
  baseURL: USER_SERVICE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const contentApi = axios.create({
  baseURL: CONTENT_SERVICE_URL,
  headers: { 'Content-Type': 'application/json' },
});

let adminToken = '';

async function login() {
  try {
    const loginRes = await authApi.post('/api/auth/login', {
      email: process.env.ADMIN_EMAIL || 'admin@cms.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
    });
    adminToken = loginRes.data.token;
    console.log('✅ Logged in as admin');
    
    contentApi.interceptors.request.use((config) => {
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

async function testBasicCRUD() {
  console.log('\n🧪 Testing Basic CRUD Operations...');
  
  // Test 1: Create a new post
  console.log('1. Creating a new post...');
  const createResponse = await contentApi.post('/api/posts', {
    title: 'Simple Test Post',
    content: '<p>This is a simple test post.</p>',
    excerpt: 'Simple test post',
    status: 'draft'
  });
  
  const postId = createResponse.data.post.id;
  console.log(`✅ Post created with ID: ${postId}`);
  
  // Test 2: Get the post
  console.log('2. Retrieving the post...');
  const getResponse = await contentApi.get(`/api/posts/${postId}`);
  console.log(`✅ Post retrieved: ${getResponse.data.post.title}`);
  
  // Test 3: Update the post
  console.log('3. Updating the post...');
  const updateResponse = await contentApi.put(`/api/posts/${postId}`, {
    title: 'Updated Simple Test Post',
    content: '<p>This is an updated simple test post.</p>'
  });
  console.log(`✅ Post updated: ${updateResponse.data.post.title}`);
  
  return postId;
}

async function testDrafts() {
  console.log('\n📝 Testing Draft Management...');
  
  // Test 1: Create a draft
  console.log('1. Creating a draft...');
  const draftResponse = await contentApi.post('/api/posts/drafts', {
    title: 'Draft Test Post',
    content: '<p>This is a draft post.</p>',
    excerpt: 'Draft test post'
  });
  
  const draftId = draftResponse.data.postId;
  console.log(`✅ Draft created with ID: ${draftId}`);
  
  // Test 2: Get drafts
  console.log('2. Retrieving drafts...');
  const draftsResponse = await contentApi.get('/api/posts/drafts');
  console.log(`✅ Found ${draftsResponse.data.drafts.length} drafts`);
  
  return draftId;
}

async function testVersioning(postId) {
  console.log('\n🔄 Testing Versioning...');
  
  // Test 1: Create a version
  console.log('1. Creating a new version...');
  const versionResponse = await contentApi.post(`/api/posts/${postId}/versions`, {
    title: 'Version 2 of the post',
    content: '<p>This is version 2 of the post.</p>',
    excerpt: 'Version 2 for testing'
  });
  console.log(`✅ Version created: ${versionResponse.data.version.version_number}`);
  
  // Test 2: Get versions
  console.log('2. Retrieving versions...');
  const versionsResponse = await contentApi.get(`/api/posts/${postId}/versions`);
  console.log(`✅ Found ${versionsResponse.data.versions.length} versions`);
  
  return true;
}

async function testScheduling(postId) {
  console.log('\n⏰ Testing Scheduling...');
  
  // Test 1: Schedule a post
  console.log('1. Scheduling a post...');
  const scheduleDate = new Date();
  scheduleDate.setMinutes(scheduleDate.getMinutes() + 1); // Schedule 1 minute from now
  
  const scheduleResponse = await contentApi.post(`/api/posts/${postId}/schedule`, {
    scheduledAt: scheduleDate.toISOString()
  });
  console.log(`✅ Post scheduled for: ${scheduleResponse.data.post.scheduled_at}`);
  
  return true;
}

async function testPublishing(postId) {
  console.log('\n📢 Testing Publishing...');
  
  // Test 1: Publish the post
  console.log('1. Publishing the post...');
  const publishResponse = await contentApi.post(`/api/posts/${postId}/publish`);
  console.log(`✅ Post published: ${publishResponse.data.post.status}`);
  
  return true;
}

async function runTests() {
  try {
    console.log('🚀 Starting Simple Content Service Tests...\n');
    
    await login();
    
    const postId = await testBasicCRUD();
    const draftId = await testDrafts();
    await testVersioning(postId);
    await testScheduling(postId);
    await testPublishing(postId);
    
    console.log('\n✅ All basic tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('✅ CRUD Operations - Working');
    console.log('✅ Draft Management - Working');
    console.log('✅ Versioning - Working');
    console.log('✅ Scheduling - Working');
    console.log('✅ Publishing - Working');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

runTests();
