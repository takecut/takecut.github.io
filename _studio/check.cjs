/* Build/catalog guardrails. HTML is parsed with the same browser-compatible parser as security checks. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname,'..');
const projects = require('../assets/projects.json');
const reviews = require('./reviews.json');
const attr = (node,key) => node.attrs?.find(a=>a.name===key)?.value;
const walk = node => [node,...(node.childNodes||[]).flatMap(walk)];
async function main(){
 const {parse}=await import('../_security/node_modules/parse5/dist/index.js');
 const files=[...new Set(execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:root,encoding:'utf8'}).split('\0'))].filter(f=>f.endsWith('.html')&&fs.existsSync(path.join(root,f)));
 const pages=new Map(files.map(f=>[f,walk(parse(fs.readFileSync(path.join(root,f),'utf8')))]));
 const ids=new Set(),slugs=new Set();
 const localAsset=value=>{assert.match(value,/^\/(?!\/)/);const file=path.resolve(root,'.'+value);assert.ok(file.startsWith(root+path.sep)&&fs.existsSync(file),'Missing asset '+value);};
 projects.forEach(p=>{
  assert.ok(p.id&&!ids.has(p.id),'Unique project id');ids.add(p.id);
  assert.match(p.slug,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);assert.ok(!slugs.has(p.slug));slugs.add(p.slug);
  for(const key of ['title','description','shortTitle'])assert.ok(typeof p[key]==='string'&&p[key].trim());
  assert.ok(['vertical','horizontal','square'].includes(p.orientation));assert.ok(p.width>0&&p.height>0);
  assert.equal(p.orientation,p.width===p.height?'square':p.width>p.height?'horizontal':'vertical');
  assert.ok(p.category.length&&p.objective.length&&p.techniques.length);
  for(const key of ['thumbnail','thumbnailSmall','previewVideo','fullVideo'])localAsset(p[key]);
  assert.ok(pages.has('portfolio/'+p.slug+'/index.html'),'Missing project page');
 });
 const problems=[];
 const authors=new Set();
 assert.equal(new URL(reviews.sourceUrl).protocol,'https:');
 for(const review of reviews.items){
  assert.ok(review.name && !authors.has(review.name),'Unique review author');authors.add(review.name);
  assert.ok(Number.isInteger(review.rating)&&review.rating>=1&&review.rating<=5);
  assert.ok(review.quote.trim()&&review.quote.trim().split(/\s+/).length<=25,'Short attributed excerpt');
 }
 assert.equal(pages.get('index.html').filter(n=>attr(n,'class')==='review-slide').length,reviews.items.length);
 const displayedNames=pages.get('index.html').filter(n=>n.tagName==='strong'&&n.parentNode?.tagName==='figcaption').map(n=>n.childNodes.map(c=>c.value||'').join(''));
 assert.deepEqual(displayedNames,reviews.items.map(r=>r.name.trim().split(/\s+/)[0]),'Only first names in testimonials');
 for(const [file,nodes]of pages){
  assert.equal(nodes.filter(n=>n.tagName==='h1').length,1,file+': one H1');
  const seen=new Set();for(const n of nodes){const id=attr(n,'id');if(id){assert.ok(!seen.has(id),file+': duplicate '+id);seen.add(id);}}
  for(const kind of ['description'])assert.ok(nodes.some(n=>n.tagName==='meta'&&attr(n,'name')===kind&&attr(n,'content')));
  assert.ok(nodes.some(n=>n.tagName==='link'&&attr(n,'rel')==='canonical'));
  for(const n of nodes){
   if(n.nodeName==='#text'&&!['script','style'].includes(n.parentNode?.tagName)){
    assert.ok(!/[\p{Extended_Pictographic}★✦✳]/u.test(n.value.replaceAll('©','')),file+': use SVG icons instead of emoji');
   }
   for(const key of ['src','href','poster']){
    const value=attr(n,key);if(!value||value.startsWith('data:'))continue;
    const url=new URL(value,'https://www.takecut.com.br/'+file.replace(/index\.html$/,''));
    if(url.origin!=='https://www.takecut.com.br')continue;
    const pathname=decodeURIComponent(url.pathname);let target=pathname.slice(1);if(pathname.endsWith('/'))target+='index.html';
    if(!fs.existsSync(path.join(root,target)))problems.push(`${file}: missing ${value}`);
    if(url.hash&&pages.has(target)&&!pages.get(target).some(x=>attr(x,'id')===decodeURIComponent(url.hash.slice(1))))problems.push(`${file}: missing anchor ${value}`);
   }
  }
 }
 assert.deepEqual(problems,[]);
 console.log(`PASS: ${projects.length} projects; ${pages.size} pages; local links/assets, anchors, SEO, unique IDs and media orientation.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
