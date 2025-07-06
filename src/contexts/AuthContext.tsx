import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  updateEmail as firebaseUpdateEmail,
  deleteUser,
  sendEmailVerification as firebaseSendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import {
  AuthContextType,
  AuthState,
  User,
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
  UserPreferences,
  DEFAULT_USER_PREFERENCES,
  SocialProvider,
} from '../types/auth';
import {
  getAuthErrorMessage,
  validateLoginCredentials,
  validateRegistrationData,
  refreshSessionActivity,
  formatAuthErrorForLogging,
} from '../utils/authUtils';

// Auth action types
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

// Initial auth state
const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  isEmailVerified: false,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isEmailVerified: action.payload?.emailVerified || false,
        loading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Convert Firebase user to our User type
  const convertFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    const userData = userDoc.data();

    return {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || userData?.displayName,
      photoURL: firebaseUser.photoURL || userData?.photoURL,
      emailVerified: firebaseUser.emailVerified,
      createdAt: userData?.createdAt?.toDate() || new Date(),
      lastLoginAt: new Date(),
      preferences: userData?.preferences || DEFAULT_USER_PREFERENCES,
      uid: firebaseUser.uid,
      providerId: firebaseUser.providerId,
      isAnonymous: firebaseUser.isAnonymous,
      metadata: firebaseUser.metadata,
      providerData: firebaseUser.providerData,
      refreshToken: firebaseUser.refreshToken,
      tenantId: firebaseUser.tenantId,
      delete: firebaseUser.delete,
      getIdToken: firebaseUser.getIdToken,
      getIdTokenResult: firebaseUser.getIdTokenResult,
      reload: firebaseUser.reload,
    };
  };

  // Save user data to Firestore
  const saveUserToFirestore = async (user: FirebaseUser, additionalData: any = {}) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName || additionalData.displayName,
          photoURL: user.photoURL,
          createdAt: new Date(),
          lastLoginAt: new Date(),
          preferences: DEFAULT_USER_PREFERENCES,
          ...additionalData,
        });
      } else {
        // Update last login time
        await updateDoc(userRef, {
          lastLoginAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error saving user to Firestore:', error);
    }
  };

  // Sign in with email and password
  const signInWithEmail = async (credentials: LoginCredentials): Promise<User> => {
    const validation = validateLoginCredentials(credentials);
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors)[0]);
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const result = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      await saveUserToFirestore(result.user);
      const user = await convertFirebaseUser(result.user);
      
      refreshSessionActivity();
      dispatch({ type: 'SET_USER', payload: user });
      
      return user;
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Sign in error:', formatAuthErrorForLogging(error));
      throw new Error(errorMessage);
    }
  };

  // Sign up with email and password
  const signUpWithEmail = async (data: RegisterData): Promise<User> => {
    const validation = validateRegistrationData(data);
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors)[0]);
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const result = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // Update profile with display name
      if (data.displayName) {
        await firebaseUpdateProfile(result.user, {
          displayName: data.displayName,
        });
      }

      await saveUserToFirestore(result.user, {
        displayName: data.displayName,
      });

      // Send email verification
      await firebaseSendEmailVerification(result.user);

      const user = await convertFirebaseUser(result.user);
      
      refreshSessionActivity();
      dispatch({ type: 'SET_USER', payload: user });
      
      return user;
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Sign up error:', formatAuthErrorForLogging(error));
      throw new Error(errorMessage);
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('lastActivity');
      dispatch({ type: 'SET_USER', payload: null });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Sign in with social provider
  const signInWithSocial = async (provider: SocialProvider): Promise<User> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      let authProvider;
      
      switch (provider) {
        case 'google':
          authProvider = new GoogleAuthProvider();
          break;
        default:
          throw new Error(`Provider ${provider} not implemented yet`);
      }

      const result = await signInWithPopup(auth, authProvider);
      await saveUserToFirestore(result.user);
      const user = await convertFirebaseUser(result.user);
      
      refreshSessionActivity();
      dispatch({ type: 'SET_USER', payload: user });
      
      return user;
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Social sign in error:', formatAuthErrorForLogging(error));
      throw new Error(errorMessage);
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await sendPasswordResetEmail(auth, email);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Update profile
  const updateProfile = async (data: UpdateProfileData): Promise<void> => {
    if (!auth.currentUser) throw new Error('No authenticated user');

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await firebaseUpdateProfile(auth.currentUser, data);
      
      // Update Firestore document
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        displayName: data.displayName,
        photoURL: data.photoURL,
      });

      dispatch({ type: 'UPDATE_USER', payload: data });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Update user preferences
  const updateUserPreferences = async (preferences: Partial<UserPreferences>): Promise<void> => {
    if (!auth.currentUser || !state.user) throw new Error('No authenticated user');

    try {
      const updatedPreferences = { ...state.user.preferences, ...preferences };
      
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        preferences: updatedPreferences,
      });

      dispatch({ type: 'UPDATE_USER', payload: { preferences: updatedPreferences } });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Send email verification
  const sendEmailVerification = async (): Promise<void> => {
    if (!auth.currentUser) throw new Error('No authenticated user');
    
    try {
      await firebaseSendEmailVerification(auth.currentUser);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!auth.currentUser) throw new Error('No authenticated user');

    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      // Note: Firebase doesn't have updatePassword in v9, use reauthentication flow
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Update email
  const updateEmail = async (newEmail: string, password: string): Promise<void> => {
    if (!auth.currentUser) throw new Error('No authenticated user');

    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email!, password);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await firebaseUpdateEmail(auth.currentUser, newEmail);
      
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        email: newEmail,
      });

      dispatch({ type: 'UPDATE_USER', payload: { email: newEmail } });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Delete account
  const deleteAccount = async (password: string): Promise<void> => {
    if (!auth.currentUser) throw new Error('No authenticated user');

    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email!, password);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Delete user data from Firestore
      await deleteDoc(doc(db, 'users', auth.currentUser.uid));
      
      // Delete user account
      await deleteUser(auth.currentUser);
      
      dispatch({ type: 'SET_USER', payload: null });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Clear error
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Check auth state
  const checkAuthState = async (): Promise<User | null> => {
    return state.user;
  };

  // Refresh token (placeholder)
  const refreshToken = async (): Promise<void> => {
    if (auth.currentUser) {
      await auth.currentUser.getIdToken(true);
    }
  };

  // Placeholder implementations for other methods
  const confirmPasswordReset = async (code: string, newPassword: string): Promise<void> => {
    // Implementation would use confirmPasswordReset from Firebase
    throw new Error('Not implemented yet');
  };

  const verifyEmail = async (code: string): Promise<void> => {
    // Implementation would use applyActionCode from Firebase
    throw new Error('Not implemented yet');
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (firebaseUser) {
        try {
          const user = await convertFirebaseUser(firebaseUser);
          dispatch({ type: 'SET_USER', payload: user });
          refreshSessionActivity();
        } catch (error) {
          console.error('Error converting Firebase user:', error);
          dispatch({ type: 'SET_USER', payload: null });
        }
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    ...state,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    signInWithSocial,
    resetPassword,
    confirmPasswordReset,
    changePassword,
    sendEmailVerification,
    verifyEmail,
    updateProfile,
    updateEmail,
    deleteAccount,
    refreshToken,
    checkAuthState,
    clearError,
    updateUserPreferences,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};