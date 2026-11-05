// Read-only check: node frontend/checks/supabase.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const context = vm.createContext({fetch, AbortSignal});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../employer/supabase.js'), 'utf8'), context);
(async () => {
  assert.equal(await vm.runInContext('KarvikaSupabase.checkConnection()', context), true);
  console.log('PASS: configured Supabase project accepts the publishable key (read-only Auth settings request).');
})().catch(error => {console.error(error.message); process.exitCode = 1});
