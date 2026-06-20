import { describe, it, expect } from 'vitest';
import robots from './robots';
import { BASE_URL } from '@/lib/seo';

describe('robots', () => {
  it('returns the correct sitemap URL', () => {
    const result = robots();
    expect(result.sitemap).toBe(BASE_URL + '/sitemap.xml');
  });

  it('allows all user agents to crawl /', () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    expect(rules).toHaveLength(1);
    const rule = rules[0] as { userAgent: string; allow: string | string[] };
    expect(rule.userAgent).toBe('*');
    expect(rule.allow).toBe('/');
  });
});
