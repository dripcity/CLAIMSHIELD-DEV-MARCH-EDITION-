import { CALCULATION_CONSTANTS } from '@/lib/utils/constants';

interface AccidentDetails {
  totalLaborHours: number;
  frameLaborHours: number;
  bodyLaborHours: number;
  airbagDeployment: boolean;
  structuralDamage: boolean;
  framePulling: boolean;
  panelsReplaced: string[];
}

interface SeverityResult {
  severityLevel: 1 | 2 | 3 | 4 | 5;
  severityLabel: 'Minor' | 'Moderate' | 'Medium' | 'Major' | 'Severe';
  postRepairNaaaGrade: string;
  justification: string;
}

const STRUCTURAL_PANELS = [
  'frame rail',
  'unibody',
  'a-pillar',
  'b-pillar',
  'c-pillar',
  'rocker panel',
  'floor pan',
  'firewall',
];

function hasStructuralPanelReplacement(panelsReplaced: string[]): boolean {
  return panelsReplaced.some(panel =>
    STRUCTURAL_PANELS.some(structural =>
      panel.toLowerCase().includes(structural)
    )
  );
}

export function classifySeverity(
  accidentDetails: AccidentDetails,
  preAccidentGrade: string = '5 - Excellent'
): SeverityResult {
  const {
    totalLaborHours,
    frameLaborHours,
    airbagDeployment,
    structuralDamage,
    framePulling,
    panelsReplaced,
  } = accidentDetails;
  
  let severityLevel: 1 | 2 | 3 | 4 | 5;
  let justification: string;
  
  // Level 5 (Severe) - Most severe conditions
  if (totalLaborHours > 60) {
    severityLevel = 5;
    justification = `Severe damage classification due to excessive labor hours (${totalLaborHours} hours). ` +
      `Repairs of this magnitude indicate extensive structural and cosmetic damage requiring complete disassembly and reconstruction.`;
  } else if (airbagDeployment && structuralDamage && frameLaborHours > 5) {
    severityLevel = 5;
    justification = `Severe damage classification due to airbag deployment combined with structural damage and significant frame work (${frameLaborHours} hours). ` +
      `This combination indicates a high-energy impact affecting the vehicle's safety systems and structural integrity.`;
  } else if (frameLaborHours > 10) {
    severityLevel = 5;
    justification = `Severe damage classification due to extensive frame work (${frameLaborHours} hours). ` +
      `Frame repairs of this magnitude indicate substantial structural compromise requiring specialized equipment and expertise.`;
  }
  // Level 4 (Major)
  else if (framePulling) {
    severityLevel = 4;
    justification = `Major damage classification due to frame pulling requirement. ` +
      `Frame pulling indicates structural deformation that required specialized hydraulic equipment to restore proper alignment.`;
  } else if (frameLaborHours > 0) {
    severityLevel = 4;
    justification = `Major damage classification due to frame work (${frameLaborHours} hours). ` +
      `Any frame involvement indicates structural damage that affects the vehicle's safety and integrity.`;
  } else if (structuralDamage && totalLaborHours > 35) {
    severityLevel = 4;
    justification = `Major damage classification due to structural damage combined with extensive labor (${totalLaborHours} hours). ` +
      `This indicates significant impact to load-bearing components requiring substantial repair work.`;
  } else if (airbagDeployment && totalLaborHours > 30) {
    severityLevel = 4;
    justification = `Major damage classification due to airbag deployment combined with extensive labor (${totalLaborHours} hours). ` +
      `Airbag deployment indicates a significant impact, and the labor hours confirm extensive damage.`;
  }
  // Level 3 (Medium)
  else if (totalLaborHours >= 20 && totalLaborHours <= 35) {
    severityLevel = 3;
    justification = `Medium damage classification due to moderate labor hours (${totalLaborHours} hours). ` +
      `This level of repair indicates substantial panel replacement and refinishing work.`;
  } else if (hasStructuralPanelReplacement(panelsReplaced) && totalLaborHours > 15) {
    severityLevel = 3;
    justification = `Medium damage classification due to structural panel replacement combined with significant labor (${totalLaborHours} hours). ` +
      `Replacement of structural panels: ${panelsReplaced.filter(p => STRUCTURAL_PANELS.some(s => p.toLowerCase().includes(s))).join(', ')}.`;
  } else if (airbagDeployment && !structuralDamage) {
    severityLevel = 3;
    justification = `Medium damage classification due to airbag deployment without structural damage. ` +
      `While airbags deployed, the impact did not compromise structural integrity, but still represents significant damage.`;
  }
  // Level 2 (Moderate)
  else if (totalLaborHours >= 10 && totalLaborHours < 20 && !structuralDamage) {
    severityLevel = 2;
    justification = `Moderate damage classification due to moderate labor hours (${totalLaborHours} hours) without structural involvement. ` +
      `Repairs limited to cosmetic panels and refinishing work.`;
  }
  // Level 1 (Minor)
  else {
    severityLevel = 1;
    justification = `Minor damage classification due to limited labor hours (${totalLaborHours} hours). ` +
      `Repairs limited to minor cosmetic work with no structural involvement.`;
  }
  
  // Determine post-repair NAAA grade based on severity
  let postRepairNaaaGrade: string;
  
  switch (severityLevel) {
    case 5:
      postRepairNaaaGrade = '1 - Rough';
      break;
    case 4:
      postRepairNaaaGrade = '2 - Below Average';
      break;
    case 3:
      postRepairNaaaGrade = '3 - Average';
      break;
    case 2:
      postRepairNaaaGrade = '4 - Good';
      break;
    case 1:
      postRepairNaaaGrade = preAccidentGrade === '5 - Excellent' ? '4 - Good' : '3 - Average';
      break;
  }
  
  return {
    severityLevel,
    severityLabel: CALCULATION_CONSTANTS.SEVERITY_LEVELS[severityLevel],
    postRepairNaaaGrade,
    justification,
  };
}
