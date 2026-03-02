interface LegalCitation {
  state: string;
  statutes: string[];
  caselaw: string[];
  methodology: string;
  antiFormula?: string;
}

export function getStateCitations(state: string): LegalCitation {
  const stateUpper = state.toUpperCase();
  
  switch (stateUpper) {
    case 'GA':
    case 'GEORGIA':
      return {
        state: 'Georgia',
        statutes: [
          'O.C.G.A. § 33-4-6 (First-Party Claims)',
          'O.C.G.A. § 33-4-7 (Third-Party Claims)',
        ],
        caselaw: [
          'Canal Ins. Co. v. Tullis, 237 Ga. App. 515, 516-17 (1999)',
        ],
        methodology: 'Georgia law recognizes diminished value claims and requires insurers to pay the difference between pre-accident fair market value and post-repair actual cash value. The comparable sales method is the preferred methodology for establishing market value.',
        antiFormula: 'Georgia courts have rejected the use of the 17c formula (also known as the "Mitchell formula") for calculating diminished value. This formula is an arbitrary mathematical calculation that does not reflect actual market conditions. Instead, Georgia law requires appraisers to use the comparable sales method, which analyzes actual market transactions of similar vehicles with and without accident history.',
      };
    
    case 'NC':
    case 'NORTH CAROLINA':
      return {
        state: 'North Carolina',
        statutes: [
          'N.C. Gen. Stat. § 20-279.21(d)(1) (Appraisal Dispute Process)',
        ],
        caselaw: [],
        methodology: 'North Carolina law provides a formal appraisal dispute process for diminished value claims. The comparable sales method is recognized as a valid approach for establishing the difference in market value.',
      };
    
    default:
      return {
        state: state,
        statutes: [
          'Restatement (Second) of Torts § 928 (Measure of Damages)',
        ],
        caselaw: [],
        methodology: 'Under general tort law principles, a claimant is entitled to be made whole for property damage. This includes the difference between the vehicle\'s pre-accident fair market value and its post-repair actual cash value. The comparable sales method is a widely accepted approach for establishing this difference.',
      };
  }
}

export function generateLegalCitationsSection(state: string): string {
  const citations = getStateCitations(state);
  
  let section = `## Legal Foundation\n\n`;
  section += `### Applicable Law: ${citations.state}\n\n`;
  
  if (citations.statutes.length > 0) {
    section += `**Statutory Authority:**\n`;
    citations.statutes.forEach(statute => {
      section += `- ${statute}\n`;
    });
    section += `\n`;
  }
  
  if (citations.caselaw.length > 0) {
    section += `**Case Law:**\n`;
    citations.caselaw.forEach(caseRef => {
      section += `- ${caseRef}\n`;
    });
    section += `\n`;
  }
  
  section += `**Methodology:**\n\n${citations.methodology}\n\n`;
  
  if (citations.antiFormula) {
    section += `**Rejection of Formula-Based Calculations:**\n\n${citations.antiFormula}\n\n`;
  }
  
  return section;
}
