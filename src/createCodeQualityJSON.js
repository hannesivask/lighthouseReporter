import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export function generateCodeQuality() {
  const resultsDir = path.resolve('./lighthouse-results');
  const manifestPath = path.join(resultsDir, 'manifest.json');
  const outputPath = path.join(resultsDir, 'lhci-results-qc.json');

  const manifest = readJsonFile(manifestPath);
  if (!manifest) {
    throw new Error('manifest.json not found. Make sure LHCI was run with upload.target=filesystem');
  }

  const issues = manifest.map((page) => {
    const summaryString = stringifySummary(page.summary);
    const severity = Object.values(page.summary).every((v) => v === 1) ? 'info' : 'major';

    return {
      type: 'issue',
      check_name: 'Lighthouse Summary',
      description: [`Page URL: ${new URL(page.url).pathname}`, `Scores: ${summaryString}`].join('\n'),
      categories: ['Performance'],
      severity,
      fingerprint: createFingerprint(`${page.url}-${summaryString}`),
      location: {
        path: '',
        lines: { begin: 1, end: 1 },
      },
    };
  });

  fs.writeFileSync(outputPath, JSON.stringify(issues, null, 2), 'utf8');
  console.log(`Code Quality JSON created successfully at ${outputPath}!`);
}

function readJsonFile(filePath) {
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : null;
}

function createFingerprint(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function stringifySummary(summary) {
  return Object.entries(summary)
    .map(([metric, value]) => {
      const percentage = (value * 100).toFixed(0) + '%';
      return `${metric}: ${percentage}`;
    })
    .join(', ');
}
