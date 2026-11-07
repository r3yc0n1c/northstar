import { z } from 'zod';
import { workingHoursMapSchema, type WorkingHoursMap } from '@/features/settings';

export interface StarterLifeArea {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export const STARTER_LIFE_AREAS: readonly StarterLifeArea[] = [
  {
    id: 'career',
    name: 'Career & Work',
    description: 'Professional growth, key projects, and career milestones',
    color: '#5A4F7C',
    icon: 'briefcase',
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    description: 'Physical wellness, mental energy, sleep, and nutrition',
    color: '#6FCF97',
    icon: 'heart-pulse',
  },
  {
    id: 'learning',
    name: 'Learning & Skills',
    description: 'Books, courses, crafts, and deliberate practice',
    color: '#9D8DF1',
    icon: 'book-open',
  },
  {
    id: 'finance',
    name: 'Finance & Wealth',
    description: 'Budgeting, savings targets, and financial freedom',
    color: '#E8B866',
    icon: 'wallet',
  },
  {
    id: 'relationships',
    name: 'Relationships & Family',
    description: 'Friends, family, community, and meaningful connections',
    color: '#E5707F',
    icon: 'users',
  },
  {
    id: 'personal',
    name: 'Personal Projects',
    description: 'Creative pursuits, side ventures, and passions',
    color: '#A39FB8',
    icon: 'sparkles',
  },
] as const;

export const onboardingStep1Schema = z.object({
  timezone: z.string().min(1, 'Timezone is required'),
  locale: z.string().min(1, 'Locale is required'),
  working_days: z.array(z.number().int().min(0).max(6)),
  working_hours: workingHoursMapSchema,
});

export type OnboardingStep1Values = {
  timezone: string;
  locale: string;
  working_days: number[];
  working_hours: WorkingHoursMap;
};

export const onboardingStep2Schema = z.object({
  selected_areas: z.array(z.string()),
});

export type OnboardingStep2Values = z.infer<typeof onboardingStep2Schema>;

export const onboardingStep3Schema = z.object({
  goal_title: z.string().trim().max(120, 'Goal title must not exceed 120 characters').optional(),
  goal_area_id: z.string().optional(),
  goal_target_date: z.string().optional(),
});

export type OnboardingStep3Values = z.infer<typeof onboardingStep3Schema>;

export interface CompleteOnboardingPayload {
  userId: string;
  step1: OnboardingStep1Values;
  step2: OnboardingStep2Values;
  step3: OnboardingStep3Values;
}
