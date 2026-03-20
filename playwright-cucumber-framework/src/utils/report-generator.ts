import * as fs from 'fs';
import * as path from 'path';

interface CucumberReport {
  name: string;
  elements: CucumberScenario[];
}

interface CucumberScenario {
  name: string;
  description: string;
  steps: CucumberStep[];
  tags: Array<{ name: string }>;
}

interface CucumberStep {
  keyword: string;
  name: string;
  result: {
    status: string;
    duration?: number;
    error_message?: string;
  };
}

async function generateReport(): Promise<void> {
  const reportPath = path.join('reports', 'cucumber-report.json');

  if (!fs.existsSync(reportPath)) {
    console.log('No cucumber-report.json found. Run tests first.');
    return;
  }

  const rawData = fs.readFileSync(reportPath, 'utf-8');
  const cucumberReport: CucumberReport[] = JSON.parse(rawData);

  let totalScenarios = 0;
  let passedScenarios = 0;
  let failedScenarios = 0;
  let skippedScenarios = 0;
  const failedTests: { scenario: string; step: string; error: string }[] = [];

  for (const feature of cucumberReport) {
    for (const scenario of feature.elements || []) {
      totalScenarios++;
      const scenarioStatus = getScenarioStatus(scenario.steps);

      if (scenarioStatus === 'passed') passedScenarios++;
      else if (scenarioStatus === 'failed') {
        failedScenarios++;
        const failedStep = scenario.steps.find((s) => s.result.status === 'failed');
        if (failedStep) {
          failedTests.push({
            scenario: scenario.name,
            step: `${failedStep.keyword}${failedStep.name}`,
            error: failedStep.result.error_message?.split('\n')[0] || 'Unknown error',
          });
        }
      } else {
        skippedScenarios++;
      }
    }
  }

  const passRate = totalScenarios > 0 ? ((passedScenarios / totalScenarios) * 100).toFixed(1) : '0';

  const htmlReport = generateHtmlReport({
    totalScenarios,
    passedScenarios,
    failedScenarios,
    skippedScenarios,
    passRate,
    failedTests,
    timestamp: new Date().toISOString(),
  });

  const htmlPath = path.join('reports', 'summary-report.html');
  fs.writeFileSync(htmlPath, htmlReport);

  console.log('\n📊 TEST EXECUTION SUMMARY');
  console.log('═'.repeat(50));
  console.log(`  Total Scenarios  : ${totalScenarios}`);
  console.log(`  Passed           : ✅ ${passedScenarios}`);
  console.log(`  Failed           : ❌ ${failedScenarios}`);
  console.log(`  Skipped          : ⏭  ${skippedScenarios}`);
  console.log(`  Pass Rate        : ${passRate}%`);
  console.log('═'.repeat(50));
  console.log(`\nHTML Report: ${htmlPath}\n`);
}

function getScenarioStatus(steps: CucumberStep[]): string {
  if (steps.some((s) => s.result.status === 'failed')) return 'failed';
  if (steps.some((s) => s.result.status === 'skipped')) return 'skipped';
  return 'passed';
}

function generateHtmlReport(data: {
  totalScenarios: number;
  passedScenarios: number;
  failedScenarios: number;
  skippedScenarios: number;
  passRate: string;
  failedTests: Array<{ scenario: string; step: string; error: string }>;
  timestamp: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Test Execution Report</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 2rem; }
    h1 { color: #38bdf8; margin-bottom: 0.5rem; }
    .subtitle { color: #64748b; margin-bottom: 2rem; font-size: 0.9rem; }
    .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
    .card { background: #1e293b; border-radius: 12px; padding: 1.5rem; text-align: center; }
    .card .value { font-size: 2.5rem; font-weight: bold; }
    .card .label { color: #64748b; font-size: 0.85rem; margin-top: 0.25rem; }
    .passed .value { color: #22c55e; }
    .failed .value { color: #ef4444; }
    .skipped .value { color: #f59e0b; }
    .total .value { color: #38bdf8; }
    .progress-bar { background: #1e293b; border-radius: 8px; height: 12px; overflow: hidden; margin-bottom: 2rem; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #22c55e, #38bdf8); border-radius: 8px; transition: width 0.5s; }
    table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 12px; overflow: hidden; }
    th { background: #0f172a; color: #38bdf8; padding: 1rem; text-align: left; font-size: 0.85rem; text-transform: uppercase; }
    td { padding: 0.75rem 1rem; border-bottom: 1px solid #334155; font-size: 0.9rem; }
    tr:last-child td { border-bottom: none; }
    .tag-failed { background: #450a0a; color: #fca5a5; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; }
  </style>
</head>
<body>
  <h1>🧪 Test Execution Report</h1>
  <p class="subtitle">Generated: ${data.timestamp}</p>
  <div class="cards">
    <div class="card total"><div class="value">${data.totalScenarios}</div><div class="label">Total</div></div>
    <div class="card passed"><div class="value">${data.passedScenarios}</div><div class="label">Passed</div></div>
    <div class="card failed"><div class="value">${data.failedScenarios}</div><div class="label">Failed</div></div>
    <div class="card skipped"><div class="value">${data.skippedScenarios}</div><div class="label">Skipped</div></div>
  </div>
  <p>Pass Rate: <strong>${data.passRate}%</strong></p>
  <div class="progress-bar"><div class="progress-fill" style="width:${data.passRate}%"></div></div>
  ${
    data.failedTests.length > 0
      ? `<h2 style="color:#ef4444;">Failed Tests</h2>
  <table>
    <thead><tr><th>Scenario</th><th>Failed Step</th><th>Error</th></tr></thead>
    <tbody>
      ${data.failedTests
        .map(
          (t) =>
            `<tr><td>${t.scenario}</td><td><span class="tag-failed">${t.step}</span></td><td>${t.error}</td></tr>`
        )
        .join('')}
    </tbody>
  </table>`
      : '<p style="color:#22c55e;">✅ All tests passed!</p>'
  }
</body>
</html>`;
}

generateReport().catch(console.error);
