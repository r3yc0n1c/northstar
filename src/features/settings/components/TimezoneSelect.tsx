import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
} from '@/components/ui';
import { COMMON_TIMEZONES } from '../schema';

export interface TimezoneSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TimezoneSelect({ value, onChange, disabled }: TimezoneSelectProps) {
  const [search, setSearch] = useState('');

  const filteredTimezones = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      // Ensure the current value is in the list even if not in common list
      if (value && !COMMON_TIMEZONES.includes(value as (typeof COMMON_TIMEZONES)[number])) {
        return [value, ...COMMON_TIMEZONES];
      }
      return COMMON_TIMEZONES;
    }
    return COMMON_TIMEZONES.filter((tz) => tz.toLowerCase().includes(query));
  }, [search, value]);

  return (
    <div className="space-y-1.5">
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full font-mono text-xs">
          <SelectValue placeholder="Select timezone" />
        </SelectTrigger>
        <SelectContent className="max-h-64">
          <div className="p-2 border-b border-border sticky top-0 bg-surface-2 z-10">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-2" />
              <Input
                placeholder="Search timezone (e.g. New_York, London)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-xs font-mono bg-surface"
              />
            </div>
          </div>
          <div className="py-1">
            {filteredTimezones.length === 0 ? (
              <div className="py-2 px-3 text-xs text-text-3 font-mono text-center">
                No matching timezones
              </div>
            ) : (
              filteredTimezones.map((tz) => (
                <SelectItem key={tz} value={tz} className="font-mono text-xs">
                  {tz.replace(/_/g, ' ')}
                </SelectItem>
              ))
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
