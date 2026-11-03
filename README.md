# YL Empregabilidade

Site e plataforma de recolocação profissional: candidatos criam conta, fazem a provinha da área e se candidatam às vagas. Empresas publicam vagas e acompanham os inscritos. A equipe YL administra tudo pelo painel `/admin`.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Magic UI · Supabase (Auth + Postgres + RLS) via `@supabase/ssr` · Vercel.

- Produção: https://yl-empregabilidade.vercel.app (deploy automático a cada push na `main`)

---

## 1. Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha com as chaves (ver seção 2)
npm run dev                  # http://localhost:3000
npm run build && npm start   # versão de produção
npm run lint
```

Sem as variáveis do Supabase, o site público funciona normalmente e as áreas logadas mostram "em configuração".

## 2. Variáveis de ambiente

| Variável | Onde é usada |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL pública (canonical, Open Graph, sitemap, robots). Padrão: `https://yl-empregabilidade.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública (anon). A integração da Vercel também pode criar `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, que o código aceita |
| `SUPABASE_SERVICE_ROLE_KEY` | **Só servidor.** Usada para excluir contas (LGPD) e pelo seed do admin. Nunca vai para o navegador |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | **Só no `.env.local`**, para o `npm run seed:admin`. Nunca no código, em commit ou na Vercel |
| `CRON_SECRET` (opcional) | Protege a rota `/api/keepalive` chamada pelo Cron da Vercel |

O `.env.local` está no `.gitignore`.

## 3. Colocar o Supabase no ar (passo a passo)

1. **Criar o banco pela Vercel:** projeto na Vercel → **Storage** → **Create** → **Supabase**. Conecte ao projeto `yl-empregabilidade`. As variáveis `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` são criadas sozinhas no projeto.
2. **Criar as tabelas:** no painel do Supabase → **SQL Editor**, rode, em ordem, os arquivos de `supabase/migrations/` (`…0100_schema.sql`, `…0200_functions_triggers.sql`, `…0300_rls.sql`). Com o Supabase CLI: `supabase link --project-ref <ref>` e `supabase db push`.
3. **Autenticação** (Supabase → **Authentication**):
   - **URL Configuration** → *Site URL*: `https://yl-empregabilidade.vercel.app`. *Redirect URLs*: `https://yl-empregabilidade.vercel.app/**` (depois, adicione também o domínio próprio: `https://ylempregabilidade.com.br/**`).
   - **Sign In / Providers → Email**: deixe **Confirm email** ligado.
   - **Emails → Templates**: cole o HTML de `supabase/templates/` em cada modelo (assuntos abaixo). Os links usam `{{ .SiteURL }}/auth/confirm/?token_hash=…`, que é o que o site espera.

     | Modelo | Arquivo | Assunto |
     | --- | --- | --- |
     | Confirm signup | `confirmacao.html` | Confirme seu e-mail · YL Empregabilidade |
     | Reset password | `recuperacao.html` | Crie uma nova senha · YL Empregabilidade |
     | Change email | `troca-email.html` | Confirme seu novo e-mail · YL Empregabilidade |
     | Magic link | `magic-link.html` | Seu link de acesso · YL Empregabilidade |
     | Invite user | `convite.html` | Convite · YL Empregabilidade |
4. **Redeploy** na Vercel (Deployments → ⋯ → Redeploy) para o site ler as variáveis novas.
5. **Criar o admin** (no seu computador): copie para o `.env.local` as variáveis do Supabase (Vercel → Settings → Environment Variables, ou Supabase → Project Settings → API) e adicione `ADMIN_EMAIL` e `ADMIN_PASSWORD`. Depois rode:
   ```bash
   npm run seed:admin
   ```
   O usuário sai com e-mail confirmado e papel `admin`, e o painel pede a troca de senha no primeiro acesso.

### ⚠️ E-mails: troque o SMTP padrão

O SMTP padrão do Supabase serve só para testes: o limite é **muito baixo (poucos e-mails por hora)**. Com mais de um ou dois cadastros por hora, as confirmações deixam de chegar. Para produção, use um SMTP próprio, por exemplo o **Resend**:

1. Crie conta em resend.com, adicione e verifique o domínio (ex.: `ylempregabilidade.com.br`) com os registros DNS que o Resend mostrar.
2. Crie uma API key.
3. Supabase → **Authentication → Emails → SMTP Settings** → ligue *Custom SMTP*: host `smtp.resend.com`, porta `465`, usuário `resend`, senha = API key, remetente `nao-responda@ylempregabilidade.com.br`, nome `YL Empregabilidade`.
4. Em **Authentication → Rate Limits**, aumente o limite de e-mails por hora.

### ⚠️ Plano gratuito do Supabase pausa por falta de uso

No plano gratuito, o Supabase **pausa o projeto depois de cerca de uma semana sem atividade**. Pausado, o login e os cadastros param até alguém reativar no painel.

- Este projeto já tem um **Cron da Vercel** (`vercel.json`) que chama `/api/keepalive` uma vez por dia e faz uma consulta leve no banco. Isso costuma evitar a pausa.
- A garantia mesmo é o **plano Pro** do Supabase, que não pausa e tem backup diário.
- Se pausar: Supabase → projeto → **Restore project**.

## 4. Papéis

