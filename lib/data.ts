import type { GrowthStandard } from './types';
import index from '@/data/standards/index.json';
import who from '@/data/standards/who.json';

export interface StandardIndex {
  standards: { id: string; name: string; metrics: string[] }[];
}

const STANDARDS: Record<string, GrowthStandard> = {
  who: who as GrowthStandard,
};

export function getStandardIndex(): StandardIndex {
  return index as StandardIndex;
}

export function getStandard(id: string): GrowthStandard {
  const standard = STANDARDS[id];
  if (!standard) throw new Error(`Unknown growth standard: ${id}`);
  return standard;
}
