#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const services = [
  { name: 'User Service', url: 'http://localhost:3001/health', port: 3001 },
  { name: 'Content Service', url: 'http://localhost:3002/health', port: 3002 },
  { name: 'Media Service', url: 'http://localhost:3003/health', port: 3003 },
  { name: 'Category Service', url: 'http://localhost:3004/health', port: 3004 },
  { name: 'Comment Service', url: 'http://localhost:3005/health', port: 3005 },
  { name: 'Frontend', url: 'http://localhost:3000', port: 3000 },
];

const databases = [
  { name: 'User DB', port: 5433 },
  { name: 'Content DB', port: 5434 },
  { name: 'Media DB', port: 5435 },
  { name: 'Category DB', port: 5436 },
  { name: 'Comment DB', port: 5437 },
];

async function checkPort(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const socket = new net.Socket();
    
    socket.setTimeout(1000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      resolve(false);
    });
    
    socket.connect(port, 'localhost');
  });
}

async function checkService(service) {
  try {
    const response = await axios.get(service.url, { timeout: 5000 });
    return {
      name: service.name,
      status: 'healthy',
      responseTime: response.headers['x-response-time'] || 'N/A',
      statusCode: response.status,
      message: response.data?.message || 'OK'
    };
  } catch (error) {
    return {
      name: service.name,
      status: 'unhealthy',
      error: error.message,
      statusCode: error.response?.status || 'N/A'
    };
  }
}

async function checkDatabase(db) {
  const isPortOpen = await checkPort(db.port);
  return {
    name: db.name,
    status: isPortOpen ? 'healthy' : 'unhealthy',
    port: db.port
  };
}

async function generateReport() {
  console.log('🔍 CMS Blog Platform Health Check\n');
  console.log('=' .repeat(50));
  
  const timestamp = new Date().toISOString();
  console.log(`📅 Timestamp: ${timestamp}\n`);
  
  // Check services
  console.log('🌐 Services Status:');
  console.log('-'.repeat(30));
  
  const serviceResults = await Promise.all(services.map(checkService));
  serviceResults.forEach(result => {
    const status = result.status === 'healthy' ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.status.toUpperCase()}`);
    if (result.status === 'unhealthy') {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n🗄️  Database Status:');
  console.log('-'.repeat(30));
  
  const dbResults = await Promise.all(databases.map(checkDatabase));
  dbResults.forEach(result => {
    const status = result.status === 'healthy' ? '✅' : '❌';
    console.log(`${status} ${result.name} (Port ${result.port}): ${result.status.toUpperCase()}`);
  });
  
  // Summary
  const healthyServices = serviceResults.filter(s => s.status === 'healthy').length;
  const healthyDbs = dbResults.filter(d => d.status === 'healthy').length;
  const totalServices = serviceResults.length;
  const totalDbs = dbResults.length;
  
  console.log('\n📊 Summary:');
  console.log('-'.repeat(30));
  console.log(`Services: ${healthyServices}/${totalServices} healthy`);
  console.log(`Databases: ${healthyDbs}/${totalDbs} healthy`);
  
  if (healthyServices === totalServices && healthyDbs === totalDbs) {
    console.log('\n🎉 All systems are operational!');
  } else {
    console.log('\n⚠️  Some systems are not responding. Check the details above.');
  }
  
  // Save report to file
  const report = {
    timestamp,
    services: serviceResults,
    databases: dbResults,
    summary: {
      healthyServices,
      totalServices,
      healthyDbs,
      totalDbs
    }
  };
  
  const reportPath = path.join(__dirname, '..', 'health-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
}

generateReport().catch(console.error);
