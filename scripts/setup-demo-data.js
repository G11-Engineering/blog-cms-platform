#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const CONTENT_API_URL = process.env.CONTENT_SERVICE_URL || 'http://localhost:3002';
const CATEGORY_API_URL = process.env.CATEGORY_SERVICE_URL || 'http://localhost:3004';

async function createDemoUser() {
  try {
    console.log('👤 Creating demo user...');
    
    const userData = {
      email: process.env.DEMO_EMAIL || 'demo@example.com',
      username: process.env.DEMO_USERNAME || 'demo',
      password: process.env.DEMO_PASSWORD || 'demo123',
      firstName: process.env.DEMO_FIRST_NAME || 'Demo',
      lastName: process.env.DEMO_LAST_NAME || 'User'
    };
    
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
    console.log('✅ Demo user created successfully');
    return response.data.token;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('ℹ️  Demo user already exists');
      return null;
    }
    throw error;
  }
}

async function createDemoCategories() {
  try {
    console.log('📂 Creating demo categories...');
    
    const categories = [
      { name: 'Technology', description: 'Posts about technology and programming', color: '#3B82F6' },
      { name: 'Lifestyle', description: 'Posts about lifestyle and personal experiences', color: '#10B981' },
      { name: 'Business', description: 'Posts about business and entrepreneurship', color: '#F59E0B' },
      { name: 'Health', description: 'Posts about health and wellness', color: '#EF4444' },
      { name: 'Travel', description: 'Posts about travel and adventures', color: '#8B5CF6' }
    ];
    
    for (const category of categories) {
      try {
        await axios.post(`${CATEGORY_API_URL}/api/categories`, category);
        console.log(`✅ Created category: ${category.name}`);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('⚠️  Authentication required for category creation');
          break;
        }
        console.log(`ℹ️  Category ${category.name} might already exist`);
      }
    }
  } catch (error) {
    console.log('⚠️  Could not create categories:', error.message);
  }
}

async function createDemoPosts(token) {
  if (!token) {
    console.log('⚠️  No token available, skipping demo posts');
    return;
  }
  
  try {
    console.log('📝 Creating demo posts...');
    
    const posts = [
      {
        title: 'Welcome to Our Blog Platform',
        content: `
          <h2>Welcome to our amazing blog platform!</h2>
          <p>This is a fully functional CMS built with microservices architecture. Here are some key features:</p>
          <ul>
            <li><strong>Rich Text Editor:</strong> Create beautiful content with our TipTap editor</li>
            <li><strong>Media Management:</strong> Upload and manage images, videos, and documents</li>
            <li><strong>Categories & Tags:</strong> Organize your content effectively</li>
            <li><strong>Comments System:</strong> Engage with your readers</li>
            <li><strong>User Roles:</strong> Admin, Editor, Author, and Reader permissions</li>
          </ul>
          <p>Start creating your content today!</p>
        `,
        excerpt: 'Welcome to our amazing blog platform! This is a fully functional CMS built with microservices architecture.',
        categories: [],
        tags: []
      },
      {
        title: 'Getting Started with Microservices',
        content: `
          <h2>Understanding Microservices Architecture</h2>
          <p>Microservices architecture is a method of developing software systems that tries to focus on building single-function modules with well-defined interfaces and operations.</p>
          <h3>Benefits of Microservices:</h3>
          <ol>
            <li><strong>Scalability:</strong> Each service can be scaled independently</li>
            <li><strong>Technology Diversity:</strong> Use different technologies for different services</li>
            <li><strong>Fault Isolation:</strong> Failure in one service doesn't affect others</li>
            <li><strong>Team Independence:</strong> Teams can work independently on different services</li>
          </ol>
          <p>In our blog platform, we have separate services for users, content, media, categories, and comments.</p>
        `,
        excerpt: 'Learn about microservices architecture and how it benefits modern software development.',
        categories: [],
        tags: []
      }
    ];
    
    for (const post of posts) {
      try {
        await axios.post(`${CONTENT_API_URL}/api/posts`, post, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Created post: ${post.title}`);
      } catch (error) {
        console.log(`⚠️  Could not create post: ${post.title}`, error.message);
      }
    }
  } catch (error) {
    console.log('⚠️  Could not create demo posts:', error.message);
  }
}

async function setupDemoData() {
  console.log('🚀 Setting up demo data...\n');
  
  try {
    // Wait a bit for services to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const token = await createDemoUser();
    await createDemoCategories();
    await createDemoPosts(token);
    
    console.log('\n🎉 Demo data setup completed!');
    console.log('\n📋 Next steps:');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    console.log(`1. Visit ${frontendUrl}`);
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@cms.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    console.log(`2. Login with ${adminEmail} / ${adminPassword}`);
    console.log('3. Or register a new account');
    console.log('4. Start creating content!');
    
  } catch (error) {
    console.error('❌ Error setting up demo data:', error.message);
    process.exit(1);
  }
}

setupDemoData();
