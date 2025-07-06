import {
  AuthError,
  AuthErrorInfo,
  ValidationRules,
  VALIDATION_RULES,
  RegisterData,
  LoginCredentials,
} from '../types/auth';

// Error mapping for user-friendly messages
export const AUTH_ERRORS: Record<AuthError, AuthErrorInfo> = {
  'auth/user-not-found': {
    code: 'auth/user-not-found',
    message: 'User not found',
    userMessage: 'No account found with this email address.',
  },
  'auth/wrong-password': {
    code: 'auth/wrong-password',
    message: 'Wrong password',
    userMessage: 'Incorrect password. Please try again.',
  },
  'auth/email-already-in-use': {
    code: 'auth/email-already-in-use',
    message: 'Email already in use',
    userMessage: 'An account with this email already exists.',
  },
  'auth/weak-password': {
    code: 'auth/weak-password',
    message: 'Weak password',
    userMessage: 'Password is too weak. Please choose a stronger password.',
  },
  'auth/invalid-email': {
    code: 'auth/invalid-email',
    message: 'Invalid email',
    userMessage: 'Please enter a valid email address.',
  },
  'auth/user-disabled': {
    code: 'auth/user-disabled',
    message: 'User disabled',
    userMessage: 'This account has been disabled. Contact support for assistance.',
  },
  'auth/too-many-requests': {
    code: 'auth/too-many-requests',
    message: 'Too many requests',
    userMessage: 'Too many failed attempts. Please try again later.',
  },
  'auth/network-request-failed': {
    code: 'auth/network-request-failed',
    message: 'Network request failed',
    userMessage: 'Network error. Please check your connection and try again.',
  },
  'auth/email-not-verified': {
    code: 'auth/email-not-verified',
    message: 'Email not verified',
    userMessage: 'Please verify your email address before continuing.',
  },
  'unknown-error': {
    code: 'unknown-error',
    message: 'Unknown error',
    userMessage: 'An unexpected error occurred. Please try again.',
  },
};

// Get user-friendly error message
export const getAuthErrorMessage = (error: any): string => {
  const errorCode = error?.code as AuthError;
  const errorInfo = AUTH_ERRORS[errorCode] || AUTH_ERRORS['unknown-error'];
  return errorInfo.userMessage;
};

// Validation functions
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!VALIDATION_RULES.email.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const rules = VALIDATION_RULES.password;
  
  if (password.length < rules.minLength) {
    errors.push(`Password must be at least ${rules.minLength} characters long`);
  }
  
  if (rules.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (rules.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (rules.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (rules.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateDisplayName = (displayName: string): { isValid: boolean; error?: string } => {
  const rules = VALIDATION_RULES.displayName;
  
  if (!displayName.trim()) {
    return { isValid: false, error: 'Display name is required' };
  }
  
  if (displayName.length < rules.minLength) {
    return { isValid: false, error: `Display name must be at least ${rules.minLength} characters long` };
  }
  
  if (displayName.length > rules.maxLength) {
    return { isValid: false, error: `Display name must be less than ${rules.maxLength} characters long` };
  }
  
  return { isValid: true };
};

// Validate login credentials
export const validateLoginCredentials = (credentials: LoginCredentials): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  const emailValidation = validateEmail(credentials.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error!;
  }
  
  if (!credentials.password) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate registration data
export const validateRegistrationData = (data: RegisterData): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error!;
  }
  
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors[0]; // Show first error
  }
  
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  if (data.displayName) {
    const displayNameValidation = validateDisplayName(data.displayName);
    if (!displayNameValidation.isValid) {
      errors.displayName = displayNameValidation.error!;
    }
  }
  
  if (!data.acceptTerms) {
    errors.acceptTerms = 'You must accept the terms and conditions';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Password strength calculator
export const calculatePasswordStrength = (password: string): { strength: number; label: string; color: string } => {
  let score = 0;
  const checks = [
    password.length >= 8,
    password.length >= 12,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[!@#$%^&*(),.?":{}|<>]/.test(password),
  ];
  
  score = checks.filter(Boolean).length;
  
  if (score <= 2) {
    return { strength: score, label: 'Weak', color: '#EF4444' };
  } else if (score <= 4) {
    return { strength: score, label: 'Medium', color: '#F59E0B' };
  } else {
    return { strength: score, label: 'Strong', color: '#10B981' };
  }
};

// Email domain validation for corporate emails
export const isValidEmailDomain = (email: string): boolean => {
  const domain = email.split('@')[1];
  if (!domain) return false;
  
  // List of allowed domains (can be configured)
  const allowedDomains = [
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
    'icloud.com',
    // Add more domains as needed
  ];
  
  // Allow all domains for now, but this can be restricted
  return true;
};

// Generate secure display name from email
export const generateDisplayNameFromEmail = (email: string): string => {
  const username = email.split('@')[0];
  return username.charAt(0).toUpperCase() + username.slice(1);
};

// Format auth error for logging
export const formatAuthErrorForLogging = (error: any): string => {
  return JSON.stringify({
    code: error?.code || 'unknown',
    message: error?.message || 'Unknown error',
    stack: error?.stack || 'No stack trace',
    timestamp: new Date().toISOString(),
  });
};

// Check if user needs to verify email
export const shouldVerifyEmail = (user: any): boolean => {
  return user && !user.emailVerified;
};

// Generate password reset email template data
export const getPasswordResetEmailData = (email: string) => ({
  to: email,
  subject: 'Reset Your Stock Dashboard Password',
  template: 'password-reset',
  context: {
    resetUrl: `${window.location.origin}/auth/reset-password`,
    supportEmail: 'support@stockdashboard.com',
  },
});

// Session timeout utilities
export const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

export const isSessionExpired = (lastActivity: number): boolean => {
  return Date.now() - lastActivity > SESSION_TIMEOUT;
};

export const refreshSessionActivity = (): void => {
  localStorage.setItem('lastActivity', Date.now().toString());
};

export const getLastActivity = (): number => {
  const lastActivity = localStorage.getItem('lastActivity');
  return lastActivity ? parseInt(lastActivity, 10) : Date.now();
};