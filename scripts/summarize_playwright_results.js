import fs from "node:fs";

const resultsPath = process.argv[2] ?? "test-results/playwright-results.json";
const summaryPath = process.env.GITHUB_STEP_SUMMARY;
const summaryOutputPath = process.env.PLAYWRIGHT_SUMMARY_PATH;
const reportUrl = process.env.PLAYWRIGHT_REPORT_URL;
const resultsUrl = process.env.PLAYWRIGHT_RESULTS_URL;
const workflowRunUrl =
  process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : undefined;

function flattenSuites(suites) {
  return suites.flatMap((suite) => [suite, ...flattenSuites(suite.suites ?? [])]);
}

function clean(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function markdownEscape(value) {
  return clean(value).replaceAll("|", "\\|");
}

function markdownLink(label, url) {
  if (!url) {
    return `\`${label}\``;
  }
  return `[${label}](${url})`;
}

function resultsInstructions() {
  return `Download ${markdownLink(
    "playwright-results.zip",
    resultsUrl,
  )}, unzip it, extract the nested \`*/trace.zip\` file you want, then upload that \`trace.zip\` to ${markdownLink(
    "trace.playwright.dev",
    "https://trace.playwright.dev/",
  )}. Open extracted \`.webm\` files locally for videos.`;
}

function failureMessage(test) {
  const failedResult = [...(test.results ?? [])]
    .reverse()
    .find((result) => ["failed", "timedOut", "interrupted"].includes(result.status));
  const errors =
    failedResult?.errors?.length > 0 ? failedResult.errors : failedResult?.error ? [failedResult.error] : [];
  const firstError = errors.find(Boolean);

  return firstError?.message ?? firstError?.value ?? "";
}

function collectFailedTests(results) {
  return flattenSuites(results.suites ?? []).flatMap((suite) =>
    (suite.specs ?? []).flatMap((spec) =>
      (spec.tests ?? [])
        .filter((test) => ["unexpected", "flaky"].includes(test.status))
        .map((test) => ({
          title: spec.title,
          project: test.projectName,
          status: test.status,
          location: `${spec.file}:${spec.line}`,
          message: failureMessage(test),
        })),
    ),
  );
}

function renderSummary(results) {
  const failedTests = collectFailedTests(results);
  const stats = results.stats ?? {};
  const lines = [
    "## Playwright e2e results",
    "",
    `Expected: ${stats.expected ?? 0} | Flaky: ${stats.flaky ?? 0} | Failed: ${stats.unexpected ?? 0} | Skipped: ${stats.skipped ?? 0}`,
    "",
    "### Artifacts",
    "",
    `- ${markdownLink("playwright-report", reportUrl)}: HTML report for the full e2e run.`,
    `- ${resultsInstructions()}`,
  ];

  if (workflowRunUrl) {
    lines.push(`- Workflow run: ${markdownLink("Run details", workflowRunUrl)}.`);
  }

  lines.push("");

  if (failedTests.length === 0) {
    return [...lines, "### Failed tests", "", "No Playwright tests failed."].join("\n");
  }

  return [
    ...lines,
    "### Failed tests",
    "",
    "| Test | Project | Status | Location | Error |",
    "| --- | --- | --- | --- | --- |",
    ...failedTests.map(
      (test) =>
        `| ${markdownEscape(test.title)} | ${markdownEscape(test.project)} | ${markdownEscape(
          test.status,
        )} | ${markdownEscape(test.location)} | ${markdownEscape(test.message)} |`,
    ),
  ].join("\n");
}

function writeSummary(message) {
  if (summaryPath) {
    fs.appendFileSync(summaryPath, `${message}\n`);
  }

  if (summaryOutputPath) {
    fs.writeFileSync(summaryOutputPath, `${message}\n`);
  }

  if (!summaryPath && !summaryOutputPath) {
    console.log(message);
  }
}

if (!fs.existsSync(resultsPath)) {
  const message = [
    "## Playwright e2e results",
    "",
    `No Playwright JSON results were found at \`${resultsPath}\`.`,
    "",
    `Check the ${markdownLink("playwright-report", reportUrl)} and ${markdownLink(
      "playwright-results",
      resultsUrl,
    )} artifacts if they were uploaded.`,
    resultsInstructions(),
    workflowRunUrl ? `Workflow run: ${markdownLink("Run details", workflowRunUrl)}.` : "",
  ].join("\n");

  writeSummary(message);
  process.exit(0);
}

const results = JSON.parse(fs.readFileSync(resultsPath, "utf8"));
const summary = renderSummary(results);
writeSummary(summary);
