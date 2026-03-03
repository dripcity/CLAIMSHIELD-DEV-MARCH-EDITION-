import { describe, it, expect } from 'vitest';

/**
 * Template Variable Substitution Tests
 * 
 * Tests the renderTemplate function that replaces {{variable}} placeholders
 * with actual values from appraisal data.
 * 
 * Specification Reference:
 * - Requirements 13.9, 13.10
 * - Property 20: Template Variable Substitution
 * - Design: "For any document template containing {{variable}} placeholders,
 *   the generated document must replace all placeholders with actual values
 *   from the appraisal data, such that no {{variable}} patterns remain in the output."
 * 
 * Expected Behavior:
 * - Replace {{variable}} with actual value from data object
 * - Unfilled placeholders should remain as [variable] format
 * - Handle special characters, numbers, and empty strings
 * - Handle null/undefined values gracefully
 */

// Mock implementation for testing - this should be moved to lib/templates/template-engine.ts
function renderTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = data[key];
    
    // If value is null or undefined, show placeholder in [brackets]
    if (value === null || value === undefined) {
      return `[${key}]`;
    }
    
    // Convert to string
    return value.toString();
  });
}

describe('Template Variable Substitution', () => {
  describe('Basic Variable Replacement', () => {
    it('should replace all variables in template', () => {
      const template = "Dear {{owner_name}}, your DV is {{dv_amount}}.";
      const result = renderTemplate(template, {
        owner_name: "John Doe",
        dv_amount: "$8,500"
      });
      
      expect(result).not.toContain('{{');
      expect(result).not.toContain('}}');
      expect(result).toContain('John Doe');
      expect(result).toContain('$8,500');
      expect(result).toBe("Dear John Doe, your DV is $8,500.");
    });

    it('should replace multiple occurrences of the same variable', () => {
      const template = "{{name}} is {{age}} years old. {{name}} lives in {{city}}.";
      const result = renderTemplate(template, {
        name: "Alice",
        age: "30",
        city: "Atlanta"
      });
      
      expect(result).toBe("Alice is 30 years old. Alice lives in Atlanta.");
    });

    it('should handle templates with no variables', () => {
      const template = "This is a static template with no variables.";
      const result = renderTemplate(template, {});
      
      expect(result).toBe(template);
    });
  });

  describe('Missing Variable Handling', () => {
    it('should show unfilled placeholders as [variable] format', () => {
      const template = "Dear {{owner_name}}, your claim {{claim_number}} is pending.";
      const result = renderTemplate(template, {
        owner_name: "John Doe"
        // claim_number is missing
      });
      
      expect(result).toBe("Dear John Doe, your claim [claim_number] is pending.");
      expect(result).not.toContain('{{');
      expect(result).toContain('[claim_number]');
    });

    it('should handle all missing variables', () => {
      const template = "{{var1}} {{var2}} {{var3}}";
      const result = renderTemplate(template, {});
      
      expect(result).toBe("[var1] [var2] [var3]");
    });

    it('should handle null values as unfilled placeholders', () => {
      const template = "Value: {{amount}}";
      const result = renderTemplate(template, { amount: null });
      
      expect(result).toBe("Value: [amount]");
    });

    it('should handle undefined values as unfilled placeholders', () => {
      const template = "Value: {{amount}}";
      const result = renderTemplate(template, { amount: undefined });
      
      expect(result).toBe("Value: [amount]");
    });
  });

  describe('Special Value Types', () => {
    it('should handle numeric values', () => {
      const template = "Amount: {{amount}}, Count: {{count}}";
      const result = renderTemplate(template, {
        amount: 8500,
        count: 42
      });
      
      expect(result).toBe("Amount: 8500, Count: 42");
    });

    it('should handle empty string values', () => {
      const template = "Name: {{name}}, Title: {{title}}";
      const result = renderTemplate(template, {
        name: "John",
        title: ""
      });
      
      expect(result).toBe("Name: John, Title: ");
    });

    it('should handle boolean values', () => {
      const template = "Active: {{active}}, Verified: {{verified}}";
      const result = renderTemplate(template, {
        active: true,
        verified: false
      });
      
      expect(result).toBe("Active: true, Verified: false");
    });

    it('should handle values with special characters', () => {
      const template = "Address: {{address}}";
      const result = renderTemplate(template, {
        address: "123 Main St., Apt #5 (Rear)"
      });
      
      expect(result).toBe("Address: 123 Main St., Apt #5 (Rear)");
    });
  });

  describe('Real-World Template Scenarios', () => {
    it('should generate demand letter header correctly', () => {
      const template = `{{owner_name}}
{{address}}
{{city}}, {{state}} {{zip}}
{{email}}
{{phone}}`;
      
      const result = renderTemplate(template, {
        owner_name: "John Doe",
        address: "123 Main St",
        city: "Atlanta",
        state: "GA",
        zip: "30301",
        email: "john@example.com",
        phone: "(404) 555-1234"
      });
      
      expect(result).toContain("John Doe");
      expect(result).toContain("Atlanta, GA 30301");
      expect(result).not.toContain('{{');
    });

    it('should handle partial data in demand letter', () => {
      const template = `RE: Claim {{claim_number}}
Vehicle: {{year}} {{make}} {{model}}
VIN: {{vin}}
Adjuster: {{adjuster_name}}`;
      
      const result = renderTemplate(template, {
        claim_number: "12345",
        year: "2020",
        make: "Toyota",
        model: "Camry"
        // vin and adjuster_name missing
      });
      
      expect(result).toContain("Claim 12345");
      expect(result).toContain("2020 Toyota Camry");
      expect(result).toContain("[vin]");
      expect(result).toContain("[adjuster_name]");
    });

    it('should handle currency and date formatting in templates', () => {
      const template = "DV Amount: {{dv_amount}} as of {{date}}";
      const result = renderTemplate(template, {
        dv_amount: "$8,500.00",
        date: "March 3, 2026"
      });
      
      expect(result).toBe("DV Amount: $8,500.00 as of March 3, 2026");
    });
  });

  describe('Edge Cases', () => {
    it('should handle variables with underscores', () => {
      const template = "{{first_name}} {{last_name}} {{middle_initial}}";
      const result = renderTemplate(template, {
        first_name: "John",
        last_name: "Doe",
        middle_initial: "Q"
      });
      
      expect(result).toBe("John Doe Q");
    });

    it('should not replace malformed placeholders', () => {
      const template = "{{valid}} {invalid} {{ spaced }} {{also-invalid}}";
      const result = renderTemplate(template, {
        valid: "VALID",
        invalid: "INVALID",
        spaced: "SPACED"
      });
      
      // Only {{valid}} should be replaced (alphanumeric + underscore only)
      expect(result).toContain("VALID");
      expect(result).toContain("{invalid}");
      expect(result).toContain("{{ spaced }}");
      expect(result).toContain("{{also-invalid}}");
    });

    it('should handle empty template', () => {
      const result = renderTemplate("", { name: "John" });
      expect(result).toBe("");
    });

    it('should handle template with only variables', () => {
      const template = "{{var1}}{{var2}}{{var3}}";
      const result = renderTemplate(template, {
        var1: "A",
        var2: "B",
        var3: "C"
      });
      
      expect(result).toBe("ABC");
    });
  });

  describe('Property 20: No Unfilled Placeholders in Output', () => {
    it('should ensure no {{variable}} patterns remain when all data provided', () => {
      const template = "{{a}} {{b}} {{c}} {{d}}";
      const result = renderTemplate(template, {
        a: "1",
        b: "2",
        c: "3",
        d: "4"
      });
      
      // Verify no {{ or }} remain
      expect(result).not.toMatch(/\{\{/);
      expect(result).not.toMatch(/\}\}/);
      expect(result).toBe("1 2 3 4");
    });

    it('should convert unfilled placeholders to [bracket] format', () => {
      const template = "{{filled}} {{unfilled}}";
      const result = renderTemplate(template, {
        filled: "VALUE"
      });
      
      // No {{ }} should remain
      expect(result).not.toMatch(/\{\{/);
      expect(result).not.toMatch(/\}\}/);
      
      // Unfilled should be in [brackets]
      expect(result).toContain("[unfilled]");
      expect(result).toBe("VALUE [unfilled]");
    });
  });
});
