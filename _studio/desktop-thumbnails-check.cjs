const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const {parse}=require('../_security/node_modules/parse5');
const root=path.resolve(__dirname,'..');
const manifest=require('./desktop-thumbnails.json');
const attr=(n,k)=>n.attrs?.find(a=>a.name===k)?.value;
function nodes(html){const all=[];function walk(n){all.push(n);(n.childNodes||[]).forEach(walk)}walk(parse(html));return all;}
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
let pictures=0,posters=0;
for(const r of manifest.records){
  for(const original of [r.current,r.small,r.original].filter(Boolean))assert.equal(hash(original.path),original.sha256,'Original image changed: '+original.path);
  for(const v of r.variants){assert.equal(hash(v.path),v.sha256);assert.ok(v.width<=r.original.width,'No artificial enlargement');}
  if(r.variants.length)assert.ok(r.originalErrorAfter<r.originalErrorBefore);
  if(r.result==='original-upload'){
    const project=require('../assets/projects.json').find(p=>p.id===r.id);
    assert.equal(project.thumbnail,r.original.path);
    assert.equal(project.thumbnailSmall,r.original.path);
    assert.equal(r.variants.length,0,'Uploaded originals must not have compressed variants');
  }
}
const files=execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/);
for(const file of files){
  const html=fs.readFileSync(path.join(root,file),'utf8'),all=nodes(html);
  for(const n of all){
    if(n.tagName==='source'&&attr(n,'media')==='(min-width:901px)'){
      pictures++;assert.equal(n.parentNode.tagName,'picture');
      for(const candidate of attr(n,'srcset').split(', '))assert.ok(fs.existsSync(path.join(root,candidate.split(' ')[0])));
      assert.ok(n.parentNode.childNodes.some(c=>c.tagName==='img'&&!attr(c,'src').includes('/desktop/')));
    }
    if(n.tagName==='video'&&attr(n,'data-desktop-poster')){posters++;assert.ok(!attr(n,'poster').includes('/desktop/'));}
  }
  // One-time baseline regression: every original img attribute remains identical.
  if(process.argv.includes('--compare-base')){
    const before=nodes(execFileSync('git',['show','0ae761e:'+file],{cwd:root,encoding:'utf8'}));
    const imageAttrs=list=>list.filter(n=>n.tagName==='img').map(n=>Object.fromEntries(n.attrs.map(a=>[a.name,a.value])));
    assert.deepEqual(imageAttrs(all),imageAttrs(before),file+': fallback image attributes changed');
    const videoAttrs=list=>list.filter(n=>n.tagName==='video').map(n=>Object.fromEntries(n.attrs.filter(a=>a.name!=='data-desktop-poster').map(a=>[a.name,a.value])));
    assert.deepEqual(videoAttrs(all),videoAttrs(before),file+': video source or behavior changed');
  }
}
assert.equal(manifest.records.length,require('../assets/projects.json').length);
console.log('PASS: '+manifest.records.length+' thumbnails inventoried; '+pictures+' responsive locations; '+posters+' static posters; original assets and fallback attributes preserved.');
