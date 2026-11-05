# Employer dashboard

This static frontend matches `design-reference/Karvika_Employer_Activated_Workspace_v1.html` and uses its native HTML/CSS/JavaScript approach. No application build or runtime dependencies are required. Existing root and `/connect/` pages are retained and link to `/employer/`.

## Preview on Android

On the machine containing this checkout:

```sh
python3 -m http.server 8000 --bind 0.0.0.0 --directory /root/karvika/frontend
```

With your Android phone on the same network, open `http://<computer-LAN-IP>:8000/employer/` in Chrome. Obtain the computer's LAN IP from its network settings or `hostname -I`. `localhost` on the phone points to the phone, not the computer. For a remote host, use its reachable address and allow port 8000 only as needed for preview; alternatively use an existing private SSH tunnel. Stop the server with Ctrl+C.

For existing static hosting, upload the frontend contents (including `employer/`) to the web root, then open `https://<your-host>/employer/`. This change does not publish automatically.

## Current integration boundary

The supplied checkout has no backend files, API client, authentication provider, database schema, package manifest, or build pipeline. This dashboard is consequently a **local interactive preview**, not a production authenticated employer application. New setup starts without authorization. Review states are local preview data, not an approval assertion. Setup entries are browser-local sample data stored under `karvika.employer.preview.v1.active`; they are neither uploaded nor shared between devices. Closing the preview does not invalidate a server session. Module access and notifications retain the reference's empty states, without fabricated licenses or messages.

The blueprint's proposed endpoints are not existing API contracts. Live integration requires the actual backend implementation and authentication contract. Do not deploy browser storage as the persistence or authorization layer for real employer records. No backend or database changes were made.

## Checks

```sh
node --check frontend/employer/dashboard.js
git -C frontend diff --check
```

Run the browser regression check while the preview server is running (Playwright is test tooling only, not a frontend dependency):

```sh
npm install --prefix /tmp/karvika-browser-check playwright@1.51.1
/tmp/karvika-browser-check/node_modules/.bin/playwright install chromium
NODE_PATH=/tmp/karvika-browser-check/node_modules node frontend/checks/dashboard.cjs
```

Validation completed: syntax checks, diff whitespace check, static asset links, and Chromium regression tests passed. Browser checks cover all ten screens, profile saving, location creation/editing/deactivation, duplicate-code rejection, departments/subdepartments, structure creation, reload persistence, blocked storage, mobile navigation, dialog closing, and page overflow at 360, 390, 768, 1024 and 1440 pixels. No JavaScript page errors were reported. There is no application build command in this static project.

## Temporary development login

Open `/employer/` and log in with `admin` / `1234`. `dev-login.js` is a separate client-side demonstration gate, not secure authentication. It stores only a demo marker in sessionStorage for the current tab, preserving login through live reload. Logout clears that marker and returns to login; saved sample entries are retained. If browser storage is blocked, login lasts until reload. Never enter real employee information. Future production authentication must replace this gate with server-validated authentication and authorization. No backend APIs, database schemas, or application data were changed.

The login page includes a keyboard-accessible “Forgot password?” disclosure with the shared demo credentials. Email password resets require production authentication and are not available in this demo.

Department and subdepartment codes are generated automatically as `DEPT-001`, `DEPT-002`, etc. Employment structure uses `DES`, `GRD`, `EMP`, and `CAT` prefixes for designations, grades, employment types, and employee categories. Codes are read-only, skip existing codes without regard to letter case, and remain unchanged on edit. Existing manually entered codes are preserved. Canceling a form does not consume a code.

## Employer dashboard and authorization preview

The organization setup overview remains available at `/employer/`. Complete the employer profile, add an active work location and a department, and add at least one record in each of the four employment structure categories. “Submit for Authorization” records a pending submission locally and opens Registration Status. It does not send a request to Karvika. Employers have no approval control.

The Employer Dashboard navigation opens only when setup is complete and the local review fixture has `status: "approved"`. Authorized preview sessions open the dashboard after login or reload. The approved dashboard follows `design-reference/Karvika_Employer_Activated_Workspace_v1.html`: active-state hero, registration/setup/license status tiles, four organization management cards, review timeline, updates, and the module licensing notice. No operational module catalogue or unlicensed operations appear. Automatic codes and saved department remarks remain available in the setup forms. Browser checks simulate an external admin result to exercise approved and rejected states.

Production work still requires a server-validated employer session, submission endpoint, Karvika admin review endpoint, persisted authorization, and enforcement on every protected API. The browser-local `review` object is only a UI fixture and must never be trusted as authorization. No backend exists in this checkout.

## Supabase project connection

`supabase.js` configures `https://zkvpbtheluesqymcsnnk.supabase.co` with the supplied public publishable key. The index loads it before the dashboard. `KarvikaSupabase.checkConnection()` makes a read-only Auth settings request with the `apikey` header and a ten-second timeout. Run `node frontend/checks/supabase.cjs` from the workspace root to verify the connection.

This establishes project connectivity only. The development login, local setup records and review fixtures are still browser-local. Supabase Auth, database schema, tenant policies and admin review must be integrated before those records are stored remotely. No remote data or project settings were changed. The publishable key is intended for browser use and is not an admin credential.
