const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'../..'),release=require('./release.json'),expected=require('./question-ids.json');
const cfg={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'config.js'),'utf8'),cfg);
const routes=cfg.window.IELTS_READING_ROUTES;
const cases=[...Object.entries(routes.lessonBySlug).map(([slug,id])=>({slug,code:'IELTS READING TEST '+id.replace('-',' - PASSAGE '),full:false})),...Object.entries(routes.fullTestBySlug).map(([slug,n])=>({slug,code:'IELTS READING FULL TEST '+n,full:true}))];
(async()=>{const browser=await chromium.launch({headless:true});let total=0;try{
 for(const item of [...cases.filter(x=>!process.env.FULL_ONLY||x.full),{...cases.find(x=>x.code.endsWith('FULL TEST 22')),mobile:true}]){
  let payload=null;const errors=[];
  const context=await browser.newContext({viewport:item.mobile?{width:390,height:844}:{width:1365,height:900}}),page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  await page.route('**/*',async route=>{
   const req=route.request(),u=new URL(req.url());
   if(req.method()==='POST'){
    const raw=JSON.parse(new URLSearchParams(req.postData()||'').get('payload'));
    if(raw.action==='submitAttempt')payload=raw;
    const data=raw.action==='checkVocab'?{submitted:true}:{};
    return route.fulfill({contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({source:raw.source,version:1,requestId:raw.requestId,nonce:raw.nonce,action:raw.action,ok:raw.action==='checkVocab',data,error:{code:'QA_CAPTURE_ONLY',message:'Offline test capture; no real submission'}})});
   }
   if(u.hostname!=='review.test')return route.abort();
   let f=path.join(root,decodeURIComponent(u.pathname).replace(/^\/ielts-reading-web\//,''));
   if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
   return fs.existsSync(f)?route.fulfill({path:f}):route.abort();
  });
  await page.goto('https://review.test/ielts-reading-web/'+item.slug+'/');
  await page.locator('input:not([type=checkbox]):not([type=radio])').first().fill('QA Reading Coverage');await page.locator('select').first().selectOption('IELTS 45');
  if(!item.full)await page.locator('input[type=checkbox]').check();
  await page.getByRole('button',{name:/BẮT ĐẦU/}).click();
  await page.locator(item.full?'.full-test-footer':'.submit-zone').waitFor();
  for(let passage=1;passage<=(item.full?3:1);passage++){
   if(item.full)await page.getByRole('button',{name:new RegExp('^PASSAGE '+passage)}).click();
   const names=await page.locator('input[type=radio]:visible').evaluateAll(es=>[...new Set(es.map(e=>e.name))]);
   for(const name of names)await page.locator('input[type=radio][name="'+name+'"]:visible').first().check();
   for(const input of await page.locator('input:not([type=radio]):not([type=checkbox]):visible').all())await input.fill('QA answer');
   for(const select of await page.locator('select:visible').all())await select.selectOption({index:1});
   // Existing multi-select questions declare their own required count.
   const groups=page.locator('.question-card:visible').filter({has:page.locator('input[type=checkbox]')});
   for(const group of await groups.all()){
    const text=await group.innerText(),n=/THREE|three|3 đáp án/.test(text)?3:2;
    for(const input of (await group.locator('input[type=checkbox]').all()).slice(0,n))await input.check();
   }
  }
  if(item.full){
   await page.getByText('40/40 câu đã làm',{exact:true}).waitFor();
   if(item.code.endsWith('FULL TEST 22')){
    await page.getByRole('button',{name:/^PASSAGE 2/}).click();
    await page.getByRole('combobox',{name:'Question 25',exact:true}).selectOption('B');
    await page.getByRole('combobox',{name:'Question 26',exact:true}).selectOption('');
    await page.getByText('39/40 câu đã làm',{exact:true}).waitFor();
    assert(await page.getByRole('button',{name:/ĐIỀN ĐỦ 1 CÂU CÒN LẠI/}).isDisabled());
    await page.getByRole('combobox',{name:'Question 26',exact:true}).selectOption('C');
    await page.getByText('40/40 câu đã làm',{exact:true}).waitFor();
    await page.reload();await page.locator('input:not([type=checkbox]):not([type=radio])').first().fill('QA Reading Coverage');await page.locator('select').first().selectOption('IELTS 45');await page.getByRole('button',{name:/BẮT ĐẦU/}).click();
    await page.getByRole('button',{name:/^PASSAGE 2/}).click();
    assert.equal(await page.getByRole('combobox',{name:'Question 25',exact:true}).inputValue(),'B');assert.equal(await page.getByRole('combobox',{name:'Question 26',exact:true}).inputValue(),'C');
   }
  }
  await page.getByRole('button',{name:item.full?/XÁC NHẬN.*NỘP FULL TEST/:/XÁC NHẬN.*NỘP BÀI READING/}).click();
  await page.waitForFunction(()=>document.body.innerText.includes('Offline test capture'),null,{timeout:10000});
  assert(payload,item.code+': no submitted payload');
  assert.equal(payload.assignmentCode,item.code);assert.deepEqual(Object.keys(payload.answers).map(Number).sort((a,b)=>a-b),expected[item.code]);
  assert(Object.values(payload.answers).every(v=>typeof v==='string'&&v.trim()));assert.deepEqual(errors,[]);
  if(!item.mobile)total+=expected[item.code].length;
  console.log('PASS UI '+item.code+(item.mobile?' mobile + reload':'')+' '+expected[item.code].length+' answers');await context.close();
 }
 assert.equal(total,process.env.FULL_ONLY?520:880);console.log(`PASS ${process.env.FULL_ONLY?13:40} routes / ${total} answers + mobile Test 22; no live submissions`);
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
