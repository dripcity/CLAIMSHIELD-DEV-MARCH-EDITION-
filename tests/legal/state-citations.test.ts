import { describe, it, expect } from 'vitest';
import { getStateCitations } from '@/lib/legal/state-citations';

describe('State-Specific Citation Exclusion', () => {
  it('should not include Georgia citations for non-GA states', () => {
    const ncCitations = getStateCitations('NC');
    
    // North Carolina should not have Georgia-specific content
    expect(ncCitations.anti17c).toBe(false);
    expect(ncCitations.anti17cStatement).toBeNull();
    expect(ncCitations.firstPartyStatute).not.toContain('O.C.G.A');
    expect(ncCitations.thirdPartyStatute).toBeNull();
  });

  it('should not include Georgia citations for generic states', () => {
    const txCitations = getStateCitations('TX');
    
    // Texas (generic) should not have Georgia-specific content
    expect(txCitations.anti17c).toBe(false);
    expect(txCitations.anti17cStatement).toBeNull();
    expect(txCitations.firstPartyStatute).toBeNull();
    expect(txCitations.thirdPartyStatute).toBeNull();
  });

  it('should include Georgia citations only for GA state', () => {
    const gaCitations = getStateCitations('GA');
    
    // Georgia should have all Georgia-specific content
    expect(gaCitations.anti17c).toBe(true);
    expect(gaCitations.anti17cStatement).not.toBeNull();
    expect(gaCitations.firstPartyStatute).toContain('O.C.G.A');
    expect(gaCitations.thirdPartyStatute).toContain('O.C.G.A');
  });

  it('should include North Carolina statute for NC state', () => {
    const ncCitations = getStateCitations('NC');
    
    expect(ncCitations.firstPartyStatute).toContain('N.C. Gen. Stat.');
    expect(ncCitations.firstPartyStatute).toContain('20-279.21');
  });

  it('should use generic citations for unknown states', () => {
    const caCitations = getStateCitations('CA');
    
    expect(caCitations.caselaw).toContain('Restatement of Torts');
    expect(caCitations.firstPartyStatute).toBeNull();
    expect(caCitations.anti17c).toBe(false);
  });

  it('should never mix state-specific citations', () => {
    const states = ['GA', 'NC', 'TX', 'CA', 'FL'];
    
    states.forEach(state => {
      const citations = getStateCitations(state);
      
      if (state === 'GA') {
        // Only GA should have anti-17c
        expect(citations.anti17c).toBe(true);
      } else {
        // No other state should have anti-17c
        expect(citations.anti17c).toBe(false);
        expect(citations.anti17cStatement).toBeNull();
      }
    });
  });

  it('should handle case-insensitive state codes', () => {
    const upperCase = getStateCitations('GA');
    const lowerCase = getStateCitations('ga');
    
    expect(upperCase.anti17c).toBe(lowerCase.anti17c);
    expect(upperCase.firstPartyStatute).toBe(lowerCase.firstPartyStatute);
  });

  it('should return consistent structure for all states', () => {
    const states = ['GA', 'NC', 'TX'];
    
    states.forEach(state => {
      const citations = getStateCitations(state);
      
      // All should have these properties
      expect(citations).toHaveProperty('state');
      expect(citations).toHaveProperty('firstPartyStatute');
      expect(citations).toHaveProperty('thirdPartyStatute');
      expect(citations).toHaveProperty('anti17c');
      expect(citations).toHaveProperty('anti17cStatement');
      expect(citations).toHaveProperty('caselaw');
      expect(citations).toHaveProperty('generalStatement');
    });
  });
});
