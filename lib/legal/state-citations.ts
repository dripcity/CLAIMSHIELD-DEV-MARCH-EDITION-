interface LegalCitation {
  state: string;
  firstPartyStatute: string | null;
  thirdPartyStatute: string | null;
  anti17c: boolean;
  anti17cStatement: string | null;
  caselaw: string;
  generalStatement: string;
}

export function getStateCitations(state: string): LegalCitation {
  const stateUpper = state.toUpperCase();
  
  switch (stateUpper) {
    case 'GA':
    case 'GEORGIA':
      return {
        state: 'Georgia',
        firstPartyStatute: 'O.C.G.A. § 33-4-6 (First-Party Claims)',
        thirdPartyStatute: 'O.C.G.A. § 33-4-7 (Third-Party Claims)',
        anti17c: true,
        anti17cStatement: 'Georgia courts have rejected the use of the 17c formula (also known as the "Mitchell formula") for calculating diminished value. This formula is an arbitrary mathematical calculation that does not reflect actual market conditions. Instead, Georgia law requires appraisers to use the comparable sales method, which analyzes actual market transactions of similar vehicles with and without accident history.',
        caselaw: 'Canal Ins. Co. v. Tullis, 237 Ga. App. 515, 516-17 (1999)',
        generalStatement: 'Georgia law recognizes diminished value claims and requires insurers to pay the difference between pre-accident fair market value and post-repair actual cash value. The comparable sales method is the preferred methodology for establishing market value.',
      };
    
    case 'NC':
    case 'NORTH CAROLINA':
      return {
        state: 'North Carolina',
        firstPartyStatute: 'N.C. Gen. Stat. § 20-279.21(d)(1) (Appraisal Dispute Process)',
        thirdPartyStatute: null,
        anti17c: false,
        anti17cStatement: null,
        caselaw: 'Restatement of Torts § 928',
        generalStatement: 'North Carolina law provides a formal appraisal dispute process for diminished value claims. The comparable sales method is recognized as a valid approach for establishing the difference in market value.',
      };
    
    default:
      return {
        state: state,
        firstPartyStatute: null,
        thirdPartyStatute: null,
        anti17c: false,
        anti17cStatement: null,
        caselaw: 'Restatement of Torts § 928',
        generalStatement: 'Under general tort law principles, a claimant is entitled to be made whole for property damage. This includes the difference between the vehicle\'s pre-accident fair market value and its post-repair actual cash value. The comparable sales method is a widely accepted approach for establishing this difference.',
      };
  }
}

export function generateLegalCitationsSection(state: string): string {
  const citations = getStateCitations(state);
  
  let section = `## Legal Foundation\n\n`;
  section += `### Applicable Law: ${citations.state}\n\n`;
  
  // Statutory Authority
  const statutes = [];
  if (citations.firstPartyStatute) statutes.push(citations.firstPartyStatute);
  if (citations.thirdPartyStatute) statutes.push(citations.thirdPartyStatute);
  
  if (statutes.length > 0) {
    section += `**Statutory Authority:**\n`;
    statutes.forEach(statute => {
      section += `- ${statute}\n`;
    });
    section += `\n`;
  }
  
  // Case Law
  if (citations.caselaw) {
    section += `**Case Law:**\n`;
    section += `- ${citations.caselaw}\n\n`;
  }
  
  // General Statement
  section += `**Methodology:**\n\n${citations.generalStatement}\n\n`;
  
  // Anti-17c Statement (Georgia only)
  if (citations.anti17c && citations.anti17cStatement) {
    section += `**Rejection of Formula-Based Calculations:**\n\n${citations.anti17cStatement}\n\n`;
  }
  
  return section;
}
