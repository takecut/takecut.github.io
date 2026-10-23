# Take Cut — qualidade das capas desktop

Data: 22/10/2026. Escopo: somente fontes de thumbnails no desktop, a partir de 901 px.

## Resultado

23 capas avaliadas: 7 recuperadas de originais com maior resolução, 6 recriadas a partir do original com menor perda de compressão e 10 preservadas por falta de uma fonte melhor. Foram geradas 29 variantes WebP, qualidade 92, totalizando 2.196.322 bytes (2,09 MiB). Esse total é o conjunto de arquivos, não o download de uma página.

Não foi realizado upscale por IA, aumento artificial de resolução, nitidez artificial, alteração de cor ou extração de novos quadros de vídeo. Não foi localizado um modelo de super-resolução fiel instalado. Os originais disponíveis limitam a resolução final (405 a 1920 px de largura); não há promessa de detalhe nativo 4K onde ele não existe.

## Diagnóstico e integração

Algumas capas haviam sido reduzidas a 960 px, apesar da existência de originais maiores. Outras tinham uma versão WebP com maior perda ou descritores de largura que não correspondiam aos pixels reais. A entrega desktop agora usa dimensões reais e tamanhos responsivos por contexto, mantendo os arquivos e atributos de fallback mobile. As capas são servidas como arquivos estáticos, sem serviço externo de otimização.

Foram cobertos 118 locais com imagens responsivas e 13 posters estáticos, além do player dinâmico e da imagem do processo. As áreas incluem página inicial, projetos em destaque, sala de edição, estudos de caso, trabalhos, coleção Blender, páginas individuais e páginas de nichos. Carregamento lazy, proporção, posição e recorte existentes foram preservados.

## Inventário

