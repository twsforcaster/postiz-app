// SPDX-License-Identifier: AGPL-3.0-only
// New modules remain disabled until explicitly configured.
export const modules = Object.freeze(['brand','content','creative','video','agents','crm','intelligence','billing']);
export function moduleEnabled(name, env = process.env) {
  if (!modules.includes(name)) return false;
  const prefix = 'MARKETING_OS_' + name.toUpperCase();
  if (env[prefix + '_ENABLED'] !== 'true') return false;
  // No module is ready for activation in the foundation release.
  return false;
}
export function capabilities(env = process.env) {
  return Object.fromEntries(modules.map(name => [name, moduleEnabled(name, env)]));
}
