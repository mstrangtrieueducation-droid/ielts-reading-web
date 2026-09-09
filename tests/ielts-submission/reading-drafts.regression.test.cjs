// Portable: node reading-drafts.regression.test.cjs path/to/actual-reading-bundle.js
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
function defaultBundle(){const base=path.join(__dirname,'../shared/reading-candidate');return path.join(base,'assets',JSON.parse(fs.readFileSync(path.join(base,'manifest.json'),'utf8')).bundle);}
const bundlePath=process.argv[2]||process.env.READING_BUNDLE||defaultBundle();
const bundle=fs.readFileSync(bundlePath,'utf8');
const marker='/* EXPLICIT_SUBMIT_FLOW_V1 */',offset=bundle.indexOf(marker);
assert(offset>0,'Actual bundle must contain its prepended Reading draft store');
const prefix=bundle.slice(0,offset),results=[];
const assignment='IELTS READING TEST 2 - PASSAGE 1',student={name:'QA Student',className:'IELTS 53'};
const oldId='reading-attempt-0123456789abcdef',newId='reading-attempt-fedcba9876543210';
const copy=value=>JSON.parse(JSON.stringify(value));
function snapshot(id=oldId){return {submissionId:id,answers:{'1':'original answer','2':'second answer'},multiAnswers:{'3':['first','second']},deadline:Date.now()+60000,activePassage:1};}
function storedRecord(){return {version:1,identity:JSON.stringify([assignment.toLowerCase(),'qa student','ielts 53']),updatedAt:Date.now()-1000,snapshot:snapshot(),pending:null,error:null};}
function harness({localBlocked=false,initial=storedRecord()}={}){
  const state={timers:[],open:{},read:{},writes:[],closed:0,discarded:[],stored:initial,local:new Map()};
  const db={close(){state.closed++;},transaction(_name,mode){return {objectStore(){return mode==='readonly'?{getAll:()=>state.read}:{put(record){state.writes.push(copy(record));state.stored=copy(record);},get:()=>({}),delete(){state.stored=null;}};}};}};
  const root={crypto:{randomUUID:()=> '11111111-2222-4333-8444-555555555555'},indexedDB:{open:()=>state.open},
    IELTSTest:true,IELTSSubmission:{discardRejected(id){state.discarded.push(id);return Promise.resolve(true);}},
    localStorage:{getItem(key){if(localBlocked)throw Error('Local storage blocked');return state.local.get(key)||null;},setItem(key,value){if(localBlocked)throw Error('Local storage blocked');state.local.set(key,value);},removeItem(key){state.local.delete(key);}}
  };
  vm.runInNewContext(prefix,{window:root,Map,Set,Date,JSON,Object,Array,Number,String,Error,setTimeout(fn){state.timers.push(fn);return state.timers.length;},clearTimeout(){}},{filename:path.basename(bundlePath)});
  return {root,state,drafts:root.IELTS_READING_DRAFTS,open(){state.open.result=db;state.open.onsuccess();},hydrate(){state.read.result=state.stored?[copy(state.stored)]:[];state.read.onsuccess();},timeout(){state.timers[0]();}};
}
async function test(name,fn){try{await fn();results.push({name,pass:true});console.log('PASS '+name);}catch(error){results.push({name,pass:false,error:error.stack});console.error('FAIL '+name+': '+error.message);}}
function extract(from,to){const start=bundle.indexOf(from),end=bundle.indexOf(to,start);assert(start>=0&&end>start,'Actual bundle hook not found: '+from);return bundle.slice(start,end);}
function payload(id=oldId,answers={'1':'original answer','2':'second answer','3':'first and second'}){return {action:'submitAttempt',assignmentCode:assignment,student:copy(student),submissionId:id,answers:copy(answers),elapsedSeconds:42};}

