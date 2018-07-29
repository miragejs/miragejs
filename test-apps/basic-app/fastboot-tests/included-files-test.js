const FastBoot = require('fastboot');
const { execFileSync } = require('child_process');
const { module: qModule, test } = require('qunit');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const findTextFromHtml = (html, selector) => {
  let document = new JSDOM(html).window.document;
  return document.querySelector(selector)
    .textContent
    .trim();
};

qModule('basic-app | fastboot | included files', function(hooks) {

  test('it includes all modules in development by default', async function(assert) {
    execFileSync('node', [
      require.resolve('ember-cli/bin/ember'),
      'build'
    ]);
    let fastboot = new FastBoot({
      distPath: 'dist',
      resilient: false
    });

    let page = await fastboot.visit('/');
    let html = await page.html();

    assert.equal(findTextFromHtml(html, '[data-test-id="environment"]'), 'development');
    assert.ok(+findTextFromHtml(html, '[data-test-id="mirage-module-count"]') > 1);
    assert.ok(+findTextFromHtml(html, '[data-test-id="other-module-count"]') > 1);
  });

  test('it includes all modules in test by default', async function(assert) {
    execFileSync('node', [
      require.resolve('ember-cli/bin/ember'),
      'build',
      '--environment=test'
    ]);
    let fastboot = new FastBoot({
      distPath: 'dist',
      resilient: false
    });

    let page = await fastboot.visit('/');
    let html = await page.html();

    assert.equal(findTextFromHtml(html, '[data-test-id="environment"]'), 'test');
    assert.ok(+findTextFromHtml(html, '[data-test-id="mirage-module-count"]') > 1);
    assert.ok(+findTextFromHtml(html, '[data-test-id="other-module-count"]') > 1);
  });

  test('it only includes an initializer in production by default', async function(assert) {
    execFileSync('node', [require.resolve('ember-cli/bin/ember'), 'build', '-prod']);
    let fastboot = new FastBoot({
      distPath: 'dist',
      resilient: false
    });
    let page = await fastboot.visit('/');
    let html = await page.html();

    assert.equal(findTextFromHtml(html, '[data-test-id="environment"]'), 'production');
    assert.equal(findTextFromHtml(html, '[data-test-id="mirage-module-count"]'), '0');
    assert.equal(findTextFromHtml(html, '[data-test-id="other-module-count"]'), '1');
  });

  test('all files can be included in production by explicitly setting enabled to true', async function(assert) {
    process.env.MIRAGE_ENABLED = 'true';
    execFileSync('node', [
      require.resolve('ember-cli/bin/ember'),
      'build',
      '-prod'
    ]);
    let fastboot = new FastBoot({
      distPath: 'dist',
      resilient: false
    });
    let page = await fastboot.visit('/');
    let html = await page.html();

    assert.equal(findTextFromHtml(html, '[data-test-id="environment"]'), 'production');
    assert.ok(+findTextFromHtml(html, '[data-test-id="mirage-module-count"]') > 1);
    assert.ok(+findTextFromHtml(html, '[data-test-id="other-module-count"]') > 1);
  });
});
