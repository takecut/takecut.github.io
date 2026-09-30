# Validação do redesign — 30/09/2026

## Escopo

- 30 páginas: 12 rotas preservadas, Sobre, Planos e 16 projetos.
- 16 trabalhos reais, 10 equipamentos, três planos e quatro avaliações preservados.
- Backup anterior: `ecf584cbb9c89effbf7f6dc75261a7ae086f038d`.

## Verificações executadas

- `node _security/check.cjs`: 30 páginas aprovadas, CSP/hash, handlers, HTTPS, isolamento de janelas, sintaxe e nomes de arquivos privados.
- `node _studio/check.cjs`: catálogo, orientação, arquivos locais, links, âncoras, IDs únicos, um H1 e SEO por página.
- Navegador Microsoft Edge/Chromium automatizado: 30 páginas em 320, 375, 390, 430, 768, 1024, 1280, 1440, 1920 e 2560 pixels. 300 combinações, sem overflow horizontal, imagens quebradas detectadas, erros JavaScript ou violações CSP legítimas.
- Capturas de Home, portfólio, equipamentos, planos, Sobre, menu e player; rolagem prévia para carregar as imagens lazy antes da inspeção visual.
- Filtros combinados, seleção sem resultados, redefinição, carregar mais, busca por nome/categoria, três planos com links originais, avaliações e acordeão de processo.
- Preview desktop por hover e mobile por visibilidade; máximo de um preview ativo. Vídeos completos não requisitados na entrada da Home. Economia de dados sem solicitação automática de MP4.
- Player: abrir, próximo, fechar, Escape, foco de teclado e limpeza da mídia ao fechar. Pausa manual de animações.
- Cookie consent: recusa persistida. Injeção de script inline deliberada bloqueada pela CSP.
- Sem JavaScript: catálogo completo e páginas individuais com player nativo.
- Teste local com 100 cards: carregamento incremental de 8 para 16 sem publicar registros fictícios.

## Desempenho indicativo

Uma execução local em viewport mobile, CPU desacelerada 4x e rede emulada de aproximadamente 4 Mbps/80 ms registrou LCP de 1.032 ms. Não é medição de campo nem garantia de desempenho em redes/dispositivos reais. Os previews derivados somam 4,7 MB no repositório, mas são carregados individualmente, não juntos.

## Limites

Não foi realizado teste em iPhone/Android físico, Safari ou Firefox. O vídeo definitivo do Hero ainda deve ser fornecido/selecionado; o atual é provisório, com substituição configurável. Legendas/transcrições adicionais dependem de conteúdo revisado. Não foram inventados anos, nomes de clientes ou resultados para projetos sem esses dados.
