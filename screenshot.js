const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  
  // 1. Manager Dashboard
  console.log('=== Manager Dashboard ===');
  const page1 = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page1.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page1.waitForTimeout(4000);
  
  // Do login via page
  const managerLogin = await page1.evaluate(async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@legalhub.ir', password: '123456' })
    });
    return await res.json();
  });
  console.log('Manager:', managerLogin.user?.role, managerLogin.user?.firstName);
  
  if (managerLogin.token) {
    await page1.evaluate((data) => {
      const store = JSON.parse(localStorage.getItem('legalhub-store') || '{}');
      store.state = { ...store.state, isAuthenticated: true, currentUser: data.user, token: data.token };
      localStorage.setItem('legalhub-store', JSON.stringify(store));
    }, managerLogin);
    await page1.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await page1.waitForTimeout(10000);
    await page1.screenshot({ path: '/home/z/my-project/download/manager-dashboard.png', fullPage: true });
    console.log('Manager screenshot saved');
  }
  await page1.close();

  // 2. Lawyer Cartable
  console.log('=== Lawyer Cartable ===');
  const page2 = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page2.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page2.waitForTimeout(3000);
  
  const lawyerLogin = await page2.evaluate(async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'lawyer1@legalhub.ir', password: '123456' })
    });
    return await res.json();
  });
  console.log('Lawyer:', lawyerLogin.user?.role, lawyerLogin.user?.firstName);
  
  if (lawyerLogin.token) {
    await page2.evaluate((data) => {
      const store = JSON.parse(localStorage.getItem('legalhub-store') || '{}');
      store.state = { ...store.state, isAuthenticated: true, currentUser: data.user, token: data.token };
      localStorage.setItem('legalhub-store', JSON.stringify(store));
    }, lawyerLogin);
    await page2.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await page2.waitForTimeout(10000);
    await page2.screenshot({ path: '/home/z/my-project/download/lawyer-cartable.png', fullPage: true });
    console.log('Lawyer screenshot saved');
  }
  await page2.close();

  // 3. Client Dashboard
  console.log('=== Client Dashboard ===');
  const page3 = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page3.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page3.waitForTimeout(3000);
  
  const clientLogin = await page3.evaluate(async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'client1@legalhub.ir', password: '123456' })
    });
    return await res.json();
  });
  console.log('Client:', clientLogin.user?.role, clientLogin.user?.firstName);
  
  if (clientLogin.token) {
    await page3.evaluate((data) => {
      const store = JSON.parse(localStorage.getItem('legalhub-store') || '{}');
      store.state = { ...store.state, isAuthenticated: true, currentUser: data.user, token: data.token };
      localStorage.setItem('legalhub-store', JSON.stringify(store));
    }, clientLogin);
    await page3.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await page3.waitForTimeout(10000);
    await page3.screenshot({ path: '/home/z/my-project/download/client-dashboard.png', fullPage: true });
    console.log('Client screenshot saved');
  }
  await page3.close();

  await browser.close();
  console.log('ALL DONE');
})();
