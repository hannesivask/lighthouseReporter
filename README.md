# Lighthouse CI

## Overview

This Lighthouse CI customization is used to run the Lighthouse scanner on web pages in the CI/CD environment
This tool uses [lighthouse-ci](https://github.com/GoogleChrome/lighthouse-ci) in the background to create detailed reports.

## Features:

- ✅ Detailed Reports as JSON and a HTML interface
- ✅ HTML interface for a summarized report for all pages
- ✅ Code quality JSON for Gitlab

## Configuration

### Configuration File

Before running the tool, configure lighthouse-ci by creating a `lighthouserc.js` file and using the guide found in the [lighthouse-ci repository](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md)

Set the upload target to `filesystem` and outputDir to `./lighthouse-results`

Example configuration file `lighthouserc.js`:

```js
module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run start", // Or other command to start a local server
      settings: { chromeFlags: "--no-sandbox" },
      staticDistDir: "dist",
      numberOfRuns: 1,
    },
    assert: {
      preset: "lighthouse:recommended",
    },
    upload: {
      target: "filesystem",
      outputDir: "./lighthouse-results",
    },
    server: {
      // Server options here
    },
    wizard: {
      // Wizard options here
    },
  },
};
```

## Running Lighthouse CI

Run Lighthouse CI by adding a job in the Gitlab CI pipeline.

Example `.gitlab-ci.yml` entry:

```yaml
lhci:autorun:
  stage: test
  allow_failure: true
  script:
    - npm install -g @lhci/cli@0.14.x
    - lhci autorun || echo "LHCI failed!"
    - node '${NPM_WORKSPACE_PATH}/accessibility/lighthouseCI/index.mjs'
  artifacts:
    paths:
      - "${NPM_WORKSPACE_PATH}/lighthouse-results"
    reports:
      codequality: "${NPM_WORKSPACE_PATH}/lighthouse-results/code_quality.json"
    expire_in: 7 day
```

This job initiates Lighthouse CI and generates the HTML interface as the summarized report and Gitlab code quality JSON. Results are saved in the `lighthouse-results` folder as:

- lhci-results-qc.jso
- index.html

### Viewing Results

1. Gitlab UI will display info from `accessibilityTester-results-qc.json` in the code quality section.
2. If running in a CI/CD environment, then download artifacts from the job.
3. Open the `index.html` file in your browser.
4. The page will display the summarized results from `manifest.json` and will reference the urls for each page scanned.

## Dependencies

The project relies on the following npm packages:

- [**lighthouse-ci**](https://github.com/GoogleChrome/lighthouse-ci/tree/main)
