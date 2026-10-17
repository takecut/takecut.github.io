const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {parse}=require('../_security/node_modules/parse5');
const root=path.resolve(__dirname,'..');
const projects=require('../assets/projects.json');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const attr=(n,key)=>n.attrs?.find(a=>a.name===key)?.value;
function nodes(html){const out=[];function walk(n){out.push(n);(n.childNodes||[]).forEach(walk)}walk(parse(html));return out;}
const home=nodes(read('index.html'));
const overrides=home.filter(n=>attr(n,'data-media-project')).map(n=>({dataset:{project:attr(n,'data-project'),mediaProject:attr(n,'data-media-project')}}));
assert.deepEqual(overrides.map(n=>[n.dataset.project,n.dataset.mediaProject]),[
  ['criativo-trafego-pago-3d','hospedagem-tematica'],
  ['youtube-narrativo','gameplay-youtube']
]);
assert.equal(nodes(read('portfolio/index.html')).filter(n=>attr(n,'data-media-project')).length,0);
for(const link of overrides){
  const p=projects.find(p=>p.id===link.dataset.project);
  const media=projects.find(p=>p.id===link.dataset.mediaProject);
  const card=home.find(n=>attr(n,'data-project-card')===p.id);
  assert.ok(JSON.stringify(card.childNodes.map(n=>attr(n,'data-project'))).includes(p.id));
  const image=home.find(n=>n.tagName==='img'&&attr(n,'src')===media.thumbnail);
  assert.ok(image,'Replacement poster exists');
}
// Exercise the actual viewer function with a minimal DOM, without launching a browser.
const source=read('assets/studio.js');
const heroConfig=require('./site.json').hero;
const heroNode=home.find(n=>attr(n,'id')==='heroVideo');
assert.equal(attr(heroNode,'data-mobile'),heroConfig.mobileVideo);
assert.equal(attr(heroNode,'data-desktop'),heroConfig.desktopVideo);
for(const flag of ['muted','autoplay','loop','playsinline'])assert.notEqual(attr(heroNode,flag),undefined);
assert.equal(attr(heroNode,'preload'),'none','Do not download the hero until motion is allowed');
const motionFunction=source.slice(source.indexOf('  function updateMotion()'),source.indexOf("\n  $$('.motion-toggle').forEach"));
for(const mobile of [true,false])for(const allowed of [true,false]){
 let plays=0,pauses=0;
 const hero={dataset:{mobile:heroConfig.mobileVideo,desktop:heroConfig.desktopVideo},hasAttribute(){return !!this.src;},pause(){pauses++;}};
 const context={hero,mobile:{matches:mobile},paused:!allowed,heroVisible:true,activePreview:null,
  document:{hidden:false,body:{classList:{toggle(){}}}},$$:()=>[],canAnimate:()=>allowed,stopPreview(){},safePlay(){plays++;}};
 vm.runInNewContext(motionFunction+';updateMotion();',context);
 assert.equal(plays,allowed?1:0);assert.equal(pauses,allowed?0:1);
 assert.equal(hero.src,allowed?(mobile?heroConfig.mobileVideo:heroConfig.desktopVideo):undefined);
 assert.equal(hero.preload,allowed?'auto':undefined,'Reduced motion never enables eager loading');
}
const start=source.indexOf('  function showProject(id)');
const end=source.indexOf('  function updateViewerCopy',start);
const fn=source.slice(start,end);
for(const links of [overrides,[]])for(const id of ['criativo-trafego-pago-3d','youtube-narrativo','ia-marca']){
  let video;
  const elements=new Map();
  const get=key=>{if(!elements.has(key))elements.set(key,{querySelector:()=>null,replaceChildren(){},append(v){video=v;}});return elements.get(key)};
  const context={catalog:projects,currentProject:null,$:get,$$:()=>links,
    document:{createElement:()=>({setAttribute(){}}),body:{classList:{add(){}}}},
    displayCopy:x=>x,updateViewerCopy(p){context.shown=p},projectSequence:()=>projects.map(p=>p.id),
    viewer:{open:true,scrollTop:0},updateMotion(){},safePlay(){}};
  vm.runInNewContext(fn+';showProject('+JSON.stringify(id)+');',context);
  const target=links.find(n=>n.dataset.project===id)?.dataset.mediaProject||id;
  assert.equal(video.src,projects.find(p=>p.id===target).fullVideo);
  assert.equal(context.shown.description,projects.find(p=>p.id===id).description,'Description unchanged');
}
const schemas=home.filter(n=>n.tagName==='script'&&attr(n,'type')==='application/ld+json').map(n=>JSON.parse(n.childNodes[0].value));
const business=schemas.flatMap(s=>s['@graph']||[]).find(s=>s['@type']==='ProfessionalService');
assert.equal(business.hasOfferCatalog.itemListElement.length,5);
assert.ok(schemas.some(s=>s['@type']==='WebPage'));
const portfolio=nodes(read('portfolio/index.html'));
assert.ok(portfolio.some(n=>n.tagName==='script'&&n.childNodes?.[0]?.value.includes('"BreadcrumbList"')));
const copy=require('../assets/mobile-copy.js');
assert.equal(copy.desktop('Sound design'),'Desenho de som');
assert.equal(copy.desktop('Selected work / Seleção Take Cut'),'Seleção Take Cut');
assert.equal(copy.desktop('briefing'),'briefing');
assert.equal(copy.desktop('CUT'),'CUT');
assert.equal(copy.desktop('Faça valer o play.'),'Faça valer o play.');
console.log('PASS: home-only media replacements, viewer playback and original descriptions, Portuguese labels and search entities.');
