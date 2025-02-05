import { generateCodeQuality } from './src/createCodeQualityJSON.js';
import { generateIndexHtml } from './src/generateHtmlReport.js';

(async () => {
  try {
    generateCodeQuality();
    generateIndexHtml();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
