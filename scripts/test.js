#!/usr/bin/env node
// scripts/test.js

require('dotenv').config();
const NotificationService = require('../src/services/notification');

const uid = process.argv[2] || process.env.TEST_USER_UID;

if (!uid) {
  console.error('❌ Please provide a user UID: node scripts/test.js <uid>');
  process.exit(1);
}

async function main() {
  console.log(`🧪 Sending test notification to ${uid}`);
  
  const service = new NotificationService();
  await service.sendTestNotification(uid);
  
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});