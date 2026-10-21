const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const data = require('./plans.json');
const {whatsapp} = require('./components.cjs');
const root = path.resolve(__dirname,'..');
const normalize = value => value.replace(/\s+/g,' ').trim();

(async () => {
  const {parse} = await import('../_security/node_modules/parse5/dist/index.js');
  const html = fs.readFileSync(path.join(root,'planos/index.html'),'utf8');
  const tree = parse(html);
  const nodes = [];
  const visit = node => { nodes.push(node); for(const child of node.childNodes || [])visit(child); };
  visit(tree);
  const attr = (node,key) => node.attrs?.find(a=>a.name===key)?.value;
  const text = node => normalize(node.nodeName==='#text'?node.value:(node.childNodes||[]).map(text).join(' '));
  const id = value => nodes.find(n=>attr(n,'id')===value);
  const inside = (node,tag) => {
    const found=[]; const walk=n=>{if(n.tagName===tag)found.push(n);for(const child of n.childNodes||[])walk(child);};walk(node);return found;
  };
  assert.equal(nodes.filter(n=>n.tagName==='h1').length,1);
  assert.equal(text(nodes.find(n=>n.tagName==='title')),data.seo.meta_title);
  assert.equal(attr(nodes.find(n=>attr(n,'name')==='description'),'content'),data.seo.meta_description);
  assert.equal(attr(nodes.find(n=>attr(n,'rel')==='canonical'),'href'),'https://www.takecut.com.br/planos/');
  const expected = {'cut-05':399.9,'cut-10':699.9,'cut-20':999.9,'ia-start':349.99,'ia-pro':499.9,'ia-skyline':null,'filming-essential':899.9,'filming-half-day':1899.9,'filming-complete':null};
  const phone = new URL(whatsapp()).pathname;
  let count=0;
  for(const [category,group] of Object.entries(data.categories)) {
    assert.equal(group.plans.length,3);
    assert.ok(text(id('plan-panel-'+category)).includes(group.disclaimer));
    assert.ok(id('plan-tab-'+category));
    for(const plan of group.plans) {
      count++;
      assert.equal(plan.price,expected[plan.id]);
      const card=id(plan.id);
      assert.ok(card,plan.id);
      assert.equal(text(inside(card,'h3')[0]),plan.name);
      assert.deepEqual(inside(card,'li').map(text),plan.features);
      assert.ok(text(card).includes(plan.description));
      assert.ok(text(card).includes(plan.delivery));
      const amount = plan.price==null?'Sob orçamento':new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(plan.price);
      assert.ok(text(card).includes(normalize(amount)));
      if(plan.pricing_type==='starting_at')assert.ok(text(card).includes('A partir de'));
      assert.equal(text(card).includes('/mês'),category==='editing');
      const link=inside(card,'a')[0],url=new URL(attr(link,'href'));
      assert.equal(url.origin,'https://wa.me');
      assert.equal(url.pathname,phone);
      assert.ok(url.searchParams.get('text').includes(plan.name));
      assert.equal(attr(link,'rel'),'noopener');
    }
  }
  assert.equal(count,9);
  for(const condition of data.conditions) {
    assert.ok(text(id('condition-'+condition.id)).includes(condition.summary));
    assert.equal(text(id('condition-answer-'+condition.id)),condition.content);
  }
  assert.doesNotMatch(html,/preliminares|nota editorial|Part 2|Parte 2|Teste de venda|Campanha essencial/);
  assert.ok(html.includes('/assets/plans.css?v=20261020-plans'));
  assert.ok(html.includes('/assets/plans.js?v=20261020-plans'));
  const files = execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/);
  for(const file of files.filter(f=>f!=='planos/index.html')) {
    assert.doesNotMatch(fs.readFileSync(path.join(root,file),'utf8'),/\/assets\/plans\.(?:css|js)/,file+': pricing assets must stay scoped');
  }
  console.log('PASS: 9 plans, exact prices/features, 4 contract summaries, WhatsApp, SEO and page-only assets.');
})().catch(error=>{console.error(error);process.exitCode=1;});
