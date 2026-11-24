# Marketing OS foundation V1.0
Baseline: original Postiz commit 44df988cb1840dc5eb50755536b3e6e326d27fc3.
Keep upstream application and AGPL notices intact. No provider credentials or production actions are enabled by this overlay.
Run the isolated foundation tests: node --test marketing-os/foundation.test.mjs
The capability registry is not wired into upstream routes yet. New modules cannot be enabled until implemented and tested.
Baseline build prerequisites from upstream package.json: Node 22.23.4, pnpm 10.6.1. Use pnpm install --frozen-lockfile, pnpm run build, pnpm test in a disposable environment. Configure PostgreSQL, Redis and Temporal per upstream documentation. Never reuse example secrets.
Audit priorities: tenant boundaries, OAuth token encryption, SSRF protection, dependency advisories, payment verification and publishing idempotency. Existing upstream configuration allows plaintext channel tokens unless encryption is configured; production must verify encryption and migration before onboarding.
Next: inspect actual routes, schema and existing AI/design services before implementing new capabilities. No production readiness claim.
