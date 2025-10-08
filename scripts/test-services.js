#!/usr/bin/env node

const axios = require('axios');

const services = [
  { name: 'User Service', url: 'http://localhost:3001/health' },
  { name: 'Content Service', url: 'http://localhost:3002/health' },
  { name: 'Media Service', url: 'http://localhost:3003/health' },
  { name: 'Category Service', url: 'http://localhost:3004/health' },
  { name: 'Comment Service', url: 'http://localhost:3005/health' },
  { name: 'Frontend', url: 'http://localhost:3000' },
];

async function testService(service) {
  try {
    const response = await axios.get(service.url, { timeout: 5000 });
    console.log(`✅ ${service.name}: OK (${response.status})`);
    return true;
  } catch (error) {
    console.log(`❌ ${service.name}: FAILED (${error.message})`);
    return false;
  }
}

async function testAllServices() {
  console.log('🔍 Testing all services...\n');
  
  const results = await Promise.all(services.map(testService));
  const successCount = results.filter(Boolean).length;
  const totalCount = services.length;
  
  console.log(`\n📊 Results: ${successCount}/${totalCount} services running`);
  
  if (successCount === totalCount) {
    console.log('🎉 All services are running successfully!');
    process.exit(0);
  } else {
    console.log('⚠️  Some services are not running. Check the logs above.');
    process.exit(1);
  }
}

testAllServices();
