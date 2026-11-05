'use strict';
// Local demonstration only. Replace this entire gate with production authentication.
// Public client-side credentials and sessionStorage provide no data protection.
const KarvikaDevSession = (() => {
  const key = 'karvika.employer.dev-session.v1';
  return {
    active() { try { return sessionStorage.getItem(key) === 'demo'; } catch { return false; } },
    clear() { try { sessionStorage.removeItem(key); } catch {} },
    login(form) {
      const valid = form.elements.username.value === 'admin' && form.elements.password.value === '1234';
      const error = document.getElementById('dev-login-error');
      error.textContent = valid ? '' : 'Incorrect username or password. Please try again.';
      for (const name of ['username', 'password']) form.elements[name].setAttribute('aria-invalid', String(!valid));
      if (!valid) { form.elements.password.focus(); return false; }
      try { sessionStorage.setItem(key, 'demo'); } catch { /* Memory-only session until reload when storage is blocked. */ }
      form.reset();
      return true;
    },
    screen() {
      return `<main class="dev-login"><section class="dev-story" aria-label="Karvika Employer Workspace"><div class="dev-brand"><span class="mark">K</span> KARVIKA</div><div><p class="dev-eyebrow">EMPLOYER WORKSPACE</p><h1>Your people.<br>Your workspace.<br>One clear view.</h1><p>A dedicated space to organize your company and bring your teams together.</p><div class="dev-story-line"></div><span>Built for the way you work.</span></div><small>Karvika HRMS · Local development preview</small></section><section class="dev-panel"><div class="dev-form-wrap"><span class="pill">Development workspace</span><h2>Welcome back</h2><p class="dev-intro">Log in to your Employer Workspace.</p><form id="dev-login"><div class="field"><label for="dev-username">Username</label><input id="dev-username" name="username" autocomplete="username" required aria-describedby="dev-login-error"></div><div class="field"><label for="dev-password">Password</label><div class="dev-password"><input id="dev-password" name="password" type="password" autocomplete="current-password" required aria-describedby="dev-login-error"><button type="button" id="dev-password-toggle" aria-controls="dev-password" aria-label="Show password" aria-pressed="false">Show</button></div></div><p id="dev-login-error" class="error" role="alert" aria-live="polite"></p><button class="btn primary dev-submit" type="submit">Login <span aria-hidden="true">→</span></button></form><details class="dev-recovery"><summary>Forgot password?</summary><p>This demo uses a shared login. Sign in with username <b>admin</b> and password <b>1234</b>. Password reset by email is not available in this demo.</p></details><aside class="dev-disclaimer"><strong>Local demo only</strong><p>Use <b>admin / 1234</b>. This client-side login is not secure authentication. Use sample data only; never enter real employee information.</p></aside><a href="../connect/">Connect with Karvika ↗</a></div></section></main>`;
    }
  };
})();
document.addEventListener('click', event => {
  if (!event.target.closest('#dev-password-toggle')) return;
  const input = document.getElementById('dev-password');
  const button = document.getElementById('dev-password-toggle');
  const visible = input.type === 'password';
  input.type = visible ? 'text' : 'password';
  button.textContent = visible ? 'Hide' : 'Show';
  button.setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
  button.setAttribute('aria-pressed', String(visible));
});
