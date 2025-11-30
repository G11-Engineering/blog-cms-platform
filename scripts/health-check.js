#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const services = [
  { name: 'User Service', url: `${process.env.USER_SERVICE_URL || 'http://localhost:3001'}/health`, port: parseInt(process.env.USER_SERVICE_PORT || '3001', 10) },
  { name: 'Content Service', url: `${process.env.CONTENT_SERVICE_URL || 'http://localhost:3002'}/health`, port: parseInt(process.env.CONTENT_SERVICE_PORT || '3002', 10) },
  { name: 'Media Service', url: `${process.env.MEDIA_SERVICE_URL || 'http://localhost:3003'}/health`, port: parseInt(process.env.MEDIA_SERVICE_PORT || '3003', 10) },
  { name: 'Category Service', url: `${process.env.CATEGORY_SERVICE_URL || 'http://localhost:3004'}/health`, port: parseInt(process.env.CATEGORY_SERVICE_PORT || '3004', 10) },
  { name: 'Comment Service', url: `${process.env.COMMENT_SERVICE_URL || 'http://localhost:3005'}/health`, port: parseInt(process.env.COMMENT_SERVICE_PORT || '3005', 10) },
  { name: 'Frontend', url: process.env.FRONTEND_URL || 'http://localhost:3000', port: parseInt(process.env.FRONTEND_PORT || '3000', 10) },
];

const databases = [
  { name: 'User DB', port: parseInt(process.env.POSTGRES_USER_PORT || '5433', 10) },
  { name: 'Content DB', port: parseInt(process.env.POSTGRES_CONTENT_PORT || '5434', 10) },
  { name: 'Media DB', port: parseInt(process.env.POSTGRES_MEDIA_PORT || '5435', 10) },
  { name: 'Category DB', port: parseInt(process.env.POSTGRES_CATEGORY_PORT || '5436', 10) },
  { name: 'Comment DB', port: parseInt(process.env.POSTGRES_COMMENT_PORT || '5437', 10) },
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
    
    const host = process.env.DB_HOST || 'localhost';
    socket.connect(port, host);
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
