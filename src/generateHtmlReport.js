import fs from 'node:fs';
import path from 'node:path';

export function generateIndexHtml() {
  const resultsDir = path.resolve('./lighthouse-results');
  const manifestPath = path.join(resultsDir, 'manifest.json');

  const manifest = readJsonFile(manifestPath);
  if (!manifest) {
    throw new Error('manifest.json not found. Make sure LHCI was run with upload.target=filesystem');
  }

  const htmlPath = path.join(resultsDir, 'index.html');
  fs.writeFileSync(htmlPath, generateHtml(manifest), 'utf8');
  console.log('index.html created successfully in lighthouse-results directory!');
}

function readJsonFile(filePath) {
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : null;
}

function createSummaryList(summary) {
  return Object.entries(summary)
    .map(([metric, value]) => {
      const percentage = (value * 100).toFixed(0) + '%';
      return `<li>${metric}: ${percentage}</li>`;
    })
    .join('');
}

function manifestToRowData(page) {
  return {
    url: new URL(page.url).pathname,
    reportFilename: path.basename(page.htmlPath),
    summaryList: createSummaryList(page.summary),
  };
}

function createTableRows(rows) {
  return rows
    .map(
      ({ url, reportFilename, summaryList }) => `
        <tr>
            <td>${url}</td>
            <td>
                <ul>
                    ${summaryList}
                </ul>
            </td>
            <td>
                <a href="${reportFilename}">View Report</a>
            </td>
        </tr>`
    )
    .join('');
}

function generateHtml(manifest) {
  const rows = manifest.map(manifestToRowData);
  return `
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Lighthouse Report Summary</title>
        <style>
            body {
                margin: 20px;
                font-family: sans-serif;
            }
            h1 {
                margin-bottom: 20px;
            }
            table {
                border-collapse: collapse;
                width: 100%;
                max-width: 800px;
            }
            th, td {
                padding: 8px;
                text-align: left;
                border: 1px solid #999;
            }
            th {
                background: #f2f2f2;
            }
            a {
                color: #06c;
            }
            ul {
                margin: 0;
                padding: 0;
                list-style: none;
            }
        </style>
    </head>
    <body>
        <h1>Lighthouse Report Summary</h1>
        <table>
            <thead>
                <tr>
                    <th>Page</th>
                    <th>Performance Score</th>
                    <th>Report</th>
                </tr>
            </thead>
            <tbody>
                ${createTableRows(rows)}
            </tbody>
        </table>
    </body>
</html>`;
}
