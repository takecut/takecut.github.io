# Take Cut 2.0 — manutenção

Site estático: HTML pré-gerado, um CSS e JavaScript progressivo. Sem framework ou dependência de execução para o visitante. O GitHub Pages continua sendo a hospedagem. Os diretórios `_studio` e `_security` são ferramentas de desenvolvimento, excluídos pela publicação padrão do Jekyll.

## Editar e gerar

1. Instalar somente o validador: `npm ci --prefix _security --ignore-scripts`.
2. Editar `assets/projects.json` (catálogo), `_studio/site.json` (curadoria/hero), `_studio/components.cjs` (componentes), `_studio/build.cjs` (páginas), `assets/studio.css` e `assets/studio.js`.
3. Executar `node _studio/build.cjs`.
4. Executar `node _studio/check.cjs` e `node _security/check.cjs`.
5. Conferir desktop/mobile em servidor HTTP local. Não usar `file://`: URLs absolutas e o catálogo dependem de HTTP.
6. Publicar as fontes e o HTML gerado juntos. O CI rejeita páginas que não correspondam às fontes.

O build preserva as 12 rotas anteriores e adiciona `/sobre/`, `/planos/` e uma rota para cada projeto. SEO, menu, rodapé, viewer e cards são compartilhados. `legacy.json` é o inventário congelado da migração, incluindo conteúdo comercial/legal original; não é carregado pelo navegador. As versões anteriores continuam no histórico Git.

## Um novo trabalho

Adicionar um objeto a `assets/projects.json`. Usar um `id` e `slug` únicos, sem acentos, e preencher título, descrição, categorias, objetivos, técnicas, ordem e caminhos locais das mídias. `width`/`height` devem refletir o arquivo real. `orientation` aceita `horizontal`, `vertical` ou `square`. Não inventar cliente, ano ou resultado: campos desconhecidos ficam vazios.

Objetivos disponíveis: `vender`, `impressionar`, `explicar`, `emocionar`, `atencao`. As categorias secundárias estão na configuração da página em `build.cjs`. `featuredProjects` em `site.json` define a ordem de destaque na Home/portfólio; o campo `featured` registra a intenção editorial no catálogo. A Home utiliza um horizontal principal, até três verticais e outro horizontal. `cutRoomProjects` define os experimentos selecionados.

Preparar duas imagens WebP, com até 480 e 960 pixels de largura, e um preview H.264/MP4 de aproximadamente seis segundos, sem áudio, 24 fps e `faststart`. O derivador `_studio/media.cjs` reproduz os arquivos originais desta migração usando `ffmpeg` e `sharp`, sem sobrescrever o catálogo editado. É opcional, não participa do build normal. Aceita `FFMPEG_PATH` e `SHARP_PATH` quando as dependências não estão no PATH.

Nenhum preview carrega todos os vídeos de uma vez. O arquivo completo só é solicitado ao abrir/assistir. O servidor precisa servir MP4 com tipo correto e suportar requisições parciais (GitHub Pages já o faz).

Para novas entregas, criar um manifesto como `_studio/media-20261003.json` e executar `node _studio/import-media.cjs DIRETORIO_DOS_ORIGINAIS MANIFESTO_JSON` (aceita `FFMPEG_PATH`). O importador preserva áudio/imagem do vídeo completo sem recompressão, prepara faststart, capas e previews mudos. O catálogo continua editado explicitamente, com dimensões e duração verificadas. Não modifica os originais fornecidos.

Coleções ficam em `_studio/collections.json`: título, slug, categoria, capa e textos. O build reúne automaticamente os projetos com a categoria correspondente, gera a página da coleção e seus acessos na Home/portfólio. Para incluir trabalhos futuros de Blender, adicionar a categoria `Blender / 3D` ao projeto. Diferenciar animação em Blender de IA integrada ao 3D nas descrições e técnicas.

## Hero provisório

Trocar os quatro caminhos de `hero` em `site.json` para substituir o reel sem refazer o layout; os preloads acompanham essa configuração. Manter versões desktop/mobile, poster otimizado, vídeo mudo de 6–10 segundos. Não publicar um reel definitivo sem aprovação do conteúdo.

## Interações e acessibilidade

- Menu e player usam `dialog` nativo, Escape e foco gerenciado.
- Sem JavaScript, os cards abrem suas páginas individuais e o vídeo mantém controles nativos.
- Preview por hover no desktop; por visibilidade em dispositivos touch. Apenas um preview ativo; o hero pausa quando outro vídeo começa.
- Economia de dados e preferência por movimento reduzido desativam autoplay. O botão “Pausar animações” oferece controle manual.
- Filtros combinados e carregamento incremental de 4/8 projetos não dependem de uma quantidade fixa de trabalhos.
- Sem bloqueio de clique direito, download ou pedido para girar o celular.
- Não foram inventadas legendas/transcrições. Adicionar legendas revisadas aos vídeos com fala é uma melhoria editorial futura.

## Conteúdo preservado e limites

Planos, mensagens de WhatsApp, produtos, preços de compra e locações `R$ ...` foram preservados. Depoimentos usam trechos das avaliações existentes. Os números de cases são os que já estavam publicados, sem nova promessa de resultado. Não foram criados perfis de redes sociais não confirmados.

O visual pode ser verificado automaticamente em 320, 375, 390, 430, 768, 1024, 1280, 1440, 1920 e 2560 pixels, mas emulação não substitui testes em celulares físicos. A velocidade real depende da rede, cache, mídia e dispositivo. As proteções anteriores de CSP, HTTPS, PR/checks e consentimento continuam; ver `_security/README.md`.

## Restauração

Referência anterior ao redesign: commit `ecf584cbb9c89effbf7f6dc75261a7ae086f038d`, tag local `backup/takecut-pre-redesign-20260929`. Para reverter uma publicação, criar um revert revisável do commit de redesign; não reescrever o histórico nem desligar os checks.
