const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),release=require('./release.json');
const source=fs.readFileSync(path.join(root,'assets',release.bundle),'utf8');
const start=source.indexOf(',Vt=')+1,end=source.indexOf(',Ht=',start),last=source.indexOf('var cn=',end);
const c={};vm.createContext(c);vm.runInContext('var '+source.slice(start,end)+';var '+source.slice(end+1,last)+';this.tests=Vt;this.parse=sn;this.headings=Zt;',c);
const ids=require('./question-ids.json');let count=0;
for(const test of c.tests){
 const actual=[];
 for(const passage of test.passages){
  const groups=c.parse(passage),numbers=groups.flatMap(g=>g.questions.map(q=>q.id));
  assert.deepEqual(Array.from(numbers),Array.from({length:passage.questionEnd-passage.questionStart+1},(_,i)=>i+passage.questionStart),`${test.code} passage ${passage.passageNumber}`);
  for(const group of groups){
   const multi=group.body.match(/Choose\s+(TWO|THREE|FOUR|FIVE)\s+letters/i);
   if(multi)assert.equal(group.questions.length,{TWO:2,THREE:3,FOUR:4,FIVE:5}[multi[1].toUpperCase()]);
   for(const q of group.questions){assert(q.prompt.trim());if(q.kind==='choice')assert(q.options.length>=2);}
  }actual.push(...numbers);
 }assert.deepEqual(actual,ids[test.code]);count+=actual.length;
}
for(const header of ['Questions 25–26','Questions 25-26','Questions 25 and 26','Questions 25 AND 26','Questions 25 & 26','Questions 25, 26']){
 const result=c.headings(header+'\nChoose TWO letters, A–E.\nWrite the correct letters in boxes 25 and 26.',{questionStart:14,questionEnd:26});
 assert.equal(result[0].start,25,header);assert.equal(result[0].end,26,header);
}
const original=fs.readFileSync(path.join(root,'assets',release.previous),'utf8');
const a=original.indexOf('function Zt(',original.indexOf(',Ht=')),b=original.indexOf('function Qt(',a);
const parser=fs.readFileSync(path.join(root,'scripts/reading/question-groups.js'),'utf8');
assert.equal(source,original.slice(0,a)+parser+'\n'+original.slice(b),'Only the question-heading parser may change; retain submission, identity and draft code byte-for-byte');
assert.equal(count,520);console.log('PASS 13 full tests / 39 passages / 520 question IDs; heading variants; unchanged runtime outside content parser');
