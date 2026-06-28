#!/usr/bin/env node
// scripts/good-night.js

require('dotenv').config();
const NotificationService = require('../src/services/notification');

async function main() {
  console.log(`🚀 Starting Good Night job at ${new Date().toISOString()}`);
  
  const service = new NotificationService();
  await service.sendGoodNight();
  
  console.log(`✅ Good Night job completed at ${new Date().toISOString()}`);
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});