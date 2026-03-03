/**
 * Role-Based Access Control (RBAC) utilities
 * Enforces role permissions across the application
 */

export type UserRole = 'individual' | 'appraiser' | 'attorney' | 'body_shop' | 'admin';

export interface RolePermissions {
  canAccessUSPAPFeatures: boolean;
  canManageTeam: boolean;
  canAccessWhiteLabel: boolean;
  canGenerateExpertAffidavit: boolean;
  canViewAllAppraisals: boolean;
  canDeleteAppraisals: boolean;
  canManageBilling: boolean;
}

/**
 * Get permissions for a given role
 */
export function getRolePermissions(role: UserRole): RolePermissions {
  const permissions: Record<UserRole, RolePermissions> = {
    individual: {
      canAccessUSPAPFeatures: false,
      canManageTeam: false,
      canAccessWhiteLabel: false,
      canGenerateExpertAffidavit: false,
      canViewAllAppraisals: false,
      canDeleteAppraisals: true,
      canManageBilling: true,
    },
    appraiser: {
      canAccessUSPAPFeatures: true,
      canManageTeam: false,
      canAccessWhiteLabel: false,
      canGenerateExpertAffidavit: true,
      canViewAllAppraisals: false,
      canDeleteAppraisals: true,
      canManageBilling: true,
    },
    attorney: {
      canAccessUSPAPFeatures: false,
      canManageTeam: true,
      canAccessWhiteLabel: false,
      canGenerateExpertAffidavit: false,
      canViewAllAppraisals: true,
      canDeleteAppraisals: true,
      canManageBilling: true,
    },
    body_shop: {
      canAccessUSPAPFeatures: false,
      canManageTeam: false,
      canAccessWhiteLabel: true,
      canGenerateExpertAffidavit: false,
      canViewAllAppraisals: false,
      canDeleteAppraisals: true,
      canManageBilling: true,
    },
    admin: {
      canAccessUSPAPFeatures: true,
      canManageTeam: true,
      canAccessWhiteLabel: true,
      canGenerateExpertAffidavit: true,
      canViewAllAppraisals: true,
      canDeleteAppraisals: true,
      canManageBilling: true,
    },
  };

  return permissions[role];
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  role: UserRole,
  permission: keyof RolePermissions
): boolean {
  const permissions = getRolePermissions(role);
  return permissions[permission];
}

/**
 * Throw an error if user doesn't have required permission
 */
export function requirePermission(
  role: UserRole,
  permission: keyof RolePermissions,
  errorMessage?: string
): void {
  if (!hasPermission(role, permission)) {
    throw new Error(errorMessage || `Permission denied: ${permission} required`);
  }
}

/**
 * Check if user can access a specific feature
 */
export function canAccessFeature(role: UserRole, feature: string): boolean {
  const featurePermissions: Record<string, keyof RolePermissions> = {
    'uspap-certification': 'canAccessUSPAPFeatures',
    'team-management': 'canManageTeam',
    'white-label': 'canAccessWhiteLabel',
    'expert-affidavit': 'canGenerateExpertAffidavit',
  };

  const permission = featurePermissions[feature];
  if (!permission) {
    return false;
  }

  return hasPermission(role, permission);
}

/**
 * Get user-friendly role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    individual: 'Individual',
    appraiser: 'Professional Appraiser',
    attorney: 'Attorney',
    body_shop: 'Body Shop',
    admin: 'Administrator',
  };

  return displayNames[role];
}

/**
 * Get available features for a role
 */
export function getAvailableFeatures(role: UserRole): string[] {
  const permissions = getRolePermissions(role);
  const features: string[] = [];

  if (permissions.canAccessUSPAPFeatures) {
    features.push('USPAP Certification');
    features.push('Professional Signature');
  }

  if (permissions.canManageTeam) {
    features.push('Team Management');
    features.push('Paralegal Accounts');
  }

  if (permissions.canAccessWhiteLabel) {
    features.push('White-Label Branding');
    features.push('Custom Reports');
  }

  if (permissions.canGenerateExpertAffidavit) {
    features.push('Expert Witness Affidavit');
  }

  return features;
}
