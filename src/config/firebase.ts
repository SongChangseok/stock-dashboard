import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Firebase configuration interface
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Firebase configuration from environment variables
const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

// Validate Firebase configuration
const validateFirebaseConfig = (config: FirebaseConfig): boolean => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  
  for (const field of requiredFields) {
    if (!config[field as keyof FirebaseConfig]) {
      console.error(`Firebase configuration missing: ${field}`);
      return false;
    }
  }
  
  return true;
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | null = null;

try {
  if (!validateFirebaseConfig(firebaseConfig)) {
    throw new Error('Invalid Firebase configuration. Please check environment variables.');
  }

  // Initialize Firebase app
  app = initializeApp(firebaseConfig);
  
  // Initialize Firebase services
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Initialize Analytics (optional, only in production)
  if (typeof window !== 'undefined' && import.meta.env.PROD) {
    try {
      analytics = getAnalytics(app);
    } catch (error) {
      console.warn('Firebase Analytics initialization failed:', error);
    }
  }

  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

// Export Firebase services
export { app, auth, db, analytics };

// Export Firebase configuration for debugging
export const getFirebaseConfig = () => ({
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? '***' : '',
});

// Health check function
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Simple auth state check
    const user = auth.currentUser;
    console.log('Firebase connection check:', user ? 'authenticated' : 'not authenticated');
    return true;
  } catch (error) {
    console.error('Firebase connection check failed:', error);
    return false;
  }
};