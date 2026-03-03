/**
 * USPAP (Uniform Standards of Professional Appraisal Practice) Compliance Statements
 * Used for professional appraiser reports
 */

export interface USPAPCompliance {
  certificationStatement: string;
  scopeOfWork: string;
  intendedUse: string;
  intendedUsers: string;
  assumptions: string[];
  limitingConditions: string[];
}

export function getUSPAPComplianceStatements(
  appraiserName: string,
  appraiserLicense: string
): USPAPCompliance {
  return {
    certificationStatement: `I certify that, to the best of my knowledge and belief:

• The statements of fact contained in this report are true and correct.
• The reported analyses, opinions, and conclusions are limited only by the reported assumptions and limiting conditions and are my personal, impartial, and unbiased professional analyses, opinions, and conclusions.
• I have no present or prospective interest in the property that is the subject of this report and no personal interest with respect to the parties involved.
• I have performed no services, as an appraiser or in any other capacity, regarding the property that is the subject of this report within the three-year period immediately preceding acceptance of this assignment.
• I have no bias with respect to the property that is the subject of this report or to the parties involved with this assignment.
• My engagement in this assignment was not contingent upon developing or reporting predetermined results.
• My compensation for completing this assignment is not contingent upon the development or reporting of a predetermined value or direction in value that favors the cause of the client, the amount of the value opinion, the attainment of a stipulated result, or the occurrence of a subsequent event directly related to the intended use of this appraisal.
• My analyses, opinions, and conclusions were developed, and this report has been prepared, in conformity with the Uniform Standards of Professional Appraisal Practice (USPAP).
• I have made a personal inspection of the property that is the subject of this report.
• No one provided significant professional assistance to the person signing this certification.

${appraiserName}
License: ${appraiserLicense}`,

    scopeOfWork: `This appraisal was prepared to determine the diminished value of the subject vehicle following accident-related repairs. The scope of work includes:

• Physical inspection of the subject vehicle (or review of detailed photographs and repair documentation)
• Analysis of repair estimates and invoices
• Research and analysis of comparable vehicle sales
• Application of appropriate adjustments for differences between the subject and comparable vehicles
• Calculation of pre-accident fair market value and post-repair actual cash value
• Determination of diminished value using the comparable sales method
• Preparation of this written appraisal report

The appraisal was conducted in accordance with USPAP Standards Rule 8 for personal property appraisal.`,

    intendedUse: `This appraisal is intended to be used for insurance claim settlement, litigation support, or negotiation purposes related to diminished value claims. The appraisal provides an opinion of the difference between the vehicle's fair market value before the accident and its actual cash value after repairs have been completed.`,

    intendedUsers: `The intended users of this appraisal are:
• The vehicle owner/claimant
• Insurance companies and adjusters
• Legal counsel representing the claimant
• Courts and arbitrators in litigation matters
• Other parties with a legitimate interest in the diminished value claim`,

    assumptions: [
      'All repairs were completed in a workmanlike manner using appropriate materials and techniques',
      'The vehicle was in the stated pre-accident condition prior to the loss',
      'All information provided by the client regarding the accident, repairs, and vehicle history is accurate and complete',
      'The vehicle has a clear title and is free from liens (except as disclosed)',
      'The vehicle is legally registered and insurable',
      'All comparable sales data obtained from third-party sources is accurate',
      'Market conditions remain relatively stable during the effective date of the appraisal',
    ],

    limitingConditions: [
      'This appraisal is valid only for the effective date stated in the report',
      'The appraiser assumes no responsibility for matters of a legal nature affecting the property',
      'The appraiser is not required to give testimony or appear in court regarding this appraisal unless prior arrangements have been made',
      'Possession of this report does not carry with it the right of publication',
      'The appraiser reserves the right to make corrections or amendments to this report if additional information becomes available',
      'This appraisal is based on the assumption that the vehicle will continue to be used for its intended purpose',
      'The distribution of the valuation in this report between components is invalid if used separately',
      'The appraiser is not responsible for hidden or unapparent conditions that may affect value',
      'No environmental assessment was performed as part of this appraisal',
      'The appraiser has not verified the accuracy of repair costs with the repair facility',
    ],
  };
}

export function getUSPAPCertificationFooter(
  appraiserName: string,
  appraiserLicense: string,
  certifications: string[]
): string {
  const certList = certifications.length > 0 
    ? `\nCertifications: ${certifications.join(', ')}`
    : '';

  return `${appraiserName}
License: ${appraiserLicense}${certList}

This appraisal has been prepared in accordance with the Uniform Standards of Professional Appraisal Practice (USPAP).`;
}
