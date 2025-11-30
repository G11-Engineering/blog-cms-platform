#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');

const CATEGORY_SERVICE_URL = process.env.CATEGORY_SERVICE_URL || 'http://localhost:3004';
const TAG_SERVICE_URL = process.env.CATEGORY_SERVICE_URL || 'http://localhost:3004';
const CONTENT_SERVICE_URL = process.env.CONTENT_SERVICE_URL || 'http://localhost:3002';

// Sample categories
const categories = [
  { name: 'API Management', slug: 'api-management', description: 'Everything about API management with WSO2' },
  { name: 'Integration', slug: 'integration', description: 'Enterprise integration patterns and solutions' },
  { name: 'Identity & Access', slug: 'identity-access', description: 'Identity and access management solutions' },
  { name: 'Microservices', slug: 'microservices', description: 'Microservices architecture and patterns' },
  { name: 'DevOps', slug: 'devops', description: 'DevOps practices and automation' },
  { name: 'Security', slug: 'security', description: 'Security best practices and solutions' },
  { name: 'Cloud', slug: 'cloud', description: 'Cloud deployment and management' },
  { name: 'Analytics', slug: 'analytics', description: 'Data analytics and insights' }
];

// Sample tags
const tags = [
  { name: 'WSO2', slug: 'wso2', description: 'WSO2 platform and products' },
  { name: 'API Gateway', slug: 'api-gateway', description: 'API Gateway solutions' },
  { name: 'Microservices', slug: 'microservices', description: 'Microservices architecture' },
  { name: 'Integration', slug: 'integration', description: 'Enterprise integration' },
  { name: 'Identity', slug: 'identity', description: 'Identity management' },
  { name: 'Security', slug: 'security', description: 'Security solutions' },
  { name: 'DevOps', slug: 'devops', description: 'DevOps practices' },
  { name: 'Cloud', slug: 'cloud', description: 'Cloud technologies' },
  { name: 'Enterprise', slug: 'enterprise', description: 'Enterprise solutions' },
  { name: 'Open Source', slug: 'open-source', description: 'Open source technologies' }
];

// Sample posts
const posts = [
  {
    title: 'Getting Started with WSO2 API Manager',
    slug: 'getting-started-wso2-api-manager',
    content: 'Learn the basics of API management with WSO2 API Manager. This comprehensive guide covers installation, configuration, and best practices.',
    excerpt: 'Learn the basics of API management with WSO2 API Manager',
    status: 'published',
    featuredImageUrl: '',
    categories: [],
    tags: []
  },
  {
    title: 'Microservices Architecture Patterns',
    slug: 'microservices-architecture-patterns',
    content: 'Best practices for building microservices with WSO2. Learn about service discovery, load balancing, and monitoring.',
    excerpt: 'Best practices for building microservices',
    status: 'published',
    featuredImageUrl: '',
    categories: [],
    tags: []
  },
  {
    title: 'Identity and Access Management',
    slug: 'identity-access-management',
    content: 'Implementing IAM solutions with WSO2 Identity Server. Learn about OAuth, SAML, and other authentication protocols.',
    excerpt: 'Implementing IAM solutions with WSO2 Identity Server',
    status: 'published',
    featuredImageUrl: '',
    categories: [],
    tags: []
  },
  {
    title: 'Enterprise Integration Patterns',
    slug: 'enterprise-integration-patterns',
    content: 'Common patterns for enterprise integration using WSO2 Enterprise Integrator.',
    excerpt: 'Common patterns for enterprise integration',
    status: 'published',
    featuredImageUrl: '',
    categories: [],
    tags: []
  },
  {
    title: 'DevOps Best Practices',
    slug: 'devops-best-practices',
    content: 'Streamlining your development workflow with WSO2 and modern DevOps practices.',
    excerpt: 'Streamlining your development workflow',
    status: 'published',
    featuredImageUrl: '',
    categories: [],
    tags: []
  },
  {
    title: 'Security in API Management',
    slug: 'security-api-management',
    content: 'Securing your APIs with proper authentication and authorization using WSO2.',
    excerpt: 'Securing your APIs with proper authentication',
    status: 'published',
    featuredImageUrl: '',
    categories: [],
    tags: []
  }
];

async function createCategories() {
  console.log('Creating categories...');
  for (const category of categories) {
    try {
      const response = await axios.post(`${CATEGORY_SERVICE_URL}/api/categories`, category);
      console.log(`✅ Created category: ${category.name}`);
    } catch (error) {
      console.error(`❌ Failed to create category ${category.name}:`, error.response?.data || error.message);
    }
  }
}

async function createTags() {
  console.log('Creating tags...');
  for (const tag of tags) {
    try {
      const response = await axios.post(`${TAG_SERVICE_URL}/api/tags`, tag);
      console.log(`✅ Created tag: ${tag.name}`);
    } catch (error) {
      console.error(`❌ Failed to create tag ${tag.name}:`, error.response?.data || error.message);
    }
  }
}

async function createPosts() {
  console.log('Creating posts...');
  for (const post of posts) {
    try {
      const response = await axios.post(`${CONTENT_SERVICE_URL}/api/posts`, post);
      console.log(`✅ Created post: ${post.title}`);
    } catch (error) {
      console.error(`❌ Failed to create post ${post.title}:`, error.response?.data || error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting to populate sample data...\n');
  
  try {
    await createCategories();
    console.log('\n');
    await createTags();
    console.log('\n');
    await createPosts();
    console.log('\n✅ Sample data population completed!');
  } catch (error) {
    console.error('❌ Error populating sample data:', error);
  }
}

main();
