export function getDashboardWizardRoute(appraisalId: string, step: number): string {
  return `/dashboard/appraisals/${appraisalId}/wizard?step=${step}`;
}

export function getDashboardPreviewRoute(appraisalId: string): string {
  return `/dashboard/appraisals/${appraisalId}/preview`;
}
