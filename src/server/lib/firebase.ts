import admin from 'firebase-admin';

if (!admin.apps || !admin.apps.length) {
  let projectId = process.env.FIREBASE_PROJECT_ID;
  if (projectId && projectId.startsWith('"') && projectId.endsWith('"')) {
    projectId = projectId.slice(1, -1);
  }
  let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  if (clientEmail && clientEmail.startsWith('"') && clientEmail.endsWith('"')) {
    clientEmail = clientEmail.slice(1, -1);
  }
  // Replace escaped newlines in the private key and handle potential wrapping quotes
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey) {
    // Replace literal \n with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n');
    // Handle cases where the key might be wrapped in double quotes in the env string
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1).replace(/\\n/g, '\n');
    }
    privateKey = privateKey.trim();
  }

  if (projectId && clientEmail && privateKey && privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    try {
      admin.initializeApp({
        projectId,
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('[Firebase Admin] Initialized with credentials');
    } catch (error) {
      console.warn('[Firebase Admin] Initialization failed with provided credentials:', error);
    }
  } else {
    // Attempt fallback or default initialization
    try {
      try {
        const config = require('../../../firebase-applet-config.json');
        admin.initializeApp({ projectId: config.projectId });
        console.log('[Firebase Admin] Initialized with fallback projectId from config:', config.projectId);
      } catch (e) {
        admin.initializeApp();
        console.log('[Firebase Admin] Initialized with default credentials');
      }
    } catch (error) {
      console.warn('[Firebase Admin] Initialization failed: Missing credentials.', error);
    }
  }
}

export let db: admin.firestore.Firestore | null = null;
export let auth: admin.auth.Auth | null = null;

if (admin.apps && admin.apps.length) {
  auth = admin.auth();
  try {
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const config = require(configPath);
      if (config.firestoreDatabaseId) {
        const { getFirestore } = require('firebase-admin/firestore');
        db = getFirestore(admin.app(), config.firestoreDatabaseId);
      } else {
        db = admin.firestore();
      }
    } else {
      db = admin.firestore();
    }
  } catch (e) {
    db = admin.firestore();
  }
}

