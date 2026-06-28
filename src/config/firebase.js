const admin = require('firebase-admin');

function initializeFirebase() {
  if (!admin.apps.length) {
    // If the secret is stored as an env variable, parse it
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : require('../../service-account.json');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  }
  return admin;
}

module.exports = { initializeFirebase, admin };