const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const previous='index-90f0dbd8a1fb.js';
const source=fs.readFileSync(path.join(root,'assets',previous),'utf8');
const start=source.indexOf('function Zt(',source.indexOf(',Ht=')),end=source.indexOf('function Qt(',start);
if(start<0||end<start)throw Error('Reading parser boundary missing');
const parser=fs.readFileSync(path.join(__dirname,'question-groups.js'),'utf8');
const next=source.slice(0,start)+parser+'\n'+source.slice(end);
const filename='index-'+crypto.createHash('sha256').update(next).digest('hex').slice(0,12)+'.js';
const manifest=path.join(root,'tests/reading/release.json');
const last=fs.existsSync(manifest)?JSON.parse(fs.readFileSync(manifest,'utf8')).bundle:previous;
fs.writeFileSync(path.join(root,'assets',filename),next);
for(const dir of ['.',...fs.readdirSync(root).filter(n=>/^[a-f0-9]{14}$/.test(n))]){
 for(const name of dir==='.'?['index.html','404.html']:['index.html']){
  const file=path.join(root,dir,name),html=fs.readFileSync(file,'utf8');
  fs.writeFileSync(file,html.replaceAll(previous,filename).replaceAll(last,filename));
 }
}
fs.writeFileSync(path.join(root,'tests/reading/release.json'),JSON.stringify({previous,bundle:filename,change:'Question heading parser only',oldParserSha256:crypto.createHash('sha256').update(source.slice(start,end)).digest('hex')},null,2)+'\n');
console.log(filename);
