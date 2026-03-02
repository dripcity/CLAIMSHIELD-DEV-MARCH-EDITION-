import { formatCurrency, formatDate } from '@/lib/utils/formatting';

export function generateGenericDemandLetter(appraisal: any): string {
  const { ownerInfo, insuranceInfo, subjectVehicle, valuationResults, accidentDate } = appraisal;
  
  return `
${ownerInfo?.firstName} ${ownerInfo?.lastName}
${ownerInfo?.address}
${ownerInfo?.city}, ${ownerInfo?.state} ${ownerInfo?.zip}
${ownerInfo?.email}
${ownerInfo?.phone}

${formatDate(new Date())}

${insuranceInfo?.company}
Claims Department
Attn: ${insuranceInfo?.adjusterName || 'Claims Adjuster'}
${insuranceInfo?.adjusterEmail || ''}

RE: Diminished Value Claim
    Policy Number: ${insuranceInfo?.policyNumber}
    Claim Number: ${insuranceInfo?.claimNumber}
    Vehicle: ${subjectVehicle?.year} ${subjectVehicle?.make} ${subjectVehicle?.model}
    VIN: ${subjectVehicle?.vin}
    Date of Loss: ${formatDate(accidentDate || new Date())}

Dear Claims Representative:

This letter constitutes formal demand for payment of diminished value. I am the owner of the above-referenced vehicle, which sustained damage in an accident on ${formatDate(accidentDate || new Date())}.

While the vehicle has been repaired, it has suffered a permanent loss in fair market value due to its accident history. This loss is known as "diminished value" and is a compensable element of damages under general tort law principles.

**Diminished Value Amount: ${formatCurrency(valuationResults?.diminishedValue || 0)}**

I have obtained a professional diminished value appraisal using the comparable sales method, which is a widely accepted approach for establishing the difference in market value. The appraisal compares actual market transactions of similar vehicles with and without accident history to determine the measurable loss in value.

I have attached the complete appraisal report for your review. Please remit payment within 30 days to resolve this claim.

Sincerely,

${ownerInfo?.firstName} ${ownerInfo?.lastName}
`;
}
