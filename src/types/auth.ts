// User interface for authentication
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt?: Date;
  lastLoginAt?: Date;
  preferences?: UserPreferences;
}

// User preferences interface
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    priceAlerts: boolean;
    newsAlerts: boolean;
  };
  dashboard: {
    defaultPortfolio?: string;
    refreshInterval: number;
    compactMode: boolean;
  };
  privacy: {
    shareData: boolean;
    analytics: boolean;
  };
}

// Authentication state interface
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
}

// Login credentials interface
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Registration data interface
export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName?: string;
  acceptTerms: boolean;
}

// Password reset interface
export interface PasswordResetData {
  email: string;
}

// Update profile interface
export interface UpdateProfileData {
  displayName?: string;
  photoURL?: string;
}

// Auth error types
export type AuthError = 
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/email-already-in-use'
  | 'auth/weak-password'
  | 'auth/invalid-email'
  | 'auth/user-disabled'
  | 'auth/too-many-requests'
  | 'auth/network-request-failed'
  | 'auth/email-not-verified'
  | 'unknown-error';

// Social provider types
export type SocialProvider = 'google' | 'apple' | 'github' | 'microsoft';

// Authentication methods
export interface AuthMethods {
  // Email/Password authentication
  signInWithEmail: (credentials: LoginCredentials) => Promise<User>;
  signUpWithEmail: (data: RegisterData) => Promise<User>;
  signOut: () => Promise<void>;
  
  // Social authentication
  signInWithSocial: (provider: SocialProvider) => Promise<User>;
  
  // Password management
  resetPassword: (email: string) => Promise<void>;
  confirmPasswordReset: (code: string, newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  
  // Email verification
  sendEmailVerification: () => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  
  // Profile management
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  updateEmail: (newEmail: string, password: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  
  // Session management
  refreshToken: () => Promise<void>;
  checkAuthState: () => Promise<User | null>;
}

// Auth context interface
export interface AuthContextType extends AuthState, AuthMethods {
  // Additional context methods
  clearError: () => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
}

// Auth error mapping
export interface AuthErrorInfo {
  code: AuthError;
  message: string;
  userMessage: string;
}

// Auth validation rules
export interface ValidationRules {
  email: RegExp;
  password: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  displayName: {
    minLength: number;
    maxLength: number;
  };
}

// Default user preferences
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'dark',
  notifications: {
    email: true,
    push: true,
    priceAlerts: true,
    newsAlerts: false,
  },
  dashboard: {
    refreshInterval: 30000,
    compactMode: false,
  },
  privacy: {
    shareData: false,
    analytics: true,
  },
};

// Validation rules constants
export const VALIDATION_RULES: ValidationRules = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },
  displayName: {
    minLength: 2,
    maxLength: 50,
  },
};