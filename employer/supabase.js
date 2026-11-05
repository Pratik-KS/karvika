'use strict';
// Public browser configuration. Never place a secret/service-role key here.
const KarvikaSupabase = Object.freeze({
  url: 'https://zkvpbtheluesqymcsnnk.supabase.co',
  publishableKey: 'sb_publishable_puMu7YRHWbL9sxMrliFEtg_VLDzRbig',
  async checkConnection() {
    const response = await fetch(`${this.url}/auth/v1/settings`, {
      headers: { apikey: this.publishableKey },
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error(`Supabase connection failed (HTTP ${response.status}).`);
    return true;
  }
});
