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
  description: z.string().nullable().default(''),
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
// ==========================================
// OBJECTIVES SCHEMAS
// ==========================================

export const OBJECTIVE_STATUSES = ['draft', 'active', 'achieved', 'abandoned'] as const;
export type ObjectiveStatus = (typeof OBJECTIVE_STATUSES)[number];

export const OBJECTIVE_PRIORITIES = ['none', 'low', 'medium', 'high', 'urgent'] as const;
export type ObjectivePriority = (typeof OBJECTIVE_PRIORITIES)[number];

export const objectiveSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  cycle_id: z.string().uuid(),
  goal_id: z.string().uuid().nullable().optional(),
  title: z
    .string()
    .trim()
    .min(1, 'Objective title is required')
    .max(120, 'Objective title must be 120 characters or less'),
  description: z.string().nullable().default(''),
  status: z.enum(OBJECTIVE_STATUSES).default('draft'),
  priority: z.enum(OBJECTIVE_PRIORITIES).default('none'),
  confidence: z.number().int().min(1).max(10).nullable().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be YYYY-MM-DD'),
  archived_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Objective = z.infer<typeof objectiveSchema>;

export const createObjectiveSchema = z
  .object({
    cycle_id: z.string().uuid('Cycle ID must be a valid UUID'),
    goal_id: z.string().uuid().nullable().optional(),
    title: z
      .string()
      .trim()
      .min(1, 'Objective title is required')
      .max(120, 'Objective title must be 120 characters or less'),
    description: z
      .string()
      .trim()
      .max(1000, 'Description must be 1,000 characters or less')
      .default(''),
    status: z.enum(OBJECTIVE_STATUSES).default('active'),
    priority: z.enum(OBJECTIVE_PRIORITIES).default('none'),
    confidence: z
      .number()
      .int('Confidence must be an integer')
      .min(1, 'Confidence must be between 1 and 10')
      .max(10, 'Confidence must be between 1 and 10')
      .nullable()
      .optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
    due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be YYYY-MM-DD'),
  })
  .refine((data) => data.due_date >= data.start_date, {
    message: 'Due date must be on or after start date',
    path: ['due_date'],
  });

export type CreateObjectiveInput = z.infer<typeof createObjectiveSchema>;

export const updateObjectiveSchema = z
  .object({
    cycle_id: z.string().uuid().optional(),
    goal_id: z.string().uuid().nullable().optional(),
    title: z
      .string()
      .trim()
      .min(1, 'Objective title cannot be empty')
      .max(120, 'Objective title must be 120 characters or less')
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, 'Description must be 1,000 characters or less')
      .optional(),
    status: z.enum(OBJECTIVE_STATUSES).optional(),
    priority: z.enum(OBJECTIVE_PRIORITIES).optional(),
    confidence: z
      .number()
      .int('Confidence must be an integer')
      .min(1, 'Confidence must be between 1 and 10')
      .max(10, 'Confidence must be between 1 and 10')
      .nullable()
      .optional(),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD')
      .optional(),
    due_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be YYYY-MM-DD')
      .optional(),
    archived_at: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.due_date) {
        return data.due_date >= data.start_date;
      }
      return true;
    },
    {
      message: 'Due date must be on or after start date',
      path: ['due_date'],
    },
  );

export type UpdateObjectiveInput = z.infer<typeof updateObjectiveSchema>;

// ==========================================
// KEY RESULTS SCHEMAS
// ==========================================

export const METRIC_TYPES = ['numeric', 'binary'] as const;
export type MetricType = (typeof METRIC_TYPES)[number];

export const KR_DIRECTIONS = ['increase', 'decrease'] as const;
export type KrDirection = (typeof KR_DIRECTIONS)[number];

export const keyResultSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  objective_id: z.string().uuid(),
  title: z
    .string()
    .trim()
    .min(1, 'Key result title is required')
    .max(120, 'Key result title must be 120 characters or less'),
  description: z.string().nullable().default(''),
  metric_type: z.enum(METRIC_TYPES).default('numeric'),
  baseline_value: z.number(),
  current_value: z.number(),
  target_value: z.number(),
  unit: z.string().default(''),
  currency_code: z.string().length(3).nullable().optional(),
  direction: z.enum(KR_DIRECTIONS).nullable().optional(),
  confidence: z.number().int().min(1).max(10).nullable().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be YYYY-MM-DD'),
  archived_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type KeyResult = z.infer<typeof keyResultSchema>;

