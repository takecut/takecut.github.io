/* Scoped content, crawlability and metadata regressions for all eight niche pages. */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const entries=require('./niches.json');
const root=path.resolve(__dirname,'..');
const attr=(n,k)=>n.attrs?.find(a=>a.name===k)?.value;
const walk=n=>[n,...(n.childNodes||[]).flatMap(walk)];
const text=n=>(n.childNodes||[]).map(c=>c.value||text(c)).join('');
async function main(){
 const {parse}=await import('../_security/node_modules/parse5/dist/index.js');
 const titles=new Set(),descriptions=new Set();
 for(const slug of ['nichos',...entries.map(n=>n.slug)]){
  const nodes=walk(parse(fs.readFileSync(path.join(root,slug,'index.html'),'utf8')));
  const all=(tag)=>nodes.filter(n=>n.tagName===tag);
  const n=entries.find(n=>n.slug===slug);
  const canonical='https://www.takecut.com.br/'+slug+'/';
  const title=text(all('title')[0]);
  const description=attr(all('meta').find(n=>attr(n,'name')==='description'),'content');
  assert.ok(!titles.has(title),'Unique title'); titles.add(title);
  assert.ok(!descriptions.has(description),'Unique description'); descriptions.add(description);
  assert.ok(description.length>=90&&description.length<=190,'Useful concise description');
  assert.equal(all('h1').length,1);
  assert.equal(attr(all('link').find(n=>attr(n,'rel')==='canonical'),'href'),canonical);
  assert.ok(all('link').some(n=>attr(n,'href')?.startsWith('/assets/niches.css?')));
  const image=attr(all('meta').find(n=>attr(n,'property')==='og:image'),'content');
  assert.ok(image.includes('/assets/'),'Current portfolio social image');
  const ld=all('script').filter(n=>attr(n,'type')==='application/ld+json').map(n=>JSON.parse(text(n)));
  const breadcrumb=ld.find(n=>n['@type']==='BreadcrumbList');
  assert.equal(breadcrumb.itemListElement.length,n?3:2);
  if(n){
   assert.equal(breadcrumb.itemListElement[1].item,'https://www.takecut.com.br/nichos/');
   assert.equal(ld.find(n=>n['@type']==='Service').url,canonical);
   assert.equal(all('details').length,4,'Visible service-specific FAQs');
   assert.ok(nodes.some(x=>attr(x,'data-project-card')===n.project),'Relevant example');
   for(const [question,answer] of n.faqs){assert.ok(all('summary').some(x=>text(x).includes(question)));assert.ok(all('p').some(x=>text(x)===answer));}
   const whatsapp=all('a').filter(x=>attr(x,'href')?.startsWith('https://wa.me/'));
   assert.ok(whatsapp.some(x=>new URL(attr(x,'href')).searchParams.get('text').includes(n.label)));
   for(const slug of n.related)assert.ok(all('a').some(x=>attr(x,'href')==='/'+slug+'/'));
  }else{
   assert.equal(ld.find(n=>n['@type']==='CollectionPage').mainEntity.itemListElement.length,7);
   for(const n of entries)assert.ok(all('a').some(x=>attr(x,'href')==='/'+n.slug+'/'));
  }
 }
 // Unrelated pages do not load the scoped design.
 for(const file of ['index.html','portfolio/index.html','produtos/index.html'])assert.ok(!fs.readFileSync(path.join(root,file),'utf8').includes('/assets/niches.css'));
 console.log('PASS: 8 niche pages; unique metadata, visible content, schemas, breadcrumbs, links, WhatsApp context and scope isolation.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
