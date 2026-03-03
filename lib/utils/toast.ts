/**
 * Toast Notification Utilities
 * Wrapper around shadcn/ui toast for consistent notifications
 */

import { toast as shadcnToast } from '@/components/hooks/use-toast';

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Show success toast
 */
export function showSuccessToast(message: string, options?: ToastOptions) {
  const { action, ...restOptions } = options || {};
  shadcnToast({
    title: restOptions?.title || 'Success',
    description: message,
    duration: restOptions?.duration || 3000,
    variant: 'default',
    ...restOptions,
  });
}

/**
 * Show error toast
 */
export function showErrorToast(message: string, options?: ToastOptions) {
  const { action, ...restOptions } = options || {};
  shadcnToast({
    title: restOptions?.title || 'Error',
    description: message,
    duration: restOptions?.duration || 5000,
    variant: 'destructive',
    ...restOptions,
  });
}

/**
 * Show warning toast
 */
export function showWarningToast(message: string, options?: ToastOptions) {
  const { action, ...restOptions } = options || {};
  shadcnToast({
    title: restOptions?.title || 'Warning',
    description: message,
    duration: restOptions?.duration || 4000,
    ...restOptions,
  });
}

/**
 * Show info toast
 */
export function showInfoToast(message: string, options?: ToastOptions) {
  const { action, ...restOptions } = options || {};
  shadcnToast({
    title: restOptions?.title || 'Info',
    description: message,
    duration: restOptions?.duration || 3000,
    ...restOptions,
  });
}

/**
 * Show loading toast
 */
export function showLoadingToast(message: string) {
  return shadcnToast({
    title: 'Loading',
    description: message,
    duration: Infinity, // Don't auto-dismiss
  });
}

/**
 * Show auto-save confirmation
 */
export function showAutoSaveToast() {
  shadcnToast({
    description: 'Draft saved',
    duration: 2000,
  });
}

/**
 * Show retry toast with action
 */
export function showRetryToast(message: string, onRetry: () => void) {
  shadcnToast({
    title: 'Error',
    description: `${message} Click to retry.`,
    duration: 5000,
    variant: 'destructive',
  });
}

/**
 * Toast presets for common operations
 */
export const toastPresets = {
  // File operations
  fileUploaded: () => showSuccessToast('File uploaded successfully'),
  fileUploadFailed: (error?: string) => showErrorToast(error || 'Failed to upload file'),
  fileDeleted: () => showSuccessToast('File deleted'),
  
  // Appraisal operations
  appraisalCreated: () => showSuccessToast('Appraisal created'),
  appraisalUpdated: () => showSuccessToast('Appraisal updated'),
  appraisalDeleted: () => showSuccessToast('Appraisal deleted'),
  appraisalSaved: () => showAutoSaveToast(),
  
  // PDF generation
  pdfGenerating: () => showLoadingToast('Generating PDF report...'),
  pdfGenerated: () => showSuccessToast('PDF report generated successfully'),
  pdfFailed: () => showErrorToast('Failed to generate PDF report'),
  
  // Calculations
  calculationComplete: () => showSuccessToast('Valuation calculated'),
  calculationFailed: () => showErrorToast('Failed to calculate valuation'),
  
  // Comparables
  comparablesFound: (count: number) => showSuccessToast(`Found ${count} comparable vehicles`),
  comparablesNotFound: () => showWarningToast('No comparable vehicles found. Try adjusting search criteria'),
  
  // Email
  emailSent: () => showSuccessToast('Report sent via email'),
  emailFailed: () => showErrorToast('Failed to send email'),
  
  // Payment
  paymentSuccess: () => showSuccessToast('Payment processed successfully'),
  paymentFailed: () => showErrorToast('Payment failed. Please try again'),
  
  // Authentication
  signedIn: () => showSuccessToast('Signed in successfully'),
  signedOut: () => showSuccessToast('Signed out successfully'),
  sessionExpired: () => showWarningToast('Your session has expired. Please sign in again'),
  
  // Network
  networkError: () => showErrorToast('Network error. Please check your connection'),
  timeout: () => showErrorToast('Request timed out. Please try again'),
  
  // Validation
  validationError: (message: string) => showErrorToast(message),
  requiredFields: () => showWarningToast('Please fill in all required fields'),
  
  // Generic
  success: (message: string) => showSuccessToast(message),
  error: (message: string) => showErrorToast(message),
  warning: (message: string) => showWarningToast(message),
  info: (message: string) => showInfoToast(message),
};
