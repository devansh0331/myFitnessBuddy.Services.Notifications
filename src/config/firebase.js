const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
let firebaseApp;

function initializeFirebase() {
  if (firebaseApp) return firebaseApp;

  let serviceAccount;
  try {
    // For local development: service-account.json in project root
    serviceAccount = require('../../service-account.json');
  } catch (err) {
    console.error('❌ service-account.json not found. Please place it in the project root.');
    process.exit(1);
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });

  console.log('✅ Firebase Admin SDK initialized');
  return firebaseApp;
}

function getFirestore() {
  initializeFirebase();
  return admin.firestore();
}

function getMessaging() {
  initializeFirebase();
  return admin.messaging();
}

module.exports = {
  admin,
  initializeFirebase,
  getFirestore,
  getMessaging,
};