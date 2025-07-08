import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { supabase } from '../config/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
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

  // Convert Supabase user to our User type
  const convertSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User> => {
    let userData = null;
    
    // Try to get user data from database with timeout, but don't block if it fails
    try {
      const { data, error } = await Promise.race([
        supabase.from('users').select('*').eq('id', supabaseUser.id).single(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ]) as any;
      
      if (!error && data) {
        userData = data;
      }
    } catch (error) {
      // Silently continue without database data
      console.log('Using auth data only (DB unavailable)');
    }

    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      displayName: userData?.display_name || supabaseUser.user_metadata?.display_name,
      photoURL: userData?.photo_url || supabaseUser.user_metadata?.photo_url,
      emailVerified: supabaseUser.email_confirmed_at !== null,
      createdAt: userData?.created_at ? new Date(userData.created_at) : new Date(),
      lastLoginAt: new Date(),
      preferences: userData?.preferences || DEFAULT_USER_PREFERENCES,
      uid: supabaseUser.id,
      providerId: supabaseUser.app_metadata?.provider || 'email',
      isAnonymous: supabaseUser.is_anonymous || false,
      metadata: {
        creationTime: supabaseUser.created_at,
        lastSignInTime: supabaseUser.last_sign_in_at,
      },
      providerData: supabaseUser.identities || [],
      refreshToken: supabaseUser.refresh_token || '',
      tenantId: null,
      delete: async () => {
        const { error } = await supabase.auth.admin.deleteUser(supabaseUser.id);
        if (error) throw error;
      },
      getIdToken: async () => {
        const { data } = await supabase.auth.getSession();
        return data.session?.access_token || '';
      },
      getIdTokenResult: async () => {
        const { data } = await supabase.auth.getSession();
        return {
          token: data.session?.access_token || '',
          expirationTime: data.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : '',
          authTime: data.session?.issued_at ? new Date(data.session.issued_at * 1000).toISOString() : '',
          issuedAtTime: data.session?.issued_at ? new Date(data.session.issued_at * 1000).toISOString() : '',
          signInProvider: supabaseUser.app_metadata?.provider || 'email',
          signInSecondFactor: null,
          claims: data.session?.user?.app_metadata || {},
        };
      },
      reload: async () => {
        const { data } = await supabase.auth.getUser();
        return data.user;
      },
    };
  };

  // Save user data to Supabase
  const saveUserToSupabase = async (user: SupabaseUser, additionalData: any = {}) => {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!existingUser) {
        // Create new user document
        const { error } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            display_name: user.user_metadata?.display_name || additionalData.displayName,
            photo_url: user.user_metadata?.photo_url,
            email_verified: user.email_confirmed_at !== null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_login_at: new Date().toISOString(),
            preferences: DEFAULT_USER_PREFERENCES,
            ...additionalData,
          });

        if (error) throw error;
      } else {
        // Update last login time
        const { error } = await supabase
          .from('users')
          .update({
            last_login_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving user to Supabase:', error);
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user returned from sign in');

      await saveUserToSupabase(data.user);
      const user = await convertSupabaseUser(data.user);
      
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
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: data.displayName,
          },
        },
      });

      if (error) throw error;
      if (!authData.user) throw new Error('No user returned from sign up');

      await saveUserToSupabase(authData.user, {
        display_name: data.displayName,
      });

      const user = await convertSupabaseUser(authData.user);
      
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
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
      let supabaseProvider: 'google' | 'github' | 'apple';
      
      switch (provider) {
        case 'google':
          supabaseProvider = 'google';
          break;
        default:
          throw new Error(`Provider ${provider} not implemented yet`);
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: supabaseProvider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // Note: OAuth flow will redirect, so we handle the user in the auth state change listener
      return {} as User; // This will be updated by the auth state listener
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Update profile
  const updateProfile = async (data: UpdateProfileData): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          display_name: data.displayName,
          photo_url: data.photoURL,
        },
      });

      if (updateError) throw updateError;
      
      // Update users table
      const { error: dbError } = await supabase
        .from('users')
        .update({
          display_name: data.displayName,
          photo_url: data.photoURL,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (dbError) throw dbError;

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !state.user) throw new Error('No authenticated user');

    try {
      const updatedPreferences = { ...state.user.preferences, ...preferences };
      
      const { error } = await supabase
        .from('users')
        .update({
          preferences: updatedPreferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_USER', payload: { preferences: updatedPreferences } });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Send email verification
  const sendEmailVerification = async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');
    
    try {
      // Supabase sends email verification automatically on signup
      // For resending, we can use the resend endpoint
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email!,
      });
      
      if (error) throw error;
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      });
      
      if (signInError) throw new Error('Current password is incorrect');
      
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Update email
  const updateEmail = async (newEmail: string, password: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    try {
      // First verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: password,
      });
      
      if (signInError) throw new Error('Current password is incorrect');
      
      // Update email
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });
      
      if (error) throw error;
      
      // Update users table
      const { error: dbError } = await supabase
        .from('users')
        .update({
          email: newEmail,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (dbError) throw dbError;

      dispatch({ type: 'UPDATE_USER', payload: { email: newEmail } });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Delete account
  const deleteAccount = async (password: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    try {
      // First verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: password,
      });
      
      if (signInError) throw new Error('Current password is incorrect');
      
      // Delete user data from database (tables will cascade delete due to foreign keys)
      const { error: dbError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (dbError) throw dbError;
      
      // Delete user account
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;
      
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

  // Refresh token
  const refreshToken = async (): Promise<void> => {
    const { error } = await supabase.auth.refreshSession();
    if (error) throw error;
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

  // Initialize auth state and listen to changes
  useEffect(() => {
    let isMounted = true;
    let initialized = false;

    // Listen to auth state changes FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      console.log('Auth event:', event, session ? 'has session' : 'no session');
      
      try {
        if (event === 'INITIAL_SESSION') {
          // Handle initial session - this is the key for remember me
          if (session?.user) {
            const user = await convertSupabaseUser(session.user);
            dispatch({ type: 'SET_USER', payload: user });
            refreshSessionActivity();
          } else {
            dispatch({ type: 'SET_USER', payload: null });
          }
          initialized = true;
          dispatch({ type: 'SET_LOADING', payload: false });
        } else if (event === 'SIGNED_IN') {
          const user = await convertSupabaseUser(session!.user);
          dispatch({ type: 'SET_USER', payload: user });
          refreshSessionActivity();
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'SET_USER', payload: null });
        } else if (event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            const user = await convertSupabaseUser(session.user);
            dispatch({ type: 'SET_USER', payload: user });
            refreshSessionActivity();
          }
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        dispatch({ type: 'SET_USER', payload: null });
        if (event === 'INITIAL_SESSION') {
          initialized = true;
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    });

    // Fallback timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (!initialized && isMounted) {
        console.log('Auth initialization timeout - forcing completion');
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
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