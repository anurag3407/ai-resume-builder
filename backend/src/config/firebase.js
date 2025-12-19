import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
// For production, use a service account key file
// For development, we'll use the project ID and let ADC handle auth

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};

// Check if we have a service account file
if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  const serviceAccount = await import(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, {
    assert: { type: 'json' }
  });
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount.default),
    storageBucket: firebaseConfig.storageBucket
  });
} else {
  // Initialize without credentials for development
  // This will use Application Default Credentials if available
  try {
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket
    });
  } catch (error) {
    console.warn('Firebase Admin SDK initialization warning:', error.message);
  }
}

// Export Firestore and Storage instances
export const db = admin.firestore();
export const storage = admin.storage();
export const auth = admin.auth();

export default admin;
