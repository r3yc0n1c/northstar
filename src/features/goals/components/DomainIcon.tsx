import type { ComponentType } from 'react';
import {
  BookOpen,
  Briefcase,
  Compass,
  Folder,
  HeartPulse,
  Home,
  Palette,
  Plane,
  Sparkles,
  Target,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react';
import type { DomainIconName } from '../schema';

const ICON_COMPONENTS: Record<DomainIconName, ComponentType<{ className?: string }>> = {
  briefcase: Briefcase,
  'heart-pulse': HeartPulse,
  'book-open': BookOpen,
  wallet: Wallet,
  users: Users,
  sparkles: Sparkles,
  compass: Compass,
  trophy: Trophy,
  target: Target,
  home: Home,
  plane: Plane,
  palette: Palette,
  folder: Folder,
};

interface DomainIconProps {
  name: string;
  className?: string;
}

export function DomainIcon({ name, className = 'h-4 w-4' }: DomainIconProps) {
  const IconComponent = ICON_COMPONENTS[name as DomainIconName] || ICON_COMPONENTS.folder;

  return <IconComponent className={className} />;
}
