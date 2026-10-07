/* Search metadata uses existing, visible service and contact information. */
const base='https://www.takecut.com.br';
const copy=require('../assets/mobile-copy.js').desktop;
const services=[
  ['Produção audiovisual', '/#services'],
  ['Edição de vídeos para redes sociais', '/edicao-de-reels/'],
  ['Criativos para tráfego pago', '/criativos-para-trafego-pago/'],
  ['Vídeos com inteligência artificial', '/videos-com-ia/'],
  ['Animação 3D com Blender', '/portfolio/colecoes/blender-3d/']
];
function enrich(data,{canonical,title,description,route,home}) {
  const result=structuredClone(data||[]);
  if(home) {
    const business=result.flatMap(item=>item['@graph']||[]).find(item=>item['@id']===base+'/#business');
    if(business) {
      delete business.priceRange; // Scope-dependent prices live on the plans page.
      business.hasOfferCatalog={'@type':'OfferCatalog',name:'Serviços Take Cut',itemListElement:services.map(([name,url])=>({'@type':'Offer',itemOffered:{'@type':'Service',name,url:base+url,provider:{'@id':base+'/#business'},areaServed:{'@type':'Country',name:'Brasil'}}}))};
    }
  }
  result.push({'@context':'https://schema.org','@type':'WebPage','@id':canonical+'#page',url:canonical,name:copy(title),description:copy(description),inLanguage:'pt-BR',isPartOf:{'@id':base+'/#website'},about:{'@id':base+'/#business'}});
  if(!home) {
    const crumbs=[{name:'Início',item:base+'/'}];
    if(route.startsWith('/portfolio/')&&route!=='/portfolio/')crumbs.push({name:'Trabalhos',item:base+'/portfolio/'});
    crumbs.push({name:copy(title.split(' | ')[0]),item:canonical});
    result.push({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:crumbs.map((item,i)=>({'@type':'ListItem',position:i+1,...item}))});
  }
  return result;
}
module.exports={enrich};
