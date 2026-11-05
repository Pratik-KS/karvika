// Run with: NODE_PATH=/tmp/karvika-browser-check/node_modules node frontend/checks/dashboard.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const origin = process.env.KARVIKA_TEST_ORIGIN || 'http://127.0.0.1:8000';
async function login(page) {
  await page.getByLabel('Username', {exact:true}).fill('admin');
  await page.getByLabel('Password', {exact:true}).fill('1234');
  await page.getByRole('button', {name:'Login', exact:true}).click();
}
(async () => {
  const browser = await chromium.launch({headless:true, channel:'chromium', args:['--no-sandbox']});
  try {
    const page = await browser.newPage({viewport:{width:1440,height:1000}});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin + '/employer/');
    await page.getByRole('heading',{name:'Welcome back',exact:true}).waitFor();
    for (const width of [360,390,768,1024,1440]) {
      await page.setViewportSize({width,height:900});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), `Login overflow at ${width}`);
    }
    await page.getByLabel('Username',{exact:true}).fill('admin');
    await page.getByLabel('Password',{exact:true}).fill('wrong');
    await page.getByRole('button',{name:'Show password'}).click();
    assert.equal(await page.locator('#dev-password').getAttribute('type'),'text');
    await page.getByRole('button',{name:'Hide password'}).click();
    assert.equal(await page.locator('#dev-password').getAttribute('type'),'password');
    await page.getByRole('button',{name:'Login',exact:true}).click();
    assert.match(await page.getByRole('alert').innerText(),/Incorrect/);
    assert.equal(await page.locator('.shell').count(),0);
    await login(page);
    await page.reload();
    const action = a => page.locator(`[data-action="${a}"]:visible`).first().click();
    await page.getByRole('heading',{name:'Overview',exact:true}).waitFor();
    await action('nav:dashboard'); assert.equal(await page.locator('h1').innerText(),'Registration Status');
    await page.evaluate(()=>doAction('submitSetup'));
    assert.equal(await page.evaluate(()=>S.data.review),undefined);
    for(const route of ['status','profile','locations','departments','structure','notifications','modules','help','account','overview']) {
      await action('nav:'+route);
      assert.equal(await page.locator('h1').count(),1);
    }
    await action('nav:profile');
    for(const [field,value] of Object.entries({legalName:'Sample Employer',industry:'Technology',email:'sample@example.com',address:'Sample address',city:'Pune',state:'Maharashtra',pin:'411001'}))await page.locator(`[name="${field}"]`).fill(value);
    await page.locator('[name="structure"]').selectOption('Private Limited Company');
    await page.getByRole('button',{name:'Save Employer Details'}).click();
    await action('nav:locations'); await action('addLocation');
    async function fillLocation(name, code) {
      for(const [field,value] of Object.entries({name,code,city:'Pune',state:'Maharashtra',pin:'411001',address:'Sample address'})) await page.locator(`[name="${field}"]`).fill(value);
      await page.locator('[name="type"]').selectOption('Branch');
    }
    await fillLocation('Sample office','HQ'); await action('saveLocationAnother');
    await fillLocation('Duplicate',' hq '); await action('saveLocation');
    assert.equal(await page.locator('.modal').count(),1);
    await page.locator('[name="code"]').fill('BR'); await action('saveLocation');
    assert.equal(await page.locator('tbody tr').count(),2);
    await action('editLocation:0'); await page.locator('[name="name"]').fill('Updated office'); await action('saveLocation');
    await action('toggleLocation:0'); await action('confirmToggleLocation');
    assert.match(await page.locator('tbody tr').first().innerText(),/Inactive/);
    await action('nav:departments'); await action('addDepartment');
    assert.equal(await page.locator('[name="code"]').inputValue(),'DEPT-001');
    assert.ok(await page.locator('[name="code"]').evaluate(x=>x.readOnly));
    await action('close'); await action('addDepartment');
    assert.equal(await page.locator('[name="code"]').inputValue(),'DEPT-001');
    assert.equal(await page.locator('[name="parent"]').count(),0);
    await page.getByLabel('Remarks / Notes (optional)').fill('Department notes');
    await page.locator('[name="name"]').fill('People'); await action('saveDepartment');
    await action('addSubdepartment');
    assert.equal(await page.locator('[name="code"]').inputValue(),'DEPT-002');
    await page.locator('[name="name"]').fill('Hiring'); await page.locator('[name="parent"]').selectOption({label:'People'}); await action('saveDepartment');
    await action('editDepartment:0');
    assert.equal(await page.getByLabel('Remarks / Notes (optional)').inputValue(),'Department notes');
    await page.locator('[name="name"]').fill('People team'); await action('saveDepartment');
    assert.match(await page.locator('.items').innerText(),/DEPT-001/);
    await page.evaluate(()=>doAction('submitSetup'));
    assert.equal(await page.evaluate(()=>S.data.review),undefined);
    await action('nav:structure');
    for(const [tab,prefix] of [['Designations','DES'],['Grades','GRD'],['Employment Types','EMP'],['Employee Categories','CAT']]) {
      await action('tab:'+tab); await action('addStructure');
      assert.equal(await page.locator('[name="code"]').inputValue(),prefix+'-001');
      assert.ok(await page.locator('[name="code"]').evaluate(x=>x.readOnly));
      await page.locator('[name="name"]').fill('Sample '+tab); await action('saveStructure');
      await action('addStructure');
      assert.equal(await page.locator('[name="code"]').inputValue(),prefix+'-002');
      await page.locator('[name="name"]').fill('Second '+tab); await action('saveStructure');
      await action('editStructure:0'); await page.locator('[name="name"]').fill('Updated '+tab); await action('saveStructure');
      assert.match(await page.locator('tbody tr').first().innerText(),new RegExp(prefix+'-001'));
    }
    await page.reload(); await action('nav:departments'); await action('editDepartment:0');
    assert.equal(await page.getByLabel('Remarks / Notes (optional)').inputValue(),'Department notes'); await action('close');
    await action('editDepartment:1'); assert.ok(await page.locator('[name="parent"]').inputValue()); await action('saveDepartment');
    await action('addDepartment');
    assert.equal(await page.locator('[name="code"]').inputValue(),'DEPT-003'); await action('close');
    await action('nav:structure'); await action('addStructure');
    assert.equal(await page.locator('[name="code"]').inputValue(),'DES-003'); await action('close');
    // Existing manual codes survive editing; generated codes skip case-insensitive collisions.
    await page.evaluate(()=>{S.data.departments[0].code='LEGACY';S.data.departments[1].code='dept-001';persist()});
    await action('nav:departments'); await action('editDepartment:0'); await action('saveDepartment');
    assert.match(await page.locator('.items').innerText(),/LEGACY/);
    await action('addDepartment');
    assert.equal(await page.locator('[name="code"]').inputValue(),'DEPT-002'); await action('close');
    await page.reload(); await action('nav:locations'); assert.equal(await page.locator('tbody tr').count(),2);
    await page.screenshot({path:'/tmp/karvika-desktop.png',fullPage:true});
    for(const width of [360,390,768,1024,1440]) {
      await page.setViewportSize({width,height:900});
      if(width<=780) await action('toggleNav');
      await action('nav:overview');
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${width}`);
      if(width<=780) {
        await action('toggleNav'); await action('nav:locations'); await action('addLocation');
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Dialog overflow at ${width}`);
        await page.keyboard.press('Escape'); assert.equal(await page.locator('.modal').count(),0);
      }
      if(width===390) await page.screenshot({path:'/tmp/karvika-mobile.png',fullPage:true});
    }
    // Completing setup never grants approval; only the external review fixture does.
    await page.setViewportSize({width:1440,height:1000});
    await action('nav:overview');
    await action('submitSetup');
    assert.equal(await page.locator('h1').innerText(),'Registration Status');
    assert.equal(await page.evaluate(()=>S.data.review.status),'pending');
    await action('nav:dashboard'); assert.equal(await page.locator('h1').innerText(),'Registration Status');
    await page.reload(); assert.equal(await page.evaluate(()=>S.data.review.status),'pending');
    // Simulated admin result for browser QA only; employers have no approval action.
    await page.evaluate(()=>{S.data.review.status='approved';persist()});
    await page.reload();
    await page.getByRole('heading',{name:'Employer Dashboard',exact:true}).waitFor();
    assert.equal(await page.locator('.grid4 .module').count(),4);
    assert.equal(await page.locator('.hero h2').innerText(),'Your workspace is active');
    assert.match(await page.locator('.kpi-row').innerText(),/Active HRMS licenses/);
    assert.match(await page.locator('.view').innerText(),/Organization approved — feature licenses still required/);
    await action('nav:modules'); assert.match(await page.locator('.view').innerText(),/No active module entitlements displayed/);
    await action('nav:dashboard');
    assert.equal(await page.locator('.orgname').innerText(),'Sample Employer');
    assert.equal(await page.getByRole('button',{name:'Approve',exact:true}).count(),0);
    await page.screenshot({path:'/tmp/karvika-employer-dashboard.png',fullPage:true});
    for(const width of [360,390,768,1024,1440]) {
      await page.setViewportSize({width,height:900});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Employer dashboard overflow at ${width}`);
      if(width===390)await page.screenshot({path:'/tmp/karvika-employer-dashboard-mobile.png',fullPage:true});
    }
    // Revocation closes direct dashboard navigation too.
    await page.evaluate(()=>{S.data.review.status='rejected';persist();setPage('dashboard')});
    assert.equal(await page.locator('h1').innerText(),'Registration Status');
    await page.evaluate(()=>{S.data.review.status='approved';persist();S.data.departments=[];setPage('dashboard')});
    assert.equal(await page.locator('h1').innerText(),'Registration Status');
    assert.deepEqual(errors,[]);
    await action('logout'); await action('confirmLogout');
    await page.getByRole('heading',{name:'Welcome back'}).waitFor();
    await page.reload();
    await page.getByRole('heading',{name:'Welcome back'}).waitFor();
    await login(page);
    const blocked=await browser.newContext(); await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage blocked')}}));
    const noStorage=await blocked.newPage(); await noStorage.goto(origin + '/employer/'); await login(noStorage); await noStorage.getByRole('heading',{name:'Overview',exact:true}).waitFor(); await blocked.close();
    console.log('PASS: login, invalid credentials, password toggle, session reload, logout, responsive login, all screens, profile save, location add/edit persistence and duplicate rejection, department hierarchy, automatic codes, saved remarks, structure creation, setup submission, pending/approved/rejected access, approved dashboard, blocked storage, mobile navigation, dialogs, and overflow at five widths.');
  } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
