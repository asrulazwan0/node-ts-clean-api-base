import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const base = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:3000';
async function request(path, init) {
  return fetch(new URL(path, base), { ...init, signal: AbortSignal.timeout(5000) });
}
for (const path of ['/health/live', '/health/ready']) {
  const response = await request(path);
  assert.equal(response.status, 200, `${path} must return 200`);
}
const user = { email: `smoke-${randomUUID()}@example.test`, name: 'Smoke Test' };
const init = {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(user),
};
const created = await request('/users', init);
assert.equal(created.status, 201, await created.clone().text());
const body = await created.json();
assert.equal(body.success, true);
assert.equal(body.data.email, user.email);
assert.equal('password' in body.data, false);
assert.equal((await request('/users', init)).status, 409);
assert.equal(
  (await request('/users', { ...init, body: JSON.stringify({ email: 'bad', name: ' ' }) })).status,
  400,
);
const nulProfile = { email: `nul-${randomUUID()}@example.test`, name: 'NUL\0Name' };
const nulResponse = await request('/users', { ...init, body: JSON.stringify(nulProfile) });
assert.equal(nulResponse.status, 400);
const nulError = await nulResponse.json();
assert.equal(nulError.error.code, 'VALIDATION_ERROR');
assert.equal(nulError.error.details[0].field, 'name');
assert.equal(
  (
    await request('/users', {
      ...init,
      body: JSON.stringify({ ...nulProfile, name: 'Valid Name' }),
    })
  ).status,
  201,
);
const missing = await request('/missing');
assert.equal(missing.status, 404);
assert.match(missing.headers.get('content-type'), /application\/json/);
console.log(
  'Smoke checks passed: liveness, readiness, creation, conflict, validation, NUL rejection without insertion, JSON 404.',
);
