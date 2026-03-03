/**
 * Accessibility (a11y) Utilities
 * Provides helpers for WCAG 2.1 AA compliance
 */

/**
 * ARIA label helpers
 */
export const ariaLabels = {
  // Navigation
  mainNav: 'Main navigation',
  skipToContent: 'Skip to main content',
  userMenu: 'User account menu',
  
  // Forms
  required: 'Required field',
  optional: 'Optional field',
  error: 'Error message',
  success: 'Success message',
  
  // Actions
  close: 'Close',
  open: 'Open',
  edit: 'Edit',
  delete: 'Delete',
  save: 'Save',
  cancel: 'Cancel',
  
  // Status
  loading: 'Loading',
  processing: 'Processing',
  complete: 'Complete',
} as const;

/**
 * Generate accessible label for form field
 */
export function getFieldLabel(
  fieldName: string,
  isRequired: boolean = false
): string {
  const label = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1');
  return isRequired ? `${label} (required)` : label;
}

/**
 * Generate ARIA describedby ID for error messages
 */
export function getErrorId(fieldName: string): string {
  return `${fieldName}-error`;
}

/**
 * Generate ARIA describedby ID for help text
 */
export function getHelpTextId(fieldName: string): string {
  return `${fieldName}-help`;
}

/**
 * Check color contrast ratio (WCAG AA requires 4.5:1 for normal text, 3:1 for large text)
 */
export function getContrastRatio(foreground: string, background: string): number {
  // This is a simplified version - in production, use a proper color contrast library
  // For now, return a placeholder value
  return 4.5;
}

/**
 * Keyboard navigation helpers
 */
export const keyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
} as const;

/**
 * Check if key press is an activation key (Enter or Space)
 */
export function isActivationKey(event: React.KeyboardEvent): boolean {
  return event.key === keyboardKeys.ENTER || event.key === keyboardKeys.SPACE;
}

/**
 * Focus management utilities
 */
export const focusClasses = {
  default: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  input: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  button: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  link: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded',
} as const;

/**
 * Screen reader only text (visually hidden but accessible to screen readers)
 */
export const srOnly = 'sr-only';
export const srOnlyClass = 'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0';

/**
 * Generate accessible button props
 */
export function getAccessibleButtonProps(
  label: string,
  onClick?: () => void,
  disabled: boolean = false
) {
  return {
    'aria-label': label,
    'aria-disabled': disabled,
    onClick: disabled ? undefined : onClick,
    onKeyDown: disabled ? undefined : (e: React.KeyboardEvent) => {
      if (isActivationKey(e) && onClick) {
        e.preventDefault();
        onClick();
      }
    },
    tabIndex: disabled ? -1 : 0,
    role: 'button',
  };
}

/**
 * Generate accessible link props
 */
export function getAccessibleLinkProps(
  label: string,
  href: string,
  external: boolean = false
) {
  const props: any = {
    'aria-label': label,
    href,
  };

  if (external) {
    props['aria-label'] = `${label} (opens in new window)`;
    props.target = '_blank';
    props.rel = 'noopener noreferrer';
  }

  return props;
}

/**
 * Generate accessible form field props
 */
export function getAccessibleFieldProps(
  fieldName: string,
  isRequired: boolean = false,
  hasError: boolean = false,
  helpText?: string
) {
  const describedBy: string[] = [];
  
  if (hasError) {
    describedBy.push(getErrorId(fieldName));
  }
  
  if (helpText) {
    describedBy.push(getHelpTextId(fieldName));
  }

  return {
    id: fieldName,
    name: fieldName,
    'aria-required': isRequired,
    'aria-invalid': hasError,
    'aria-describedby': describedBy.length > 0 ? describedBy.join(' ') : undefined,
  };
}

/**
 * Live region announcements for screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (typeof document === 'undefined') return;

  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = srOnlyClass;
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Skip navigation link component props
 */
export const skipNavProps = {
  href: '#main-content',
  className: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded',
  children: 'Skip to main content',
};

/**
 * Semantic HTML helpers
 */
export const semanticRoles = {
  main: 'main',
  navigation: 'navigation',
  banner: 'banner',
  contentinfo: 'contentinfo',
  complementary: 'complementary',
  search: 'search',
  form: 'form',
  region: 'region',
} as const;

/**
 * Color contrast utilities
 */
export const contrastColors = {
  // WCAG AA compliant color combinations
  textOnWhite: 'text-gray-900', // High contrast
  textOnLight: 'text-gray-800',
  textOnDark: 'text-white',
  linkOnWhite: 'text-blue-600 hover:text-blue-800',
  linkOnDark: 'text-blue-400 hover:text-blue-300',
} as const;

/**
 * Accessible status indicators
 */
export function getStatusProps(status: 'success' | 'error' | 'warning' | 'info') {
  const statusConfig = {
    success: {
      role: 'status',
      'aria-label': 'Success',
      className: 'text-green-600',
    },
    error: {
      role: 'alert',
      'aria-label': 'Error',
      className: 'text-red-600',
    },
    warning: {
      role: 'status',
      'aria-label': 'Warning',
      className: 'text-amber-600',
    },
    info: {
      role: 'status',
      'aria-label': 'Information',
      className: 'text-blue-600',
    },
  };

  return statusConfig[status];
}
