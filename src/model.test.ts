import { describe, expect, it } from 'vitest';
import { previewTrailImports, readyRate, statusLabel, toCsv, toMarkdown, trailStatus, type Trail } from './model';

const complete: Trail = {
  id: '1', claim: 'Archives shape public memory.', sourceTitle: 'Archive Fever', authors: 'Jacques Derrida',
  sourceRef: '10.0000/example', year: '1995', locator: 'p. 11', evidence: 'Archives participate in making history.',
  reason: 'The passage treats the archive as an active practice, not a neutral container.', counterevidence: false,
  createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z'
};

describe('trailStatus', () => {
  it('distinguishes a spot-checkable trail from missing reasoning links', () => {
    expect(trailStatus(complete)).toBe('ready');
    expect(trailStatus({ ...complete, locator: '' })).toBe('needs-locator');
    expect(statusLabel(trailStatus({ ...complete, reason: '' }))).toContain('source matters');
  });

  it('computes classroom readiness without calling it truth verification', () => {
    expect(readyRate([complete, { ...complete, id: '2', locator: '' }])).toBe(50);
  });
});

describe('exports', () => {
  it('includes the exact locator and reasoning in Markdown', () => {
    const output = toMarkdown([complete], 'HIST 201');
    expect(output).toContain('# HIST 201');
    expect(output).toContain('p. 11');
    expect(output).toContain('Why it matters');
  });

  it('quotes CSV content safely', () => {
    const output = toCsv([{ ...complete, claim: 'A claim, with a comma' }]);
    expect(output).toContain('"A claim, with a comma"');
    expect(output.split('\n')).toHaveLength(3);
  });

  it('previews labeled CSV submissions and skips duplicates', () => {
    const csv = toCsv([complete]);
    const preview = previewTrailImports([
      { name: 'Ada Lovelace.csv', text: csv },
      { name: 'Grace Hopper.csv', text: csv.replace('Archives shape public memory.', 'Catalogues shape access.') }
    ], [complete]);
    expect(preview.trails).toHaveLength(1);
    expect(preview.duplicates).toBe(1);
    expect(preview.invalidRows).toBe(0);
    expect(preview.trails[0].importedFrom).toBe('Grace Hopper');
  });

  it('reports malformed or incomplete submission rows before import', () => {
    const preview = previewTrailImports([{ name: 'broken.csv', text: 'claim,authors\nOnly a claim,Student' }], []);
    expect(preview.trails).toEqual([]);
    expect(preview.invalidRows).toBe(1);
  });
});
