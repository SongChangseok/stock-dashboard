import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthScreen from './AuthScreen';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireEmailVerification = false 
}) => {
  const { user, loading, isAuthenticated, isEmailVerified } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <LoadingSpinner message="Checking authentication..." />
      </div>
    );
  }

  // Show auth screen if not authenticated
  if (!isAuthenticated || !user) {
    return <AuthScreen />;
  }

  // Show email verification notice if required and not verified
  if (requireEmailVerification && !isEmailVerified) {
    return <EmailVerificationRequired />;
  }

  // User is authenticated, render protected content
  return <>{children}</>;
};

// Email verification required component
const EmailVerificationRequired: React.FC = () => {
  const { sendEmailVerification, signOut, user } = useAuth();
  const [isSending, setIsSending] = React.useState(false);
  const [emailSent, setEmailSent] = React.useState(false);

  const handleSendVerification = async () => {
    setIsSending(true);
    try {
      await sendEmailVerification();
      setEmailSent(true);
    } catch (error) {
      console.error('Failed to send verification email:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark px-4">
      <div className="w-full max-w-md">
        <div className="glass-card-dark rounded-2xl p-8 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-full mb-6">
            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-4">
            Verify Your Email
          </h2>

          {/* Description */}
          <p className="text-gray-400 mb-6 leading-relaxed">
            We've sent a verification link to{' '}
            <span className="text-white font-medium">{user?.email}</span>.
            Please check your email and click the link to verify your account.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            {emailSent ? (
              <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                <p className="text-green-400 text-sm">
                  ✓ Verification email sent! Please check your inbox.
                </p>
              </div>
            ) : (
              <button
                onClick={handleSendVerification}
                disabled={isSending}
                className="w-full bg-gradient-primary text-white font-semibold py-3 px-6 rounded-xl hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Resend Verification Email
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleSignOut}
              className="w-full text-gray-400 hover:text-white font-medium py-3 px-6 border border-white/20 rounded-xl hover:bg-white/5 transition-all duration-200"
            >
              Sign Out
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-gray-400 text-sm">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={handleSendVerification}
                className="text-spotify-green hover:text-spotify-green-hover font-medium"
              >
                try again
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute;