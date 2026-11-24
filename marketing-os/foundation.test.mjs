import { test } from 'node:test';
import assert from 'node:assert/strict';
import { modules, moduleEnabled, capabilities } from './foundation.mjs';
test('all new modules default disabled', () => {
  assert.deepEqual(Object.values(capabilities({})), modules.map(() => false));
});
test('unimplemented modules fail closed even when requested', () => {
  for (const name of modules) assert.equal(moduleEnabled(name, {['MARKETING_OS_'+name.toUpperCase()+'_ENABLED']: 'true'}), false);
});
test('unknown modules fail closed', () => assert.equal(moduleEnabled('unknown', {}), false));
