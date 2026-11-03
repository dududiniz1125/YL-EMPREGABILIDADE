# YL Empregabilidade — site

Site institucional (one-page + Política de Privacidade) da YL Empregabilidade, plataforma de recolocação profissional que conecta candidatos a empresas.

**Stack:** Next.js (App Router, export estático) · TypeScript · Tailwind CSS v4 · shadcn/ui · Magic UI (motion) · react-hook-form + zod · lucide-react.

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # gera o site estático em out/
npm run lint
```

Para testar o build: `npx serve out`.

## Editar textos, contatos e áreas

Quase tudo que muda com frequência está em **`lib/site-config.ts`**:

| Campo | O que é |
| --- | --- |
| `email`, `phone`, `address`, `city`, `cnpj` | Contato e dados legais. `phone` e `address` vazios **não aparecem** no site. |
| `whatsapp` | Só números, com DDI e DDD (ex.: `"5511999999999"`). Preenchido, aparece o botão flutuante de WhatsApp. |
| `whatsappMessage` | Mensagem que já vem escrita ao abrir o WhatsApp. |
| `formspree.candidato` / `formspree.empresa` | Endpoints dos formulários. |
| `areas` | Funções do select dos formulários, da faixa "Áreas atendidas" e do card "Provas por área". Mantenha `"Outra"` no fim. |
| `rotatingRoles` | Palavras que giram no título do topo. |
| `messages` | Textos de sucesso depois do envio. |

Textos das seções ficam em `components/sections/*` (um arquivo por seção). A política fica em `app/privacidade/page.tsx`. Se mudar os campos dos formulários, **atualize também a lista "Dados que coletamos" da política**.

## Ligar recursos (flags)

Em `lib/site-config.ts`:

- **Números** (`stats`): preencha os valores **reais** e use `enabled: true`. Valores 0 são escondidos. Com `enabled: false`, a seção não aparece.
- **Login** (`features.login`): hoje mostra "Área do candidato e da empresa — em breve". Só ligue quando existir autenticação de verdade; os cards de acesso já estão prontos em `components/sections/acesso.tsx`.
- **Depoimentos** (`features.depoimentos` + lista `depoimentos`): use apenas relatos reais, com autorização.

## Logo e ícones

O logo veio como print (faixas pretas, fundo branco). O script `scripts/process-logo.py` recorta, deixa o fundo transparente e gera `public/logo*.{png,webp}`, `app/icon.png` e `app/apple-icon.png`:

```bash
python3 scripts/process-logo.py caminho/do/logo-original.png
```

O ideal é pedir ao cliente o **logo em vetor (SVG)**. A imagem de compartilhamento (`public/og.png`) é gerada por `scripts/make-og.py`.

## Deploy na Vercel

1. Suba o repositório no GitHub.
2. Na Vercel: **Add New → Project → Import** o repositório. O framework Next.js é detectado sozinho (build `npm run build`, saída estática).
3. Em **Settings → Environment Variables**, crie `NEXT_PUBLIC_SITE_URL` com a URL final (ex.: `https://ylempregabilidade.com.br`). Sem ela, o site usa a URL de produção da Vercel. Ela alimenta canonical, Open Graph, `sitemap.xml` e `robots.txt`.
4. A partir daí, cada push na `main` gera um deploy automático.

Pela linha de comando também funciona: `npx vercel` (preview) e `npx vercel --prod`.

### Domínio próprio (Registro.br)

1. Vercel → Project → **Settings → Domains → Add** → `ylempregabilidade.com.br`, depois `www.ylempregabilidade.com.br` (escolha redirecionar o `www` para o domínio raiz).
2. A Vercel mostra os registros DNS. No **Registro.br → domínio → Editar zona / DNS**, crie:
   - registro **A** do domínio raiz, com o IP que a Vercel indicar;
   - registro **CNAME** do `www`, com o valor que a Vercel indicar.
   Use sempre os valores exibidos na tela da Vercel.
3. Aguarde a propagação. O HTTPS é emitido automaticamente.
4. Atualize `NEXT_PUBLIC_SITE_URL` para o domínio novo e faça um redeploy.
5. No **Formspree**, se a restrição de domínios estiver ativa, adicione o domínio novo nos dois formulários.

## Estrutura

```
app/                 layout (metadata, fontes, JSON-LD), página, /privacidade, sitemap, robots, ícones
components/sections  uma seção da landing por arquivo
components/forms     formulários (carregados sob demanda)
components/magicui   componentes Magic UI (adaptados: pt-BR, reduced-motion, performance)
components/ui        componentes shadcn/ui
components/site      navbar, rodapé, logo, botão de WhatsApp
lib/site-config.ts   dados editáveis
```

Acessibilidade: com `prefers-reduced-motion`, todas as animações ficam paradas.
