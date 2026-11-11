import { describe, expect, it } from 'vitest';
import {
  createCycleSchema,
  createDomainSchema,
  createGoalSchema,
  createKeyResultSchema,
  createObjectiveSchema,
  domainSchema,
  keyResultSchema,
  objectiveSchema,
  reorderDomainsSchema,
  updateDomainSchema,
  updateKeyResultSchema,
  updateObjectiveSchema,
  visionSchema,
} from './schema';

describe('Goals & Life Areas Schemas', () => {
  describe('domainSchema', () => {
    it('validates a complete domain record', () => {
      const fullDomain = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        workspace_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        name: 'Health',
        color: '#6FCF97',
        icon: 'heart-pulse',
        sort_order: 1,
        archived_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const result = domainSchema.safeParse(fullDomain);
      expect(result.success).toBe(true);
    });
  });

  describe('createDomainSchema', () => {
    it('validates valid domain creation input', () => {
      const valid = {
        name: 'Health & Fitness',
        color: '#6FCF97',
        icon: 'heart-pulse',
      };
      const result = createDomainSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Health & Fitness');
      }
    });

    it('trims domain name whitespace', () => {
      const result = createDomainSchema.safeParse({
        name: '   Career & Craft   ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Career & Craft');
      }
    });

    it('rejects empty name', () => {
      const result = createDomainSchema.safeParse({
        name: '   ',
      });
      expect(result.success).toBe(false);
    });

    it('rejects names exceeding 60 characters', () => {
      const result = createDomainSchema.safeParse({
        name: 'A'.repeat(61),
      });
      expect(result.success).toBe(false);
    });

    it('applies defaults for color and icon when omitted', () => {
      const result = createDomainSchema.safeParse({
        name: 'Personal',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.color).toBe('#5A4F7C');
        expect(result.data.icon).toBe('folder');
      }
    });
  });

  describe('updateDomainSchema', () => {
    it('allows partial updates', () => {
      const result = updateDomainSchema.safeParse({
        name: 'New Area Name',
      });
      expect(result.success).toBe(true);
    });

    it('allows updating archived_at timestamp or null', () => {
      const archived = updateDomainSchema.safeParse({
        archived_at: new Date().toISOString(),
      });
      expect(archived.success).toBe(true);

      const restored = updateDomainSchema.safeParse({
        archived_at: null,
      });
      expect(restored.success).toBe(true);
    });

    it('rejects empty name in update', () => {
      const result = updateDomainSchema.safeParse({
        name: '   ',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('reorderDomainsSchema', () => {
    it('validates reorder array with uuids and integer sort_order', () => {
      const payload = [
        { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', sort_order: 0 },
        { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', sort_order: 1 },
      ];
      const result = reorderDomainsSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('rejects invalid uuid in reorder list', () => {
      const payload = [{ id: 'not-a-uuid', sort_order: 0 }];
      const result = reorderDomainsSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('visionSchema', () => {
    it('accepts valid vision statement', () => {
      const result = visionSchema.safeParse({
        vision: 'Ship calm, intentional systems and live a joyful life.',
      });
      expect(result.success).toBe(true);
    });

    it('accepts empty vision statement', () => {
      const result = visionSchema.safeParse({
        vision: '',
      });
      expect(result.success).toBe(true);
    });

    it('trims input whitespace', () => {
      const result = visionSchema.safeParse({
        vision: '   Deep work and family first.   ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.vision).toBe('Deep work and family first.');
      }
    });

    it('rejects vision exceeding 1000 characters', () => {
      const result = visionSchema.safeParse({
        vision: 'x'.repeat(1001),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createGoalSchema', () => {
    it('accepts valid goal with title, domain, priority, and dates', () => {
      const valid = {
        title: 'Run a marathon',
        description: 'Complete 42.2km under 4 hours',
        domain_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        status: 'active',
        priority: 'high',
        start_date: '2026-01-01',
        target_date: '2026-10-15',
      };
      const result = createGoalSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('defaults priority to none and status to active when omitted', () => {
      const result = createGoalSchema.safeParse({
        title: 'Learn Rust',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe('none');
        expect(result.data.status).toBe('active');
      }
    });

    it('rejects empty goal title', () => {
      const result = createGoalSchema.safeParse({
        title: '   ',
      });
      expect(result.success).toBe(false);
    });

    it('rejects target_date before start_date', () => {
      const result = createGoalSchema.safeParse({
        title: 'Reverse time',
        start_date: '2026-12-31',
        target_date: '2026-01-01',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createCycleSchema', () => {
    it('accepts valid quarterly cycle input', () => {
      const valid = {
        name: 'Q4 2026',
        cycle_type: 'quarterly',
        start_date: '2026-10-01',
        end_date: '2026-12-31',
        status: 'active',
      };
      const result = createCycleSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects cycle end_date before start_date', () => {
      const invalid = {
        name: 'Invalid Cycle',
        cycle_type: 'monthly',
        start_date: '2026-11-30',
        end_date: '2026-11-01',
      };
      const result = createCycleSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects invalid cycle_type', () => {
      const invalid = {
        name: 'Bi-weekly sprint',
        cycle_type: 'sprint',
        start_date: '2026-10-01',
        end_date: '2026-10-14',
      };
      const result = createCycleSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('objectiveSchema', () => {
    it('validates a complete objective database record', () => {
      const record = {
        id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        workspace_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        cycle_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        goal_id: null,
        title: 'Launch Northstar beta',
        description: 'First 50 beta users',
        priority: 'high',
        status: 'active',
        confidence: 8,
        start_date: '2026-10-01',
        due_date: '2026-12-31',
        archived_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const result = objectiveSchema.safeParse(record);
      expect(result.success).toBe(true);
    });
  });

  describe('createObjectiveSchema', () => {
    it('accepts valid objective input with full fields', () => {
      const valid = {
        cycle_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        goal_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        title: 'Launch Northstar beta',
        description: 'First 50 beta users onboarded and providing feedback',
        priority: 'high',
        status: 'active',
        confidence: 8,
        start_date: '2026-10-01',
        due_date: '2026-12-31',
      };
      const result = createObjectiveSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Launch Northstar beta');
        expect(result.data.confidence).toBe(8);
      }
    });

    it('accepts valid objective without optional goal_id and description', () => {
      const valid = {
        cycle_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'Run marathon under 3h30m',
        start_date: '2026-07-01',
        due_date: '2026-09-30',
      };
      const result = createObjectiveSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe('none');
        expect(result.data.status).toBe('active');
        expect(result.data.confidence).toBeUndefined();
      }
    });

    it('rejects empty title or title exceeding 120 chars', () => {
      const empty = createObjectiveSchema.safeParse({
        cycle_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: '   ',
        start_date: '2026-10-01',
        due_date: '2026-12-31',
      });
      expect(empty.success).toBe(false);

      const tooLong = createObjectiveSchema.safeParse({
        cycle_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'A'.repeat(121),
        start_date: '2026-10-01',
        due_date: '2026-12-31',
      });
      expect(tooLong.success).toBe(false);
    });

    it('rejects confidence outside 1..10 range or non-integers', () => {
      const tooLow = createObjectiveSchema.safeParse({
        cycle_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'Low confidence',
        confidence: 0,
        start_date: '2026-10-01',
        due_date: '2026-12-31',
      });
      expect(tooLow.success).toBe(false);

      const tooHigh = createObjectiveSchema.safeParse({
        cycle_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'High confidence',
        confidence: 11,
        start_date: '2026-10-01',
        due_date: '2026-12-31',
      });
      expect(tooHigh.success).toBe(false);

      const floatConfidence = createObjectiveSchema.safeParse({
        cycle_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'Float confidence',
        confidence: 7.5,
        start_date: '2026-10-01',
        due_date: '2026-12-31',
      });
      expect(floatConfidence.success).toBe(false);
    });

    it('rejects due_date before start_date', () => {
      const invalid = createObjectiveSchema.safeParse({
        cycle_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'Time travel objective',
        start_date: '2026-12-31',
        due_date: '2026-10-01',
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe('updateObjectiveSchema', () => {
    it('accepts partial updates', () => {
      const partial = updateObjectiveSchema.safeParse({
        status: 'achieved',
        confidence: 10,
      });
      expect(partial.success).toBe(true);
    });

    it('accepts archiving and restoring', () => {
      const archive = updateObjectiveSchema.safeParse({
        archived_at: new Date().toISOString(),
      });
      expect(archive.success).toBe(true);

      const restore = updateObjectiveSchema.safeParse({
        archived_at: null,
      });
      expect(restore.success).toBe(true);
    });

    it('rejects invalid date range in update', () => {
      const invalid = updateObjectiveSchema.safeParse({
        start_date: '2026-12-31',
        due_date: '2026-10-01',
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe('keyResultSchema', () => {
    it('validates a complete key result database record', () => {
      const record = {
        id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        workspace_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        objective_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        title: 'Reach $100k ARR',
        description: 'Self-sustaining business',
        metric_type: 'numeric',
        baseline_value: 0,
        current_value: 25000,
        target_value: 100000,
        unit: 'USD',
        currency_code: 'USD',
        direction: 'increase',
        confidence: 8,
        start_date: '2026-10-01',
        due_date: '2026-12-31',
        archived_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const result = keyResultSchema.safeParse(record);
      expect(result.success).toBe(true);
    });
  });

  describe('createKeyResultSchema', () => {
    it('accepts valid numeric increase key result', () => {
      const valid = {
        objective_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'Acquire 50 paying users',
        metric_type: 'numeric',
        baseline_value: 0,
        current_value: 10,
        target_value: 50,
        unit: 'users',
        direction: 'increase',
        start_date: '2026-10-01',
        due_date: '2026-12-31',
      };
      const result = createKeyResultSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('accepts valid numeric decrease key result', () => {
      const valid = {
        objective_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'Reduce average response time to 100ms',
        metric_type: 'numeric',
        baseline_value: 450,
        current_value: 200,
        target_value: 100,
        unit: 'ms',
        direction: 'decrease',
        start_date: '2026-10-01',
        due_date: '2026-12-31',
      };
      const result = createKeyResultSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('accepts valid binary key result with baseline=0 and target=1', () => {
      const valid = {
        objective_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'Pass SOC 2 Type II audit',
        metric_type: 'binary',
        baseline_value: 0,
        current_value: 0,
        target_value: 1,
        direction: null,
        start_date: '2026-10-01',
        due_date: '2026-12-31',
      };
      const result = createKeyResultSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects numeric increase when target <= baseline', () => {
      const invalid = createKeyResultSchema.safeParse({
        objective_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'Impossible increase',
        metric_type: 'numeric',
        baseline_value: 100,
        current_value: 50,
        target_value: 50,
        direction: 'increase',
        start_date: '2026-10-01',
        due_date: '2026-12-31',
      });
      expect(invalid.success).toBe(false);
    });

    it('rejects numeric decrease when target >= baseline', () => {
      const invalid = createKeyResultSchema.safeParse({
        objective_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'Impossible decrease',
        metric_type: 'numeric',
        baseline_value: 50,
        current_value: 80,
        target_value: 100,
        direction: 'decrease',
        start_date: '2026-10-01',
        due_date: '2026-12-31',
      });
      expect(invalid.success).toBe(false);
    });

    it('rejects binary key result with invalid baseline or target or direction', () => {
      const invalidBaseline = createKeyResultSchema.safeParse({
        objective_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'Invalid binary',
        metric_type: 'binary',
        baseline_value: 1,
        current_value: 1,
        target_value: 2,
        start_date: '2026-10-01',
        due_date: '2026-12-31',
      });
      expect(invalidBaseline.success).toBe(false);

      const invalidDirection = createKeyResultSchema.safeParse({
        objective_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'Binary with direction',
        metric_type: 'binary',
        baseline_value: 0,
        current_value: 0,
        target_value: 1,
        direction: 'increase',
        start_date: '2026-10-01',
        due_date: '2026-12-31',
      });
      expect(invalidDirection.success).toBe(false);
    });

    it('rejects due_date before start_date', () => {
      const invalid = createKeyResultSchema.safeParse({
        objective_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'Time travel KR',
        metric_type: 'numeric',
        baseline_value: 0,
        current_value: 10,
        target_value: 50,
        direction: 'increase',
        start_date: '2026-12-31',
        due_date: '2026-10-01',
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe('updateKeyResultSchema', () => {
    it('accepts partial updates and archiving', () => {
      const partial = updateKeyResultSchema.safeParse({
        current_value: 35,
        confidence: 9,
      });
      expect(partial.success).toBe(true);

      const archive = updateKeyResultSchema.safeParse({
        archived_at: new Date().toISOString(),
      });
      expect(archive.success).toBe(true);
    });
  });
});
