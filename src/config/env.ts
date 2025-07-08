// Environment variable configuration and validation
// Centralized environment variable management with validation and type safety

/// <reference types="vite/client" />

interface EnvConfig {
  // Supabase Configuration
  supabase: {
    url: string;
    anonKey: string;
  };
  
  // News API Configuration
  newsApi: {
    apiKey: string;
    baseUrl: string;
  };
  
  // Environment
  isDevelopment: boolean;
  isProduction: boolean;
}

// Environment variable validation schema
const envSchema = {
  required: [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ],
  optional: [
    'VITE_NEWS_API_KEY',
    'VITE_NEWS_API_BASE_URL',
  ],
};

// Get environment variable with fallback
const getEnvVar = (key: string, fallback?: string): string => {
  // Support both Vite (import.meta.env) and Create React App (process.env)
  let value: string | undefined;
  
  // Try Vite environment variables first
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    value = (import.meta.env as Record<string, string>)[key];
  }
  
  // Fallback to process.env for compatibility
  if (value === undefined && typeof process !== 'undefined' && process.env) {
    value = process.env[key];
  }
  
  if (value === undefined || value === null || value === '') {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Environment variable ${key} is not defined`);
  }
  
  return String(value);
};

// Get boolean environment variable
const getBooleanEnvVar = (key: string, fallback: boolean = false): boolean => {
  try {
    const value = getEnvVar(key, fallback.toString());
    return value.toLowerCase() === 'true';
  } catch {
    return fallback;
  }
};

// Get number environment variable
const getNumberEnvVar = (key: string, fallback: number): number => {
  try {
    const value = getEnvVar(key, fallback.toString());
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? fallback : parsed;
  } catch {
    return fallback;
  }
};

// Validate required environment variables
const validateRequiredEnvVars = (): void => {
  const missing: string[] = [];
  
  for (const key of envSchema.required) {
    try {
      const value = getEnvVar(key);
      if (!value || value.trim() === '') {
        missing.push(key);
      }
    } catch {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
};

// Validate API key format
const validateApiKey = (key: string, name: string): void => {
  if (!key || key === 'demo' || key.includes('your_') || key.includes('_here')) {
    console.warn(`${name} API key appears to be a placeholder. Please set a valid API key.`);
  }
};

// Create environment configuration
const createEnvConfig = (): EnvConfig => {
  // Validate required variables first
  validateRequiredEnvVars();
  
  const config: EnvConfig = {
    supabase: {
      url: getEnvVar('VITE_SUPABASE_URL'),
      anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY'),
    },
    
    newsApi: {
      apiKey: getEnvVar('VITE_NEWS_API_KEY', ''),
      baseUrl: getEnvVar('VITE_NEWS_API_BASE_URL', 'https://newsapi.org/v2'),
    },
    
    isDevelopment: (
      (typeof import.meta !== 'undefined' && import.meta.env.MODE === 'development') ||
      (typeof process !== 'undefined' && process.env.NODE_ENV === 'development')
    ),
    isProduction: (
      (typeof import.meta !== 'undefined' && import.meta.env.MODE === 'production') ||
      (typeof process !== 'undefined' && process.env.NODE_ENV === 'production')
    ),
  };
  
  // Validate API keys
  validateApiKey(config.supabase.url, 'Supabase URL');
  validateApiKey(config.supabase.anonKey, 'Supabase');
  
  if (config.newsApi.apiKey) {
    validateApiKey(config.newsApi.apiKey, 'News API');
  }
  
  // Log configuration in development
  if (config.isDevelopment) {
    console.log('Environment configuration loaded:', {
      supabase: {
        url: config.supabase.url,
        anonKey: config.supabase.anonKey ? '***' : 'not set',
      },
      newsApi: {
        apiKey: config.newsApi.apiKey ? '***' : 'not set',
        baseUrl: config.newsApi.baseUrl,
      },
      environment: config.isDevelopment ? 'development' : 'production',
    });
  }
  
  return config;
};

// Export environment configuration
export const env = createEnvConfig();

// Export utility functions for testing
export const envUtils = {
  getEnvVar,
  getBooleanEnvVar,
  getNumberEnvVar,
  validateRequiredEnvVars,
  validateApiKey,
};

// Export types
export type { EnvConfig };