| Papel | Área | O que pode |
| --- | --- | --- |
| `candidato` | `/candidato` | Ver e editar o próprio cadastro, fazer a provinha (uma vez por área), ver vagas **abertas**, se candidatar, acompanhar status, excluir a conta |
| `empresa` | `/empresa` | Criar, editar e encerrar as **próprias** vagas (entram como pendentes), ver os inscritos das próprias vagas (nome, área, experiências, nota). O WhatsApp só aparece a partir da etapa **Entrevista** |
| `admin` | `/admin` | Tudo: aprovar empresas e vagas, candidatos, candidaturas, provas, configurações do site, registro de ações |

Quem garante isso é o banco (Row Level Security em todas as tabelas + função `is_admin()`). O site confere o papel no `proxy.ts`, em cada página e em cada server action. **Ninguém vira admin pelo site:** o papel `admin` só é dado pelo seed ou direto no banco.

### Criar outro admin

- Rode o seed com outro e-mail: `ADMIN_EMAIL=outra@pessoa.com ADMIN_PASSWORD='senha-provisoria' npm run seed:admin`
- Ou, se a pessoa já tem conta, no SQL Editor: `update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'outra@pessoa.com');`

## 5. Editar conteúdo

- **Pelo painel** (`/admin/configuracoes`): áreas/funções (formulários, filtros e faixa de áreas do site), WhatsApp (botão flutuante), e-mail, telefone, endereço e a seção de números da landing (dados reais do banco).
- **No código:** textos das seções em `components/sections/*`; dados fixos (nome, CNPJ, cidade) em `lib/site-config.ts`; política em `app/privacidade/page.tsx`.
- O Formspree recebe só um **aviso** por e-mail a cada cadastro (nome, área e cidade). Os dados ficam no Supabase.

## 6. Testes

Os testes rodam contra um **Supabase de teste local** em Docker (Postgres + Auth + API + caixa de e-mail falsa), em `supabase/test-stack/`. As chaves desse ambiente são fictícias.

```bash
npm run test:stack:up      # sobe o Supabase de teste e aplica as migrations
npm run build              # build usando .env.local apontando para http://localhost:54321
npm run test:rls           # testes de RLS (sem navegador)
npm run test:e2e           # fluxos completos no iPhone 13, Pixel 7 e Desktop Chrome
npm run test:screens       # screenshots de todas as telas em /screenshots (+ checagem de scroll e toque)
npm run test:stack:down    # derruba e apaga o banco de teste
```

`.env.local` para os testes:

```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY de supabase/test-stack/.env>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY de supabase/test-stack/.env>
NEXT_PUBLIC_SITE_URL=http://localhost:3100
```

Os e-mails de teste aparecem em http://localhost:54324 (Mailpit).

O que é testado:
- **RLS:** candidato não lê nem edita outro candidato; candidato só vê vagas abertas; empresa não lê a tabela de candidatos nem inscritos de outras empresas; WhatsApp só a partir da entrevista; empresa não aprova a própria vaga; prova sem gabarito para o candidato; visitante sem acesso; ninguém vira admin.
- **E2E:** cadastro de candidato → confirmação → login → candidatura → status; empresa → admin aprova → vaga → admin aprova → candidato se inscreve → entrevista libera o WhatsApp; login do admin do seed + todas as telas + troca de senha; esqueci minha senha; acessos proibidos redirecionam para `/entrar`.

## 7. Backup do banco

- **Plano Pro:** backups diários automáticos (Supabase → Database → Backups).
- **Manual (qualquer plano):** Supabase → **Project Settings → Database → Connection string** (URI) e rode:
  ```bash
  pg_dump "postgresql://postgres:[SENHA]@db.[REF].supabase.co:5432/postgres" --schema=public --schema=auth -Fc -f backup-yl-$(date +%F).dump
  ```
  Ou, com o CLI: `supabase db dump -f backup.sql` (estrutura) e `supabase db dump --data-only -f dados.sql` (dados).
- Guarde os backups fora do computador (Drive etc.). Eles têm dados pessoais: proteja com senha.

## 8. Deploy e domínio próprio

- Cada push na `main` gera deploy automático na Vercel.
- **Domínio** (ex.: `ylempregabilidade.com.br`, registrado no Registro.br):
  1. Vercel → Project → **Settings → Domains → Add** → `ylempregabilidade.com.br` e `www.ylempregabilidade.com.br` (redirecione o `www` para o domínio raiz).
  2. No **Registro.br → Editar zona / DNS**: crie o registro **A** do domínio raiz e o **CNAME** do `www` com os valores que a Vercel mostrar. O HTTPS é automático.
  3. Atualize `NEXT_PUBLIC_SITE_URL` na Vercel e faça redeploy.
  4. Supabase → Authentication → URL Configuration: troque o *Site URL* para o domínio novo e adicione `https://ylempregabilidade.com.br/**` nas *Redirect URLs*.
  5. Formspree: se a restrição de domínios estiver ativa, adicione o domínio novo.

## 9. Estrutura

```
app/(auth)/            entrar, esqueci-senha, redefinir-senha, cadastro/candidato, cadastro/empresa
app/auth/              confirm (links dos e-mails) e sair
app/candidato/         área do candidato
app/empresa/           área da empresa
app/admin/             painel admin (+ actions.ts com todas as ações, cada uma conferindo o papel)
proxy.ts               renova a sessão e protege /candidato, /empresa e /admin
lib/supabase/          clientes do Supabase (navegador, servidor, service role)
supabase/migrations/   banco versionado (tabelas, RLS, triggers, funções)
supabase/templates/    e-mails em português
supabase/test-stack/   Supabase local para testes (Docker)
scripts/seed-admin.ts  cria/atualiza o admin
tests/                 RLS, E2E e screenshots (Playwright)
```
