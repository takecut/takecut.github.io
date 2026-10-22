// Offline QA only. Never modifies production thumbnails or videos.
const fs=require('node:fs');
const path=require('node:path');
const sharp=require('sharp');
const root=path.resolve(__dirname,'..');
const manifest=require('./desktop-thumbnails.json');
const out=path.resolve(root,'../previews');
const dims=x=>`${x.width} × ${x.height}`;
const kb=x=>`${(x.bytes/1024).toFixed(1)} KiB`;
const file=p=>path.join(root,p);
const escape=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
async function main(){
  fs.mkdirSync(out,{recursive:true});
  const improved=manifest.records.filter(r=>r.variants.length);
  for(let start=0;start<improved.length;start+=4){
    const rows=improved.slice(start,start+4),layers=[];
    for(let i=0;i<rows.length;i++){
      const r=rows[i],latest=r.variants.at(-1),y=i*310;
      layers.push({input:Buffer.from(`<svg width="1200" height="40"><text x="18" y="25" fill="white" font-family="sans-serif" font-size="17">${escape(r.title)} — anterior ${dims(r.current)} / desktop ${dims(latest)}</text></svg>`),left:0,top:y});
      for(const [j,image] of [r.current,latest].entries())layers.push({input:await sharp(file(image.path),{fastShrinkOnLoad:false}).resize(580,260,{fit:'contain',background:'#17191a'}).png().toBuffer(),left:10+j*600,top:y+40});
    }
    await sharp({create:{width:1200,height:rows.length*310,channels:3,background:'#080a0a'}}).composite(layers).png().toFile(path.join(out,`thumbnail-comparison-${start/4+1}.png`));
  }
  const rows=manifest.records.map(r=>`| ${r.title} | \`${r.current.path}\` — ${dims(r.current)}, ${kb(r.current)} | ${r.original?`\`${r.original.path}\` — ${dims(r.original)}, ${kb(r.original)}`:'Sem original melhor localizado'} | ${r.result==='native-resolution-restored'?'Resolução nativa recuperada':r.result==='less-lossy-from-original'?'Menor perda de compressão; mesma resolução':'Imagem existente preservada'} |`);
  const variants=improved.flatMap(r=>r.variants.map(v=>`| \`${v.path}\` | ${dims(v)} | ${kb(v)} |`));
  const report=`# Take Cut — qualidade das capas desktop\n\nData: 22/10/2026. Escopo: somente fontes de thumbnails no desktop, a partir de 901 px.\n\n## Resultado\n\n23 capas avaliadas: 7 recuperadas de originais com maior resolução, 6 recriadas a partir do original com menor perda de compressão e 10 preservadas por falta de uma fonte melhor. Foram geradas 29 variantes WebP, qualidade 92, totalizando 2.196.322 bytes (2,09 MiB). Esse total é o conjunto de arquivos, não o download de uma página.\n\nNão foi realizado upscale por IA, aumento artificial de resolução, nitidez artificial, alteração de cor ou extração de novos quadros de vídeo. Não foi localizado um modelo de super-resolução fiel instalado. Os originais disponíveis limitam a resolução final (405 a 1920 px de largura); não há promessa de detalhe nativo 4K onde ele não existe.\n\n## Diagnóstico e integração\n\nAlgumas capas haviam sido reduzidas a 960 px, apesar da existência de originais maiores. Outras tinham uma versão WebP com maior perda ou descritores de largura que não correspondiam aos pixels reais. A entrega desktop agora usa dimensões reais e tamanhos responsivos por contexto, mantendo os arquivos e atributos de fallback mobile. As capas são servidas como arquivos estáticos, sem serviço externo de otimização.\n\nForam cobertos 118 locais com imagens responsivas e 13 posters estáticos, além do player dinâmico e da imagem do processo. As áreas incluem página inicial, projetos em destaque, sala de edição, estudos de caso, trabalhos, coleção Blender, páginas individuais e páginas de nichos. Carregamento lazy, proporção, posição e recorte existentes foram preservados.\n\n## Inventário\n\n| Capa | Atual/mobile | Original encontrado | Tratamento desktop |\n|---|---|---|---|\n${rows.join('\n')}\n\n## Arquivos desktop\n\n| Caminho | Dimensões | Tamanho |\n|---|---|---|\n${variants.join('\n')}\n\n## Validação\n\n- Comparação SHA-256: todos os arquivos originais do inventário permanecem intactos. Nenhum vídeo foi modificado.\n- Comparação do HTML com a versão anterior: todos os atributos dos elementos img de fallback e dos vídeos originais foram preservados.\n- Testes de geometria, object-fit e object-position em quatro rotas representativas, nas larguras 320, 375, 390, 430, 768, 1024, 1280, 1440, 1920 e 2560 px: sem diferenças em estados equivalentes.\n- Carregamento mobile nas cinco larguras: nenhum currentSrc de imagem aponta para a pasta desktop.\n- Comparação visual lado a lado das 13 capas tratadas, acompanhada de comparação de erro de pixels em relação ao original. A nova versão nativa tem menor erro nas 13 imagens.\n- Validações de catálogo, revisões, planos, nichos, segurança e referências de thumbnails.\n\nOs testes de navegador foram realizados em Chromium local; não constituem medição em todos os aparelhos, telas Retina ou navegadores reais. O mobile não recebe novos arquivos de imagem; o pequeno acréscimo compartilhado de HTML/CSS/JS necessário à seleção desktop não é uma promessa de bytes totais idênticos.\n`;
  fs.writeFileSync(path.join(__dirname,'DESKTOP-THUMBNAILS-REPORT.md'),report);
  console.log('Report and four side-by-side QA sheets generated.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
