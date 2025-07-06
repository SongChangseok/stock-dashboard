import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail } from '../../utils/authUtils';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ isOpen, onClose }) => {
  const { resetPassword, loading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    clearError();

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setValidationError(emailValidation.error!);
      return;
    }

    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (error: any) {
      // Error is handled by the auth context
    }
  };

  const handleClose = () => {
    setEmail('');
    setIsSubmitted(false);
    setValidationError('');
    clearError();
    onClose();
  };

  const handleBackToLogin = () => {
    setIsSubmitted(false);
    setEmail('');
    setValidationError('');
    clearError();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-spotify-dark-gray rounded-2xl border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            {isSubmitted ? (
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            ) : (
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
            )}
            <h2 className="text-xl font-semibold text-white">
              {isSubmitted ? 'Check Your Email' : 'Reset Password'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSubmitted ? (
            /* Success State */
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">
                Reset Link Sent!
              </h3>
              
              <p className="text-gray-400 mb-6 leading-relaxed">
                We've sent a password reset link to{' '}
                <span className="text-white font-medium">{email}</span>.
                Check your email and follow the instructions to reset your password.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleBackToLogin}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-primary text-white font-semibold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </button>

                <button
                  onClick={handleClose}
                  className="w-full text-gray-400 hover:text-white font-medium py-3 px-6 border border-white/20 rounded-xl hover:bg-white/5 transition-all duration-200"
                >
                  Close
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-gray-400 text-sm">
                  Didn't receive the email? Check your spam folder or try again in a few minutes.
                </p>
              </div>
            </div>
          ) : (
            /* Reset Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-gray-400 leading-relaxed">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Error Display */}
              {(error || validationError) && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error || validationError}</p>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setValidationError('');
                      clearError();
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email address"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full bg-gradient-primary text-white font-semibold py-3 px-6 rounded-xl hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending Reset Link...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Reset Link
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full text-gray-400 hover:text-white font-medium py-3 px-6 border border-white/20 rounded-xl hover:bg-white/5 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordResetModal;