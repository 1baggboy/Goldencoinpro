import admin from 'firebase-admin';

if (!admin.apps || !admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Replace escaped newlines in the private key
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey && privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    try {
      admin.initializeApp({
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
      admin.initializeApp();
      console.log('[Firebase Admin] Initialized with default credentials');
    } catch (error) {
      console.warn('[Firebase Admin] Initialization failed: Missing credentials.');
    }
  }
}

export const db = (admin.apps && admin.apps.length) ? admin.firestore() : null;
export const auth = (admin.apps && admin.apps.length) ? admin.auth() : null;