| Capa | Atual/mobile | Original encontrado | Tratamento desktop |
|---|---|---|---|
| Vídeo de entrevista para marca | `/assets/posters/entrevista-corporativa-960.webp` — 607 × 1079, 60.8 KiB | `/thumbp6.jpg` — 607 × 1079, 111.5 KiB | Menor perda de compressão; mesma resolução |
| Conteúdo para redes sociais | `/assets/posters/conteudo-social-960.webp` — 822 × 1600, 99.5 KiB | `/thumb1.png` — 822 × 1600, 1144.8 KiB | Menor perda de compressão; mesma resolução |
| Vídeo institucional | `/assets/posters/institucional-vertical-960.webp` — 465 × 933, 90.6 KiB | `/thumb2.png` — 465 × 933, 826.1 KiB | Menor perda de compressão; mesma resolução |
| Reels para hospedagem temática | `/assets/posters/hospedagem-tematica-960.webp` — 720 × 1280, 67.5 KiB | `/thumbp8.jpg` — 720 × 1280, 86.9 KiB | Menor perda de compressão; mesma resolução |
| Reels para esmalteria | `/assets/posters/reels-esmalteria-960.webp` — 405 × 720, 21.6 KiB | `/thumb-portfolio-reels-esmalteria.jpg` — 405 × 720, 41.1 KiB | Menor perda de compressão; mesma resolução |
| Anúncio para produto | `/assets/posters/anuncio-produto-960.webp` — 960 × 532, 85.8 KiB | `/thumbp1.png` — 1455 × 807, 145.9 KiB | Resolução nativa recuperada |
| Criativo para tráfego pago | `/assets/posters/criativo-trafego-pago-3d-960.webp` — 405 × 720, 24.9 KiB | `/thumb-portfolio-trafego-3d.jpg` — 405 × 720, 43.0 KiB | Menor perda de compressão; mesma resolução |
| Vídeo para YouTube | `/assets/posters/youtube-narrativo-960.webp` — 960 × 530, 30.5 KiB | `/thumbp4.png` — 1461 × 806, 73.3 KiB | Resolução nativa recuperada |
| Vídeo de gameplay para YouTube | `/assets/posters/gameplay-youtube-960.webp` — 960 × 540, 14.9 KiB | `/thumb-portfolio-gameplay.jpg` — 1280 × 720, 41.2 KiB | Resolução nativa recuperada |
| Animação 3D de conversa | `/assets/posters/conversa-3d-960.webp` — 960 × 540, 12.3 KiB | `/thumbp9.jpg` — 1920 × 1080, 43.8 KiB | Resolução nativa recuperada |
| Antes e depois da pós-produção | `/assets/posters/tratamento-audiovisual-960.webp` — 960 × 540, 43.9 KiB | `/thumb-portfolio-tratamento.jpg` — 1280 × 720, 107.6 KiB | Resolução nativa recuperada |
| Vídeo emocional | `/assets/posters/video-emocional-960.webp` — 960 × 540, 54.5 KiB | `/thumbp5.png` — 1460 × 821, 108.8 KiB | Resolução nativa recuperada |
| Cena cinematográfica 100% IA | `/assets/posters/cinematografico-ia-960.webp` — 960 × 540, 28.6 KiB | `/thumbp7.jpg` — 1280 × 720, 51.3 KiB | Resolução nativa recuperada |
| Cena com IA para marca | `/assets/posters/maquete-marca-960.webp` — 960 × 540, 16.4 KiB | Sem original melhor localizado | Imagem existente preservada |
| Apresentadora virtual: um prompt, várias cenas | `/assets/posters/apresentadora-virtual-ia-960.webp` — 960 × 1707, 12.8 KiB | Sem original melhor localizado | Imagem existente preservada |
| Vídeos com IA: novas possibilidades | `/assets/posters/possibilidades-com-ia-960.webp` — 960 × 1706, 11.6 KiB | Sem original melhor localizado | Imagem existente preservada |
| Órbitas: abertura cinematográfica em 3D | `/assets/posters/planeta-3d-960.webp` — 960 × 540, 3.9 KiB | Sem original melhor localizado | Imagem existente preservada |
| Design em movimento: estudo automotivo em 3D | `/assets/posters/audi-rs6-3d-960.webp` — 960 × 1706, 4.7 KiB | Sem original melhor localizado | Imagem existente preservada |
| Atmosfera sonora: visual musical em 3D | `/assets/posters/visualizer-3d-960.webp` — 960 × 1706, 9.7 KiB | Sem original melhor localizado | Imagem existente preservada |
| Luz e presença: filme automotivo em 3D | `/assets/posters/dodge-garagem-3d-960.webp` — 960 × 540, 5.9 KiB | Sem original melhor localizado | Imagem existente preservada |
| Movimento imersivo: criação com IA e 3D | `/assets/posters/dodge-ia-3d-960.webp` — 960 × 1706, 27.5 KiB | Sem original melhor localizado | Imagem existente preservada |
| Do sonho à conquista — filme com IA | `/assets/posters/do-sonho-a-conquista-ia-960.webp` — 960 × 1706, 10.4 KiB | Sem original melhor localizado | Imagem existente preservada |
| Chaveiro Take Cut: apresentação de produto | `/assets/posters/chaveiro-take-cut-960.webp` — 960 × 1706, 13.1 KiB | Sem original melhor localizado | Imagem existente preservada |

## Arquivos desktop

