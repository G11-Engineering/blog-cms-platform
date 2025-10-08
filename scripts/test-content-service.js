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
      email: 'admin@cms.com',
      password: 'admin123',
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

async function testCRUDOperations() {
  console.log('\n🧪 Testing CRUD Operations...');
  
  // Test 1: Create a new post
  console.log('1. Creating a new post...');
  const createResponse = await contentApi.post('/api/posts', {
    title: 'Enhanced Content Service Test',
    content: '<p>This is a test post to verify the enhanced CRUD operations.</p><h2>Features Tested</h2><ul><li>Post creation</li><li>Draft management</li><li>Versioning</li><li>Scheduling</li></ul>',
    excerpt: 'Testing the enhanced content service features',
    status: 'draft',
    categories: [],
    tags: []
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
    title: 'Enhanced Content Service Test - Updated',
    content: '<p>This is an updated test post.</p><h2>Updated Features</h2><ul><li>Post updating</li><li>Version control</li><li>Draft management</li></ul>',
    excerpt: 'Updated test post for enhanced content service'
  });
  console.log(`✅ Post updated: ${updateResponse.data.post.title}`);
  
  return postId;
}

async function testDraftManagement() {
  console.log('\n📝 Testing Draft Management...');
  
  // Test 1: Create a draft
  console.log('1. Creating a draft...');
  const draftResponse = await contentApi.post('/api/posts/drafts', {
    title: 'Draft Post Test',
    content: '<p>This is a draft post for testing.</p>',
    excerpt: 'Testing draft functionality'
  });
  
  const draftId = draftResponse.data.postId;
  console.log(`✅ Draft created with ID: ${draftId}`);
  
  // Test 2: Get drafts
  console.log('2. Retrieving drafts...');
  const draftsResponse = await contentApi.get('/api/posts/drafts');
  console.log(`✅ Found ${draftsResponse.data.drafts.length} drafts`);
  
  // Test 3: Update draft
  console.log('3. Updating draft...');
  await contentApi.post('/api/posts/drafts', {
    postId: draftId,
    title: 'Updated Draft Post',
    content: '<p>This is an updated draft post.</p>',
    excerpt: 'Updated draft for testing'
  });
  console.log('✅ Draft updated successfully');
  
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
  
  // Test 3: Get specific version
  console.log('3. Getting specific version...');
  const specificVersion = await contentApi.get(`/api/posts/${postId}/versions/2`);
  console.log(`✅ Retrieved version 2: ${specificVersion.data.version.title}`);
  
  // Test 4: Restore version
  console.log('4. Restoring to version 2...');
  const restoreResponse = await contentApi.post(`/api/posts/${postId}/versions/2/restore`);
  console.log(`✅ Restored to version 2: ${restoreResponse.data.post.title}`);
}

async function testScheduling(postId) {
  console.log('\n⏰ Testing Scheduling...');
  
  // Test 1: Schedule a post
  console.log('1. Scheduling a post...');
  const scheduleDate = new Date();
  scheduleDate.setMinutes(scheduleDate.getMinutes() + 2); // Schedule 2 minutes from now
  
  const scheduleResponse = await contentApi.post(`/api/posts/${postId}/schedule`, {
    scheduledAt: scheduleDate.toISOString()
  });
  console.log(`✅ Post scheduled for: ${scheduleResponse.data.post.scheduled_at}`);
  
  // Test 2: Get scheduled posts
  console.log('2. Getting scheduled posts...');
  const scheduledResponse = await contentApi.get('/api/posts/scheduled/ready');
  console.log(`✅ Found ${scheduledResponse.data.scheduledPosts.length} scheduled posts`);
  
  // Test 3: Publish scheduled posts (if any are ready)
  console.log('3. Publishing scheduled posts...');
  const publishResponse = await contentApi.post('/api/posts/scheduled/publish');
  console.log(`✅ ${publishResponse.data.message}`);
}

async function testPublishing(postId) {
  console.log('\n📢 Testing Publishing...');
  
  // Test 1: Publish the post
  console.log('1. Publishing the post...');
  const publishResponse = await contentApi.post(`/api/posts/${postId}/publish`);
  console.log(`✅ Post published: ${publishResponse.data.post.status}`);
  
  // Test 2: Get published posts
  console.log('2. Getting published posts...');
  const publishedResponse = await contentApi.get('/api/posts?status=published');
  console.log(`✅ Found ${publishedResponse.data.posts.length} published posts`);
}

async function testAdvancedFeatures() {
  console.log('\n🚀 Testing Advanced Features...');
  
  // Test 1: Search functionality
  console.log('1. Testing search...');
  const searchResponse = await contentApi.get('/api/posts?search=enhanced');
  console.log(`✅ Search found ${searchResponse.data.posts.length} posts`);
  
  // Test 2: Pagination
  console.log('2. Testing pagination...');
  const paginationResponse = await contentApi.get('/api/posts?page=1&limit=5');
  console.log(`✅ Pagination: Page ${paginationResponse.data.pagination.page} of ${paginationResponse.data.pagination.pages}`);
  
  // Test 3: Sorting
  console.log('3. Testing sorting...');
  const sortResponse = await contentApi.get('/api/posts?sortBy=created_at&sortOrder=desc');
  console.log(`✅ Sorted posts by creation date`);
}

async function runTests() {
  try {
    console.log('🚀 Starting Enhanced Content Service Tests...\n');
    
    await login();
    
    const postId = await testCRUDOperations();
    const draftId = await testDraftManagement();
    await testVersioning(postId);
    await testScheduling(postId);
    await testPublishing(postId);
    await testAdvancedFeatures();
    
    console.log('\n✅ All tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('✅ CRUD Operations - Working');
    console.log('✅ Draft Management - Working');
    console.log('✅ Versioning - Working');
    console.log('✅ Scheduling - Working');
    console.log('✅ Publishing - Working');
    console.log('✅ Advanced Features - Working');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

runTests();
