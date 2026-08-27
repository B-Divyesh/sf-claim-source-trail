export interface Trail {
  id: string;
  claim: string;
  sourceTitle: string;
  authors: string;
  sourceRef: string;
  year: string;
  locator: string;
  evidence: string;
  reason: string;
  counterevidence: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TrailStatus = 'ready' | 'needs-locator' | 'needs-reason' | 'draft';

export function trailStatus(trail: Trail): TrailStatus {
  if (!trail.locator.trim()) return 'needs-locator';
  if (!trail.reason.trim()) return 'needs-reason';
  if (!trail.evidence.trim()) return 'draft';
  return 'ready';
}

export function statusLabel(status: TrailStatus): string {
  return {
    ready: 'Ready to spot-check',
    'needs-locator': 'Needs an exact locator',
    'needs-reason': 'Needs your reasoning',
    draft: 'Needs an excerpt or paraphrase'
  }[status];
}

export function createTrail(values: Omit<Trail, 'id' | 'createdAt' | 'updatedAt'>): Trail {
  const now = new Date().toISOString();
  return { ...values, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
}

export function readyRate(trails: Trail[]): number {
  if (!trails.length) return 0;
  return Math.round((trails.filter((trail) => trailStatus(trail) === 'ready').length / trails.length) * 100);
}

function md(value: string): string {
  return value.replace(/([\\`*_[\]<>])/g, '\\$1').trim();
}

function citation(trail: Trail): string {
  return [trail.authors, `“${trail.sourceTitle}”`, trail.year, trail.sourceRef]
    .filter((part) => part.trim())
    .join(', ');
}

export function toMarkdown(trails: Trail[], courseLabel = ''): string {
  const title = courseLabel.trim() || 'Claim source trails';
  const sections = trails.map((trail, index) => {
    const stance = trail.counterevidence ? 'Counterevidence' : 'Supporting evidence';
    return [
      `## ${index + 1}. ${md(trail.claim)}`,
      '',
      `- **Source:** ${md(citation(trail))}`,
      `- **Exact location:** ${md(trail.locator) || 'Not recorded'}`,
      `- **Excerpt or paraphrase:** ${md(trail.evidence) || 'Not recorded'}`,
      `- **Why it matters:** ${md(trail.reason) || 'Not recorded'}`,
      `- **Role:** ${stance}`,
      `- **Trail status:** ${statusLabel(trailStatus(trail))}`
    ].join('\n');
  });
  return `# ${md(title)}\n\n${sections.join('\n\n---\n\n')}\n`;
}

function csv(value: string | boolean): string {
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

export function toCsv(trails: Trail[]): string {
  const columns: Array<keyof Trail | 'status'> = [
    'claim', 'sourceTitle', 'authors', 'sourceRef', 'year', 'locator', 'evidence',
    'reason', 'counterevidence', 'status', 'createdAt', 'updatedAt'
  ];
  const rows = trails.map((trail) => columns.map((column) =>
    csv(column === 'status' ? statusLabel(trailStatus(trail)) : trail[column])
  ).join(','));
  return `${columns.join(',')}\n${rows.join('\n')}\n`;
}
