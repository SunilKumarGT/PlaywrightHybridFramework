/**
 * Allure reporter configuration.
 * Add allure-cucumberjs formatter to cucumber.config.js to activate:
 *
 *   format: ['allure-cucumberjs/reporter']
 *
 * Then generate & open the report:
 *   npx allure generate allure-results --clean -o allure-report
 *   npx allure open allure-report
 */
export const allureConfig = {
  resultsDir:  'allure-results',
  reportDir:   'allure-report',
  projectName: 'Playwright Cucumber AI Framework',
  links: {
    issue: {
      nameTemplate: 'Issue #{}',
      urlTemplate:  'https://github.com/your-org/your-repo/issues/{}',
    },
    tms: {
      nameTemplate: 'TC-{}',
      urlTemplate:  'https://your-tms.example.com/testcase/{}',
    },
  },
  categories: [
    {
      name:           'Broken tests',
      matchedStatuses: ['broken'],
    },
    {
      name:           'Product defects',
      matchedStatuses: ['failed'],
      messageRegex:   '.*AssertionError.*',
    },
    {
      name:           'Test defects',
      matchedStatuses: ['failed'],
      messageRegex:   '.*(timeout|Timeout|TIMEOUT).*',
    },
    {
      name:           'AI test failures',
      matchedStatuses: ['failed'],
      messageRegex:   '.*AI (verification|analysis).*',
    },
  ],
};
