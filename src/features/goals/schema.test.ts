import { describe, expect, it } from 'vitest';
import {
  createCycleSchema,
  createDomainSchema,
  createGoalSchema,
  domainSchema,
  reorderDomainsSchema,
  updateDomainSchema,
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
});
