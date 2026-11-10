import { z } from 'zod';

export const DOMAIN_COLORS = [
  { label: 'Lavender', value: '#9D8DF1' },
  { label: 'Accent Purple', value: '#5A4F7C' },
  { label: 'Emerald', value: '#6FCF97' },
  { label: 'Amber', value: '#E8B866' },
  { label: 'Rose', value: '#E5707F' },
  { label: 'Blue', value: '#60A5FA' },
  { label: 'Mint', value: '#34D399' },
  { label: 'Pink', value: '#F472B6' },
  { label: 'Violet', value: '#A78BFA' },
  { label: 'Orange', value: '#F97316' },
] as const;

export const DOMAIN_ICONS = [
  'briefcase',
  'heart-pulse',
  'book-open',
  'wallet',
  'users',
  'sparkles',
  'compass',
  'trophy',
  'target',
  'home',
  'plane',
  'palette',
  'folder',
] as const;

export type DomainColor = (typeof DOMAIN_COLORS)[number]['value'];
export type DomainIconName = (typeof DOMAIN_ICONS)[number];

export const domainSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  name: z.string().trim().min(1, 'Name is required').max(60, 'Name must be 60 characters or less'),
  color: z.string().default('#5A4F7C'),
  icon: z.string().default('folder'),
  sort_order: z.number().int().default(0),
  archived_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Domain = z.infer<typeof domainSchema>;

export const createDomainSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60, 'Name must be 60 characters or less'),
  color: z.string().default('#5A4F7C'),
  icon: z.string().default('folder'),
});

export type CreateDomainInput = z.infer<typeof createDomainSchema>;

export const updateDomainSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name cannot be empty')
    .max(60, 'Name must be 60 characters or less')
    .optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  sort_order: z.number().int().optional(),
  archived_at: z.string().nullable().optional(),
});

export type UpdateDomainInput = z.infer<typeof updateDomainSchema>;

export const reorderDomainsSchema = z.array(
  z.object({
    id: z.string().uuid(),
    sort_order: z.number().int(),
  }),
);

export type ReorderDomainsInput = z.infer<typeof reorderDomainsSchema>;

export const visionSchema = z.object({
  vision: z
    .string()
    .trim()
    .max(1000, 'Vision statement must be 1,000 characters or less')
    .default(''),
});

export type VisionInput = z.infer<typeof visionSchema>;
