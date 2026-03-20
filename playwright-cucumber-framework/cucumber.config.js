const common = {
  require: [
    'src/hooks/world.ts',
    'src/hooks/hooks.ts',
    'src/steps/**/*.ts',
  ],
  requireModule: ['ts-node/register'],
  format: [
    'progress-bar',
    'json:reports/cucumber-report.json',
    'html:reports/cucumber-report.html',
    '@cucumber/pretty-formatter',
  ],
  formatOptions: { snippetInterface: 'async-await' },
  publishQuiet: true,
};

module.exports = {
  default: {
    ...common,
    paths: ['features/**/*.feature'],
    parallel: 2,
    retry: 1,
  },
  smoke: {
    ...common,
    paths: ['features/**/*.feature'],
    tags: '@smoke',
  },
  regression: {
    ...common,
    paths: ['features/**/*.feature'],
    tags: '@regression',
    parallel: 4,
    retry: 1,
  },
  ui: {
    ...common,
    paths: ['features/ui/**/*.feature'],
    tags: '@ui',
    parallel: 2,
  },
  api: {
    ...common,
    paths: ['features/api/**/*.feature'],
    tags: '@api',
    parallel: 3,
  },
  ai: {
    ...common,
    paths: ['features/ai/**/*.feature'],
    tags: '@ai',
  },
  performance: {
    ...common,
    paths: ['features/performance/**/*.feature'],
    tags: '@performance',
  },
  visual: {
    ...common,
    paths: ['features/visual/**/*.feature'],
    tags: '@visual',
  },
  email: {
    ...common,
    paths: ['features/**/*.feature'],
    tags: '@email',
  },
  allure: {
    ...common,
    paths: ['features/**/*.feature'],
    format: [
      ...common.format,
      'allure-cucumberjs/reporter',
    ],
    parallel: 2,
    retry: 1,
  },
  ci: {
    ...common,
    paths: ['features/**/*.feature'],
    tags: '@smoke or @regression',
    parallel: 4,
    retry: 0,
    format: [
      'json:reports/cucumber-report.json',
      'html:reports/cucumber-report.html',
      'junit:reports/junit.xml',
    ],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true,
  },
};
