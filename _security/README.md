# Segurança do site estático

Este repositório publica HTML, CSS, JavaScript e mídia no GitHub Pages. Não há backend próprio, login de visitantes ou banco de dados neste projeto. WhatsApp, Google Forms e serviços do Google são externos e têm controles próprios.

## Alterações futuras

- Instalar as dependências de validação com `npm ci --prefix _security --ignore-scripts` e executar `node _security/check.cjs` antes de publicar. O parser HTML é usado somente na validação, nunca carregado pelos visitantes; versões e integridade estão fixadas no lockfile.
- Se alterar um script inline legítimo, revisar o código e executar `node _security/check.cjs --write` para recalcular seus hashes CSP. Conferir o diff antes do commit. O CI apenas valida; não aprova hashes automaticamente.
- Usar `addEventListener`, nunca atributos `onclick`, `onerror` ou `javascript:`.
- Não adicionar origens externas à CSP sem revisar a necessidade e o fornecedor. Somente a home libera os serviços Google Ads existentes; demais páginas só executam scripts locais.
- Conteúdo de visitantes não deve ser interpolado em `innerHTML`. O catálogo atual é fixo no código; novos dados remotos devem usar `textContent`/DOM seguro ou sanitização revisada.
- Não armazenar senhas, tokens, dados pessoais ou chaves privadas no repositório público. `.gitignore` é prevenção de acidentes, não substitui secret scanning nem revogação de credenciais expostas.

## Limites importantes

A CSP usa hashes dos scripts inline, bloqueia handlers inline, objetos/plugins, base URLs, formulários locais e workers. CSS inline permanece permitido para preservar o layout e as animações existentes. CSP é defesa em profundidade: não impede alterações por uma conta com acesso administrativo comprometida, nem elimina a confiança nos scripts externos autorizados.

Em GitHub Pages, a política deste projeto é entregue por meta HTML. `frame-ancestors`, `X-Frame-Options`, `Permissions-Policy`, `X-Content-Type-Options` e HSTS não devem ser simulados com metas ou arquivo `_headers`: exigem suporte do servidor/CDN. Não há garantia de isolamento contra enquadramento de terceiros por esta alteração.

O proprietário deve usar passkey/2FA no GitHub, email e registrador do domínio, guardar códigos de recuperação fora do repositório e revisar sessões, colaboradores, apps e tokens. Alterações de autenticação exigem participação do proprietário. Manter domínio e HTTPS válidos.

O check automatizado cobre regressões específicas; não é pentest nem prova de ausência de vulnerabilidades. Em incidente, revogar acessos comprometidos, comparar/reverter commits conhecidos, rotacionar segredos expostos e verificar a publicação.

Referências: [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP), [CSP para Google Ads](https://developers.google.com/tag-platform/security/guides/csp), [branches protegidas](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).
