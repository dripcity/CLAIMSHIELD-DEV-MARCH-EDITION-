import { z } from 'zod';

export const repairEstimateSchema = z.object({
  repairFacility: z.string().optional(),
  repairFacilityPhone: z.string().optional(),
  estimateDate: z.string().optional(),
  totalRepairCost: z.number(),
  partsCost: z.number(),
  laborCost: z.number(),
  paintCost: z.number(),
  bodyLaborHours: z.number(),
  frameLaborHours: z.number(),
  refinishLaborHours: z.number(),
  mechanicalLaborHours: z.number(),
  totalLaborHours: z.number(),
  framePulling: z.boolean(),
  airbagDeployment: z.boolean(),
  structuralDamage: z.boolean(),
  panelsReplaced: z.array(z.string()),
  paintedPanels: z.array(z.string()),
  oemParts: z.boolean(),
  aftermarketParts: z.boolean(),
  refurbishedParts: z.boolean(),
  lineItems: z.array(z.object({
    description: z.string(),
    partCost: z.number().optional(),
    laborCost: z.number().optional(),
    laborHours: z.number().optional(),
    laborType: z.enum(['body', 'frame', 'refinish', 'mechanical']).optional(),
    category: z.enum(['OEM', 'aftermarket', 'refurbished', 'labor', 'paint', 'other']),
  })),
  confidence: z.number().min(0).max(1),
});

export const insuranceDocsSchema = z.object({
  company: z.string(),
  policyNumber: z.string(),
  claimNumber: z.string(),
  adjusterName: z.string().optional(),
  adjusterPhone: z.string().optional(),
  adjusterEmail: z.string().optional(),
  ownerFirstName: z.string().optional(),
  ownerLastName: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

export const vehicleInfoSchema = z.object({
  vin: z.string().length(17),
  year: z.number(),
  make: z.string(),
  model: z.string(),
  trim: z.string().optional(),
  mileage: z.number(),
  confidence: z.number().min(0).max(1),
});

export const imageAnalysisSchema = z.object({
  pointOfImpact: z.string(),
  structuralDamage: z.boolean(),
  suspectedFrameDamage: z.boolean(),
  airbagDeployment: z.boolean(),
  damagedPanels: z.array(z.string()),
  damageScope: z.enum(['minor', 'moderate', 'major', 'severe']),
  preAccidentCondition: z.enum(['excellent', 'good', 'average', 'below_average']),
  description: z.string(),
  confidence: z.number().min(0).max(1),
});
