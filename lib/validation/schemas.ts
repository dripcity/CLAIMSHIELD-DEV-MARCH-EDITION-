import { z } from 'zod';

export const vinSchema = z.string().length(17).regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'Invalid VIN format');

export const emailSchema = z.string().email('Invalid email address');

export const phoneSchema = z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Phone must be in format (XXX) XXX-XXXX');

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in format YYYY-MM-DD');

export const vehicleInfoSchema = z.object({
  vin: vinSchema,
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  trim: z.string().optional(),
  mileage: z.number().int().min(0, 'Mileage must be positive'),
  preAccidentCondition: z.enum(['excellent', 'good', 'average', 'below_average']),
});

export const ownerInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: emailSchema,
  phone: phoneSchema,
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters'),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
});

export const accidentDetailsSchema = z.object({
  accidentDate: z.string().refine(
    (date) => new Date(date) <= new Date(),
    { message: 'Accident date cannot be in the future' }
  ),
  pointOfImpact: z.string().min(1, 'Point of impact is required'),
  structuralDamage: z.boolean(),
  airbagDeployment: z.boolean(),
  framePulling: z.boolean(),
  totalRepairCost: z.number().min(0, 'Repair cost must be positive'),
  totalLaborHours: z.number().min(0, 'Labor hours must be positive'),
  frameLaborHours: z.number().min(0, 'Frame labor hours must be positive'),
});
