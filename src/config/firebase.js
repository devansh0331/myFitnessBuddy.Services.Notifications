const admin = require('firebase-admin');

// Reads the file that GitHub Actions created
const serviceAccount = require('../../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

module.exports = { admin };