export const createKeyResultSchema = z
  .object({
    objective_id: z.string().uuid('Objective ID must be a valid UUID'),
    title: z
      .string()
      .trim()
      .min(1, 'Key result title is required')
      .max(120, 'Key result title must be 120 characters or less'),
    description: z
      .string()
      .trim()
      .max(1000, 'Description must be 1,000 characters or less')
      .default(''),
    metric_type: z.enum(METRIC_TYPES).default('numeric'),
    baseline_value: z.number(),
    current_value: z.number(),
    target_value: z.number(),
    unit: z.string().trim().max(30).default(''),
    currency_code: z
      .string()
      .trim()
      .length(3, 'Currency code must be 3 characters (e.g. USD)')
      .toUpperCase()
      .nullable()
      .optional(),
    direction: z.enum(KR_DIRECTIONS).nullable().optional(),
    confidence: z
      .number()
      .int('Confidence must be an integer')
      .min(1, 'Confidence must be between 1 and 10')
      .max(10, 'Confidence must be between 1 and 10')
      .nullable()
      .optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
    due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be YYYY-MM-DD'),
  })
  .refine((data) => data.due_date >= data.start_date, {
    message: 'Due date must be on or after start date',
    path: ['due_date'],
  })
  .refine(
    (data) => {
      if (data.metric_type === 'numeric') {
        return data.target_value !== data.baseline_value;
      }
      return true;
    },
    {
      message: 'Target value cannot equal baseline value for numeric key result',
      path: ['target_value'],
    },
  )
  .refine(
    (data) => {
      if (data.metric_type === 'numeric') {
        return data.direction === 'increase' || data.direction === 'decrease';
      }
      return true;
    },
    {
      message: 'Direction (increase or decrease) is required for numeric key results',
      path: ['direction'],
    },
  )
  .refine(
    (data) => {
      if (data.metric_type === 'numeric' && data.direction === 'increase') {
        return data.target_value > data.baseline_value;
      }
      return true;
    },
    {
      message: 'Target value must be greater than baseline value for increase key results',
      path: ['target_value'],
    },
  )
  .refine(
    (data) => {
      if (data.metric_type === 'numeric' && data.direction === 'decrease') {
        return data.target_value < data.baseline_value;
      }
      return true;
    },
    {
      message: 'Target value must be less than baseline value for decrease key results',
      path: ['target_value'],
    },
  )
  .refine(
    (data) => {
      if (data.metric_type === 'binary') {
        return (
          data.baseline_value === 0 &&
          data.target_value === 1 &&
          (data.current_value === 0 || data.current_value === 1) &&
          (data.direction === null || data.direction === undefined)
        );
      }
      return true;
    },
    {
      message:
        'Binary key results require baseline=0, target=1, current in {0,1}, and no direction',
      path: ['metric_type'],
    },
  );

export type CreateKeyResultInput = z.infer<typeof createKeyResultSchema>;

export const updateKeyResultSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Key result title is required')
      .max(120, 'Key result title must be 120 characters or less')
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, 'Description must be 1,000 characters or less')
      .optional(),
    metric_type: z.enum(METRIC_TYPES).optional(),
    baseline_value: z.number().optional(),
    current_value: z.number().optional(),
    target_value: z.number().optional(),
    unit: z.string().trim().max(30).optional(),
    currency_code: z
      .string()
      .trim()
      .length(3, 'Currency code must be 3 characters')
      .toUpperCase()
      .nullable()
      .optional(),
    direction: z.enum(KR_DIRECTIONS).nullable().optional(),
    confidence: z
      .number()
      .int('Confidence must be an integer')
      .min(1, 'Confidence must be between 1 and 10')
      .max(10, 'Confidence must be between 1 and 10')
      .nullable()
      .optional(),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD')
      .optional(),
    due_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be YYYY-MM-DD')
      .optional(),
    archived_at: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.due_date) {
        return data.due_date >= data.start_date;
      }
      return true;
    },
    {
      message: 'Due date must be on or after start date',
      path: ['due_date'],
    },
  );

export type UpdateKeyResultInput = z.infer<typeof updateKeyResultSchema>;
