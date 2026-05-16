import admin from 'firebase-admin';

if (!admin.apps || !admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
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
