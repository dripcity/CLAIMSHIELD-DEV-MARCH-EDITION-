import { formatCurrency, formatDate } from '@/lib/utils/formatting';

export function generateGeorgiaDemandLetter(appraisal: any): string {
  const { ownerInfo, insuranceInfo, subjectVehicle, valuationResults, accidentDate } = appraisal;
  
  const claimType = insuranceInfo?.claimNumber?.startsWith('1P') ? 'first-party' : 'third-party';
  const statute = claimType === 'first-party' ? 'O.C.G.A. § 33-4-6' : 'O.C.G.A. § 33-4-7';
  
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

RE: Diminished Value Claim - 60-Day Demand
    Policy Number: ${insuranceInfo?.policyNumber}
    Claim Number: ${insuranceInfo?.claimNumber}
    Vehicle: ${subjectVehicle?.year} ${subjectVehicle?.make} ${subjectVehicle?.model}
    VIN: ${subjectVehicle?.vin}
    Date of Loss: ${formatDate(accidentDate || new Date())}

Dear Claims Representative:

This letter constitutes formal demand for payment of diminished value under ${statute}. I am the owner of the above-referenced vehicle, which sustained damage in an accident on ${formatDate(accidentDate || new Date())}.

While the vehicle has been repaired, it has suffered a permanent loss in fair market value due to its accident history. This loss is known as "diminished value" and is a compensable element of damages under Georgia law.

**Diminished Value Amount: ${formatCurrency(valuationResults?.diminishedValue || 0)}**

I have obtained a professional diminished value appraisal using the comparable sales method, which is the legally recognized methodology in Georgia. The appraisal compares actual market transactions of similar vehicles with and without accident history to determine the measurable loss in value.

Pursuant to ${statute}, you have 60 days from receipt of this demand to pay the diminished value claim. Failure to pay within 60 days may result in bad faith penalties of 50% of the claim amount plus attorney's fees and litigation costs.

I have attached the complete appraisal report for your review. Please remit payment within 60 days to avoid additional penalties.

Sincerely,

${ownerInfo?.firstName} ${ownerInfo?.lastName}
`;
}
