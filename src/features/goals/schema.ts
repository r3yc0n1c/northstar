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

// ==========================================
// GOALS SCHEMAS
// ==========================================

export const GOAL_STATUSES = ['active', 'on_hold', 'completed', 'archived'] as const;
export type GoalStatus = (typeof GOAL_STATUSES)[number];

export const GOAL_PRIORITIES = ['none', 'low', 'medium', 'high', 'urgent'] as const;
export type GoalPriority = (typeof GOAL_PRIORITIES)[number];

export const goalSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  domain_id: z.string().uuid().nullable().optional(),
  title: z
    .string()
    .trim()
    .min(1, 'Goal title is required')
    .max(120, 'Goal title must be 120 characters or less'),
  description: z.string().default(''),
  status: z.enum(GOAL_STATUSES).default('active'),
  priority: z.enum(GOAL_PRIORITIES).default('none'),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD')
    .nullable()
    .optional(),
  target_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Target date must be YYYY-MM-DD')
    .nullable()
    .optional(),
  archived_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Goal = z.infer<typeof goalSchema>;

export const createGoalSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Goal title is required')
      .max(120, 'Goal title must be 120 characters or less'),
    description: z
      .string()
      .trim()
      .max(1000, 'Description must be 1,000 characters or less')
      .default(''),
    domain_id: z.string().uuid().nullable().optional(),
    status: z.enum(GOAL_STATUSES).default('active'),
    priority: z.enum(GOAL_PRIORITIES).default('none'),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD')
      .nullable()
      .optional(),
    target_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Target date must be YYYY-MM-DD')
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.target_date) {
        return data.target_date >= data.start_date;
      }
      return true;
    },
    {
      message: 'Target date must be on or after start date',
      path: ['target_date'],
    },
  );

export type CreateGoalInput = z.infer<typeof createGoalSchema>;

export const updateGoalSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Goal title cannot be empty')
      .max(120, 'Goal title must be 120 characters or less')
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, 'Description must be 1,000 characters or less')
      .optional(),
    domain_id: z.string().uuid().nullable().optional(),
    status: z.enum(GOAL_STATUSES).optional(),
    priority: z.enum(GOAL_PRIORITIES).optional(),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD')
      .nullable()
      .optional(),
    target_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Target date must be YYYY-MM-DD')
      .nullable()
      .optional(),
    archived_at: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.target_date) {
        return data.target_date >= data.start_date;
      }
      return true;
    },
    {
      message: 'Target date must be on or after start date',
      path: ['target_date'],
    },
  );

export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;

// ==========================================
// CYCLES SCHEMAS
// ==========================================

export const CYCLE_TYPES = ['monthly', 'quarterly', 'annual', 'custom'] as const;
export type CycleType = (typeof CYCLE_TYPES)[number];

export const CYCLE_STATUSES = ['planned', 'active', 'closed'] as const;
export type CycleStatus = (typeof CYCLE_STATUSES)[number];

export const cycleSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  name: z
    .string()
    .trim()
    .min(1, 'Cycle name is required')
    .max(60, 'Cycle name must be 60 characters or less'),
  cycle_type: z.enum(CYCLE_TYPES).default('quarterly'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD'),
  status: z.enum(CYCLE_STATUSES).default('planned'),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Cycle = z.infer<typeof cycleSchema>;

export const createCycleSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Cycle name is required')
      .max(60, 'Cycle name must be 60 characters or less'),
    cycle_type: z.enum(CYCLE_TYPES).default('quarterly'),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD'),
    status: z.enum(CYCLE_STATUSES).default('planned'),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: 'End date must be on or after start date',
    path: ['end_date'],
  });

export type CreateCycleInput = z.infer<typeof createCycleSchema>;

export const updateCycleSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Cycle name cannot be empty')
      .max(60, 'Cycle name must be 60 characters or less')
      .optional(),
    cycle_type: z.enum(CYCLE_TYPES).optional(),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD')
      .optional(),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD')
      .optional(),
    status: z.enum(CYCLE_STATUSES).optional(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return data.end_date >= data.start_date;
      }
      return true;
    },
    {
      message: 'End date must be on or after start date',
      path: ['end_date'],
    },
  );

export type UpdateCycleInput = z.infer<typeof updateCycleSchema>;
