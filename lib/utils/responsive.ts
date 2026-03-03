/**
 * Responsive Design Utilities
 * Provides consistent responsive patterns across the application
 */

/**
 * Breakpoints (matching Tailwind CSS defaults)
 */
export const breakpoints = {
  sm: 640,   // Small devices (landscape phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (desktops)
  xl: 1280,  // Extra large devices (large desktops)
  '2xl': 1536, // 2X large devices (larger desktops)
} as const;

/**
 * Common responsive class patterns
 */
export const responsivePatterns = {
  // Container widths
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  containerNarrow: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
  containerWide: 'max-w-full mx-auto px-4 sm:px-6 lg:px-8',

  // Grid layouts
  grid2Col: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  grid3Col: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  grid4Col: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',

  // Flex layouts
  flexStack: 'flex flex-col space-y-4',
  flexRow: 'flex flex-col sm:flex-row gap-4',
  flexBetween: 'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4',

  // Form layouts
  formGroup: 'space-y-4',
  formRow: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  formRowThree: 'grid grid-cols-1 md:grid-cols-3 gap-4',

  // Card layouts
  cardGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
  cardList: 'space-y-4',

  // Navigation
  navHorizontal: 'hidden md:flex md:space-x-8',
  navMobile: 'md:hidden',

  // Spacing
  sectionSpacing: 'space-y-6',
  pageSpacing: 'py-8',

  // Text sizing
  headingLarge: 'text-2xl sm:text-3xl font-bold',
  headingMedium: 'text-xl sm:text-2xl font-bold',
  headingSmall: 'text-lg sm:text-xl font-semibold',

  // Button sizing
  buttonFull: 'w-full sm:w-auto',
  buttonGroup: 'flex flex-col sm:flex-row gap-2',
} as const;

/**
 * Get responsive padding classes
 */
export function getResponsivePadding(size: 'sm' | 'md' | 'lg' = 'md'): string {
  const sizes = {
    sm: 'p-4 sm:p-6',
    md: 'p-6 sm:p-8',
    lg: 'p-8 sm:p-12',
  };
  return sizes[size];
}

/**
 * Get responsive margin classes
 */
export function getResponsiveMargin(size: 'sm' | 'md' | 'lg' = 'md'): string {
  const sizes = {
    sm: 'm-4 sm:m-6',
    md: 'm-6 sm:m-8',
    lg: 'm-8 sm:m-12',
  };
  return sizes[size];
}

/**
 * Get responsive text size classes
 */
export function getResponsiveTextSize(size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' = 'base'): string {
  const sizes = {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
  };
  return sizes[size];
}

/**
 * Check if device is mobile (client-side only)
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < breakpoints.md;
}

/**
 * Check if device is tablet (client-side only)
 */
export function isTabletDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints.md && window.innerWidth < breakpoints.lg;
}

/**
 * Check if device is desktop (client-side only)
 */
export function isDesktopDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints.lg;
}

/**
 * Get current breakpoint (client-side only)
 */
export function getCurrentBreakpoint(): keyof typeof breakpoints | null {
  if (typeof window === 'undefined') return null;
  
  const width = window.innerWidth;
  
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  
  return null;
}

/**
 * Responsive table wrapper classes
 */
export const responsiveTable = {
  wrapper: 'overflow-x-auto',
  table: 'min-w-full divide-y divide-gray-200',
  hideOnMobile: 'hidden md:table-cell',
  showOnMobile: 'md:hidden',
} as const;

/**
 * Touch-friendly sizing for mobile
 */
export const touchFriendly = {
  button: 'min-h-[44px] min-w-[44px]', // Apple's recommended minimum
  input: 'min-h-[44px]',
  checkbox: 'h-5 w-5 sm:h-4 sm:w-4',
  radio: 'h-5 w-5 sm:h-4 sm:w-4',
} as const;
