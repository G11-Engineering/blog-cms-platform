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

async function publishPosts() {
  console.log('🚀 Publishing draft posts...');

  let adminToken = '';
  try {
    const loginRes = await authApi.post('/api/auth/login', {
      email: process.env.ADMIN_EMAIL || 'admin@cms.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
    });
    adminToken = loginRes.data.token;
    console.log('✅ Logged in as admin');
  } catch (error) {
    console.error('❌ Failed to login admin:', error.response?.data || error.message);
    return;
  }

  contentApi.interceptors.request.use((config) => {
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  });

  // Get all draft posts
  try {
    const draftPostsRes = await contentApi.get('/api/posts?status=draft');
    const draftPosts = draftPostsRes.data.posts;
    
    console.log(`📝 Found ${draftPosts.length} draft posts`);
    
    for (const post of draftPosts) {
      try {
        await contentApi.post(`/api/posts/${post.id}/publish`);
        console.log(`✅ Published post: "${post.title}"`);
      } catch (error) {
        console.error(`❌ Failed to publish post "${post.title}":`, error.response?.data || error.message);
      }
    }
    
    console.log('✅ All posts published successfully!');
  } catch (error) {
    console.error('❌ Failed to get draft posts:', error.response?.data || error.message);
  }
}

publishPosts();