(async()=>{
  await test('IDB hydration before readiness restores original answers and attempt ID',async()=>{
    const h=harness({localBlocked:true});h.open();h.hydrate();await h.drafts.ready;
    const restored=h.drafts.read(assignment,student);assert.equal(restored.snapshot.submissionId,oldId);assert.deepEqual(copy(restored.snapshot.answers),snapshot().answers);assert.equal(h.state.writes.length,0);
  });
  await test('IDB open after readiness timeout cannot overwrite the original stored draft',async()=>{
    const h=harness({localBlocked:true}),before=copy(h.state.stored);h.timeout();await h.drafts.ready;
    h.drafts.save(assignment,student,snapshot(newId));h.open();
    if(h.state.read.onsuccess)h.hydrate();
    h.drafts.save(assignment,student,snapshot(newId));
    assert.equal(h.state.closed,1);assert.equal(h.state.writes.length,0);assert.deepEqual(h.state.stored,before);assert.match(h.drafts.warning(assignment,student),/chưa lưu được bản nháp/);
  });
  await test('IDB read after readiness timeout cannot expose a writable unhydrated database',async()=>{
    const h=harness({localBlocked:true}),before=copy(h.state.stored);h.open();h.timeout();await h.drafts.ready;
    h.drafts.save(assignment,student,snapshot(newId));h.hydrate();h.drafts.save(assignment,student,snapshot(newId));
    assert.equal(h.state.closed,1);assert.equal(h.state.writes.length,0);assert.deepEqual(h.state.stored,before);
  });
  for(const kind of ['single','full'])await test(kind+' actual Start hook awaits hydration before reading or replacing the attempt',async()=>{
    const source=kind==='single'?extract('async function _e(event){','\nasync function ve('):extract('async function O(event){','\nasync function de(');
    let release;const ready=new Promise(resolve=>{release=resolve;}),calls={read:0,phase:null,answers:null};
    const draft=storedRecord();
    const common={Date,Math,Object,window:{IELTS_READING_DRAFTS:{ready,read(){calls.read++;return draft;},resumePrompt:()=>''},confirm:()=>true,scrollTo(){}},
      C(){},g(){},y(){},f(){},m(value){calls.answers=copy(value);},u(value){calls.answers=copy(value);},
      l:student,r:student,d:true,i:[],t:{code:assignment,timeLimit:60},e:{code:assignment,timeLimit:60},
      le:{current:newId},ae:{current:newId},E:{current:null},re:{current:null},D:{current:false},ue:{current:false},O:{current:null},
      c(value){calls.phase=value;},n(value){calls.phase=value;}}
    const ctx=vm.createContext(common);vm.runInContext(source+';globalThis.invoke='+(kind==='single'?'_e':'O')+';',ctx);
    const pending=ctx.invoke({preventDefault(){}});await Promise.resolve();assert.equal(calls.read,0);assert.equal(calls.phase,null);
    release();await pending;assert.equal(calls.read,1);assert.equal(calls.phase,'exam');assert.deepEqual(calls.answers,draft.snapshot.answers);assert.equal((kind==='single'?ctx.le:ctx.ae).current,oldId);
  });
  for(const code of ['INVALID_ANSWERS','INVALID_STUDENT'])await test(code+' rotates only the rejected ID while preserving answers for correction',async()=>{
    const h=harness({initial:null});h.timeout();await h.drafts.ready;
    const original=payload();h.drafts.prepare(assignment,student,snapshot(),original);
    const attemptedChange=payload(oldId,{'1':'changed too soon','2':'second answer','3':'first and second'});
    assert.deepEqual(copy(h.drafts.prepare(assignment,student,snapshot(),attemptedChange)),original,'Pending payload must remain immutable before a definite rejection');
    h.drafts.fail(assignment,student,{code,message:'Rejected before write'});
    const restored=h.drafts.read(assignment,student);assert.notEqual(restored.snapshot.submissionId,oldId);assert.match(restored.snapshot.submissionId,/^reading-attempt-/);assert.deepEqual(copy(restored.snapshot.answers),snapshot().answers);assert.deepEqual(copy(restored.snapshot.multiAnswers),snapshot().multiAnswers);assert.equal(restored.pending,null);assert.deepEqual(h.state.discarded,[oldId]);
    const correctedSnapshot={...copy(restored.snapshot),answers:{...copy(restored.snapshot.answers),'1':'corrected answer'}};
    const corrected=payload(restored.snapshot.submissionId,{'1':'corrected answer','2':'second answer','3':'first and second'});
    assert.deepEqual(copy(h.drafts.prepare(assignment,student,correctedSnapshot,corrected)),corrected);
    assert.equal(h.drafts.read(assignment,student).pending.submissionId,restored.snapshot.submissionId);
  });
  for(const code of ['ATTEMPT_BUSY','NETWORK_TIMEOUT','SCORE_SAVE_UNCONFIRMED','SUBMISSION_ID_REUSED'])await test(code+' keeps original pending answers and ID unchanged',async()=>{
    const h=harness({initial:null});h.timeout();await h.drafts.ready;const original=payload();h.drafts.prepare(assignment,student,snapshot(),original);h.drafts.fail(assignment,student,{code,message:'Outcome unresolved'});
    const restored=h.drafts.read(assignment,student);assert.equal(restored.snapshot.submissionId,oldId);assert.deepEqual(copy(restored.pending),original);assert.deepEqual(h.state.discarded,[]);
  });
  for(const [label,from,to,ref]of [
    ['single','catch(error){window.IELTS_READING_DRAFTS.fail(t.code,l,error);','\n  finally{ee(!1)}','le'],
    ['full','catch(error){window.IELTS_READING_DRAFTS.fail(e.code,r,error);','\n  finally{m(!1)}','ae']
  ])await test(label+' actual failure callback adopts the fresh rejected-attempt ID',async()=>{
    const catchBlock=extract(from,to).trimEnd(),body=catchBlock.slice('catch(error){'.length,-1);
    const ctx=vm.createContext({window:{IELTS_READING_DRAFTS:{fail(){},read:()=>({snapshot:{submissionId:newId}}),message:()=>'',warning:()=>''}},t:{code:assignment},e:{code:assignment},l:student,r:student,le:{current:oldId},ae:{current:oldId},C(){},g(){}});
    vm.runInContext('function run(error){'+body+'};run({code:"INVALID_ANSWERS"});',ctx);assert.equal(ctx[ref].current,newId);
  });
  const summary={bundle:path.basename(bundlePath),passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length,results};
  if(process.env.RESULTS_PATH)fs.writeFileSync(process.env.RESULTS_PATH,JSON.stringify(summary,null,2));console.log(JSON.stringify({bundle:summary.bundle,passed:summary.passed,failed:summary.failed}));if(summary.failed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
