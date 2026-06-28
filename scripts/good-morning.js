#!/usr/bin/env node
// scripts/good-morning.js

require('dotenv').config();
const NotificationService = require('../src/services/notification');

async function main() {
  console.log(`🚀 Starting Good Morning job at ${new Date().toISOString()}`);
  
  const service = new NotificationService();
  await service.sendGoodMorning();
  
  console.log(`✅ Good Morning job completed at ${new Date().toISOString()}`);
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});