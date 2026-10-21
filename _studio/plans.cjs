const data = require('./plans.json');
const {escape:e, whatsapp, arrow} = require('./components.cjs');
const check = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-8"/></svg>';

function inquiry(category, plan) {
  let message = data.messages[category].replace('{plan_name}', plan.name).replace('{price_display}', plan.price_display + (plan.billing || ''));
  if (category === 'editing') message += ' Modalidade: edição de vídeo.';
  return whatsapp(message);
}
function card(category, plan) {
  const price = plan.price == null ? 'Sob orçamento' : new Intl.NumberFormat('pt-BR', {style:'currency',currency:'BRL'}).format(plan.price);
  return `<article class="pricing-card" id="${e(plan.id)}">
    <div class="pricing-card-heading"><h3>${e(plan.name)}</h3><p>${e(plan.description)}</p></div>
    <div class="pricing-cost"><span class="pricing-qualifier">${plan.pricing_type==='starting_at'?'A partir de':plan.billing?'Mensal':'Projeto personalizado'}</span><p class="pricing-amount${plan.price==null?' pricing-custom':''}">${e(price)}${plan.billing?`<span>${e(plan.billing)}</span>`:''}</p></div>
    <p class="pricing-delivery">${e(plan.delivery)}</p>
    <ul class="pricing-features">${plan.features.map(feature=>`<li>${check}<span>${e(feature)}</span></li>`).join('')}</ul>
    <a class="pricing-button" href="${e(inquiry(category,plan))}" target="_blank" rel="noopener" aria-label="${e(plan.cta+' — '+plan.name)}">${e(plan.cta)}${arrow}</a>
  </article>`;
}
function render() {
  const categories = Object.entries(data.categories);
  return `<div class="plans-wrap">
    <section class="plans-hero" aria-labelledby="plans-title">
      <p class="plans-kicker">${e(data.hero.eyebrow)}</p>
      <h1 id="plans-title"><span>Cada ideia tem seu tamanho.</span> <span class="plans-title-accent">Seu próximo vídeo tem um plano.</span></h1>
      <div class="plans-hero-bottom"><p>${e(data.hero.description)}</p><a href="#plan-options" class="plans-explore">${e(data.hero.supporting_text)}${arrow}</a></div>
    </section>
    <section class="plans-options" id="plan-options" aria-label="Modalidades e planos">
      <div class="plans-tabs" aria-label="Modalidade do serviço">${data.selector.map((c,i)=>`<a id="plan-tab-${c.id}" href="#plan-panel-${c.id}" data-plan-tab="${c.id}" class="${i?'':'is-active'}"><span class="plans-tab-full">${e(c.label)}</span><span class="plans-tab-short">${e(c.short_label)}</span></a>`).join('')}</div>
      <div class="plans-panels">${categories.map(([id,category])=>`<section class="plans-panel" id="plan-panel-${id}" aria-labelledby="plan-category-${id}">
        <div class="plans-category-heading"><h2 id="plan-category-${id}">${e(category.section_title)}</h2><p>${e(category.tagline)}</p></div>
        <div class="pricing-grid">${category.plans.map(plan=>card(id,plan)).join('')}</div>
        <p class="pricing-note">${e(category.disclaimer)}</p>
      </section>`).join('')}</div>
    </section>
    <section class="plans-conditions" id="plan-faq" aria-labelledby="conditions-title">
      <div class="plans-conditions-heading"><h2 id="conditions-title">Como funciona sua contratação</h2><p>Tudo o que você precisa saber antes de começar.</p></div>
      <div class="plans-conditions-list">${data.conditions.map(item=>`<details class="plans-condition"><summary id="condition-${item.id}" aria-controls="condition-answer-${item.id}"><span><strong>${e(item.title)}</strong><span class="condition-summary">${e(item.summary)}</span></span><span class="condition-symbol" aria-hidden="true"></span></summary><div class="condition-answer" id="condition-answer-${item.id}" role="region" aria-labelledby="condition-${item.id}"><div><p>${e(item.content)}</p></div></div></details>`).join('')}</div>
    </section>
    <section class="plans-closing" id="contact"><h2>${e(data.closing.title)}</h2><p>${e(data.closing.subtitle)}</p><a class="pricing-button" href="${e(whatsapp(data.messages.general))}" target="_blank" rel="noopener">${e(data.closing.button)}${arrow}</a></section>
  </div><script src="/assets/plans.js?v=20261020-plans" defer></script>`;
}
function schemas() {
  return [{
    '@context':'https://schema.org','@type':'FAQPage','@id':'https://www.takecut.com.br/planos/#plan-faq',
    mainEntity:data.conditions.map(item=>({'@type':'Question',name:item.title,acceptedAnswer:{'@type':'Answer',text:item.content}}))
  },{
    '@context':'https://schema.org','@type':'ItemList',name:'Modalidades de produção Take Cut',
    itemListElement:Object.entries(data.categories).map(([id,category],i)=>({
      '@type':'ListItem',position:i+1,item:{'@type':'Service',name:category.section_title,description:category.tagline,url:'https://www.takecut.com.br/planos/#plan-panel-'+id,provider:{'@id':'https://www.takecut.com.br/#business'}}
    }))
  }];
}
module.exports={render,schemas,data};