| Caminho | Dimensões | Tamanho |
|---|---|---|
| `/assets/posters/desktop/entrevista-corporativa.desktop-607.webp` | 607 × 1079 | 97.8 KiB |
| `/assets/posters/desktop/conteudo-social.desktop-640.webp` | 640 × 1246 | 128.4 KiB |
| `/assets/posters/desktop/conteudo-social.desktop-822.webp` | 822 × 1600 | 166.7 KiB |
| `/assets/posters/desktop/institucional-vertical.desktop-465.webp` | 465 × 933 | 139.2 KiB |
| `/assets/posters/desktop/hospedagem-tematica.desktop-720.webp` | 720 × 1280 | 111.4 KiB |
| `/assets/posters/desktop/reels-esmalteria.desktop-405.webp` | 405 × 720 | 37.8 KiB |
| `/assets/posters/desktop/anuncio-produto.desktop-640.webp` | 640 × 355 | 75.8 KiB |
| `/assets/posters/desktop/anuncio-produto.desktop-960.webp` | 960 × 532 | 136.4 KiB |
| `/assets/posters/desktop/anuncio-produto.desktop-1455.webp` | 1455 × 807 | 213.1 KiB |
| `/assets/posters/desktop/criativo-trafego-pago-3d.desktop-405.webp` | 405 × 720 | 41.8 KiB |
| `/assets/posters/desktop/youtube-narrativo.desktop-640.webp` | 640 × 353 | 33.2 KiB |
| `/assets/posters/desktop/youtube-narrativo.desktop-960.webp` | 960 × 530 | 52.4 KiB |
| `/assets/posters/desktop/youtube-narrativo.desktop-1461.webp` | 1461 × 806 | 85.4 KiB |
| `/assets/posters/desktop/gameplay-youtube.desktop-640.webp` | 640 × 360 | 15.5 KiB |
| `/assets/posters/desktop/gameplay-youtube.desktop-960.webp` | 960 × 540 | 27.1 KiB |
| `/assets/posters/desktop/gameplay-youtube.desktop-1280.webp` | 1280 × 720 | 36.2 KiB |
| `/assets/posters/desktop/conversa-3d.desktop-640.webp` | 640 × 360 | 13.0 KiB |
| `/assets/posters/desktop/conversa-3d.desktop-960.webp` | 960 × 540 | 18.5 KiB |
| `/assets/posters/desktop/conversa-3d.desktop-1280.webp` | 1280 × 720 | 25.5 KiB |
| `/assets/posters/desktop/conversa-3d.desktop-1920.webp` | 1920 × 1080 | 39.1 KiB |
| `/assets/posters/desktop/tratamento-audiovisual.desktop-640.webp` | 640 × 360 | 45.5 KiB |
| `/assets/posters/desktop/tratamento-audiovisual.desktop-960.webp` | 960 × 540 | 73.0 KiB |
| `/assets/posters/desktop/tratamento-audiovisual.desktop-1280.webp` | 1280 × 720 | 99.4 KiB |
| `/assets/posters/desktop/video-emocional.desktop-640.webp` | 640 × 360 | 55.8 KiB |
| `/assets/posters/desktop/video-emocional.desktop-960.webp` | 960 × 540 | 90.9 KiB |
| `/assets/posters/desktop/video-emocional.desktop-1460.webp` | 1460 × 821 | 139.0 KiB |
| `/assets/posters/desktop/cinematografico-ia.desktop-640.webp` | 640 × 360 | 31.6 KiB |
| `/assets/posters/desktop/cinematografico-ia.desktop-960.webp` | 960 × 540 | 50.7 KiB |
| `/assets/posters/desktop/cinematografico-ia.desktop-1280.webp` | 1280 × 720 | 64.7 KiB |

## Validação

- Comparação SHA-256: todos os arquivos originais do inventário permanecem intactos. Nenhum vídeo foi modificado.
- Comparação do HTML com a versão anterior: todos os atributos dos elementos img de fallback e dos vídeos originais foram preservados.
- Testes de geometria, object-fit e object-position em quatro rotas representativas, nas larguras 320, 375, 390, 430, 768, 1024, 1280, 1440, 1920 e 2560 px: sem diferenças em estados equivalentes.
- Carregamento mobile nas cinco larguras: nenhum currentSrc de imagem aponta para a pasta desktop.
- Comparação visual lado a lado das 13 capas tratadas, acompanhada de comparação de erro de pixels em relação ao original. A nova versão nativa tem menor erro nas 13 imagens.
- Validações de catálogo, revisões, planos, nichos, segurança e referências de thumbnails.

Os testes de navegador foram realizados em Chromium local; não constituem medição em todos os aparelhos, telas Retina ou navegadores reais. O mobile não recebe novos arquivos de imagem; o pequeno acréscimo compartilhado de HTML/CSS/JS necessário à seleção desktop não é uma promessa de bytes totais idênticos.
