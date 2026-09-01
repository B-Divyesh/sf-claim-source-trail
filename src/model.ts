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
  importedFrom?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportFile {
  name: string;
  text: string;
}

export interface ImportPreview {
  trails: Trail[];
  duplicates: number;
  invalidRows: number;
  files: Array<{ label: string; newCount: number; duplicateCount: number; invalidCount: number }>;
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
    ready: 'Ready to review',
    'needs-locator': 'Needs an exact location',
    'needs-reason': 'Needs why the source matters',
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
      ...(trail.importedFrom ? [`- **Submission:** ${md(trail.importedFrom)}`] : []),
      `- **Trail status:** ${statusLabel(trailStatus(trail))}`
    ].join('\n');
  });
  return `# ${md(title)}\n\n${sections.join('\n\n---\n\n')}\n`;
}

function csv(value: string | boolean | undefined): string {
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

export function toCsv(trails: Trail[]): string {
  const columns: Array<keyof Trail | 'status'> = [
    'claim', 'sourceTitle', 'authors', 'sourceRef', 'year', 'locator', 'evidence',
    'reason', 'counterevidence', 'importedFrom', 'status', 'createdAt', 'updatedAt'
  ];
  const rows = trails.map((trail) => columns.map((column) =>
    csv(column === 'status' ? statusLabel(trailStatus(trail)) : trail[column])
  ).join(','));
  return `${columns.join(',')}\n${rows.join('\n')}\n`;
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"') quoted = true;
    else if (character === ',') { row.push(field); field = ''; }
    else if (character === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
    else field += character;
  }
  if (field || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
  if (quoted) throw new Error('A quoted field is not closed.');
  return rows.filter((values) => values.some((value) => value.trim()));
}

export function trailFingerprint(trail: Pick<Trail, 'claim' | 'sourceTitle' | 'authors' | 'sourceRef' | 'year' | 'locator' | 'evidence' | 'reason' | 'counterevidence'>): string {
  return [trail.claim, trail.sourceTitle, trail.authors, trail.sourceRef, trail.year, trail.locator, trail.evidence, trail.reason]
    .map((value) => value.trim().toLocaleLowerCase())
    .concat(trail.counterevidence ? '1' : '0')
    .join('\u241f');
}

function safeDate(value: string, fallback: string): string {
  return value && !Number.isNaN(Date.parse(value)) ? new Date(value).toISOString() : fallback;
}

export function previewTrailImports(files: ImportFile[], existing: Trail[]): ImportPreview {
  const seen = new Set(existing.map(trailFingerprint));
  const trails: Trail[] = [];
  let duplicates = 0;
  let invalidRows = 0;
  const summaries: ImportPreview['files'] = [];

  for (const file of files) {
    const label = file.name.replace(/\.csv$/i, '').trim().slice(0, 80) || 'Imported submission';
    let fileDuplicates = 0;
    let fileInvalid = 0;
    let fileNew = 0;
    let rows: string[][];
    try { rows = parseCsvRows(file.text); } catch { rows = []; fileInvalid = 1; }
    const headers = rows.shift()?.map((header) => header.trim()) || [];
    const required = ['claim', 'sourceTitle'];
    if (!required.every((header) => headers.includes(header))) {
      fileInvalid += rows.length || (fileInvalid ? 0 : 1);
    } else {
      for (const row of rows) {
        const value = (name: string) => row[headers.indexOf(name)]?.trim() || '';
        const claim = value('claim');
        const sourceTitle = value('sourceTitle');
        if (!claim || !sourceTitle) { fileInvalid += 1; continue; }
        const now = new Date().toISOString();
        const trail: Trail = {
          id: crypto.randomUUID(), claim, sourceTitle, authors: value('authors'), sourceRef: value('sourceRef'),
          year: value('year'), locator: value('locator'), evidence: value('evidence'), reason: value('reason'),
          counterevidence: value('counterevidence').toLocaleLowerCase() === 'true', importedFrom: label,
          createdAt: safeDate(value('createdAt'), now), updatedAt: safeDate(value('updatedAt'), now)
        };
        const fingerprint = trailFingerprint(trail);
        if (seen.has(fingerprint)) { fileDuplicates += 1; continue; }
        seen.add(fingerprint); trails.push(trail); fileNew += 1;
      }
    }
    duplicates += fileDuplicates;
    invalidRows += fileInvalid;
    summaries.push({ label, newCount: fileNew, duplicateCount: fileDuplicates, invalidCount: fileInvalid });
  }
  return { trails, duplicates, invalidRows, files: summaries };
}
