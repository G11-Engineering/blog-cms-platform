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

async function addDemoPosts() {
  console.log('🚀 Adding demo posts...');

  let adminToken = '';
  try {
    const loginRes = await authApi.post('/api/auth/login', {
      email: 'admin@cms.com',
      password: 'admin123',
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

  const posts = [
    {
      title: 'Welcome to Our CMS Blog Platform',
      content: '<p>This is your first post on our new CMS blog platform. We hope you enjoy creating and sharing content!</p><p>This platform features:</p><ul><li>Rich text editing with TipTap</li><li>User authentication and roles</li><li>Category and tag management</li><li>Media uploads</li><li>Comment system</li></ul>',
      excerpt: 'A warm welcome to all our users.',
      categories: [],
      tags: [],
    },
    {
      title: 'Getting Started with Content Creation',
      content: '<p>Learn how to create your first blog post, add images, and manage categories and tags.</p><h2>Creating Your First Post</h2><p>To create a new post:</p><ol><li>Log in to your account</li><li>Click "Create Post"</li><li>Fill in the title and content</li><li>Add an excerpt</li><li>Publish your post</li></ol>',
      excerpt: 'A guide to kickstart your blogging journey.',
      categories: [],
      tags: [],
    },
    {
      title: 'Microservices Architecture Explained',
      content: '<p>Dive deep into the microservices architecture powering this platform, understanding how each service contributes to the whole.</p><h2>Our Services</h2><ul><li><strong>User Service:</strong> Authentication and user management</li><li><strong>Content Service:</strong> Posts and articles</li><li><strong>Media Service:</strong> File uploads and management</li><li><strong>Category Service:</strong> Categories and tags</li><li><strong>Comment Service:</strong> Comments and discussions</li></ul>',
      excerpt: 'An in-depth look at the system design.',
      categories: [],
      tags: [],
    },
    {
      title: 'Tips for Better Blog Writing',
      content: '<p>Writing engaging blog posts is an art. Here are some tips to help you create content that resonates with your audience.</p><h2>Writing Tips</h2><ul><li>Start with a compelling headline</li><li>Use subheadings to break up content</li><li>Include relevant images</li><li>Write in a conversational tone</li><li>End with a call to action</li></ul>',
      excerpt: 'Learn how to write engaging blog posts that your readers will love.',
      categories: [],
      tags: [],
    },
    {
      title: 'The Future of Content Management',
      content: '<p>Content management systems are evolving rapidly. Let\'s explore what the future holds for CMS platforms.</p><h2>Emerging Trends</h2><ul><li>Headless CMS architecture</li><li>AI-powered content suggestions</li><li>Real-time collaboration</li><li>Mobile-first design</li><li>Voice content creation</li></ul>',
      excerpt: 'Exploring the latest trends in content management systems.',
      categories: [],
      tags: [],
    }
  ];

  for (const post of posts) {
    try {
      await contentApi.post('/api/posts', post);
      console.log(`✅ Created post: "${post.title}"`);
    } catch (error) {
      console.error(`❌ Failed to create post "${post.title}":`, error.response?.data || error.message);
    }
  }

  console.log('✅ Demo posts created successfully!');
}

addDemoPosts();