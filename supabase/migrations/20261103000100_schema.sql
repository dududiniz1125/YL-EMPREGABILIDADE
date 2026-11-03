-- YL Empregabilidade — esquema principal
-- Recria o banco do zero: rode as migrations em ordem (supabase db push, ou psql).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
create type public.papel as enum ('candidato', 'empresa', 'admin');
create type public.status_candidato as enum ('ativo', 'contratado', 'inativo');
create type public.status_empresa as enum ('pendente', 'aprovada', 'bloqueada');
create type public.status_vaga as enum ('pendente', 'aberta', 'encerrada');
create type public.status_candidatura as enum (
  'inscrito', 'em_analise', 'entrevista', 'contratado', 'nao_selecionado'
);

-- ---------------------------------------------------------------------------
-- Perfis (1:1 com auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.papel not null,
  nome text not null default '',
  must_change_password boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.candidatos (
  id uuid primary key references public.profiles (id) on delete cascade,
  nome text not null,
  whatsapp text not null,
  email text not null,
  cidade text not null,
  area_principal text not null,
  outras_areas text[] not null default '{}',
  pretensao_salarial numeric(10, 2),
  turnos text[] not null default '{}',
  -- até 3 itens: [{ empresa, funcao, tempo }]
  experiencias jsonb not null default '[]'::jsonb
    check (jsonb_typeof(experiencias) = 'array' and jsonb_array_length(experiencias) <= 3),
  status public.status_candidato not null default 'ativo',
  consentimento_lgpd_em timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.empresas (
  id uuid primary key references public.profiles (id) on delete cascade,
  nome text not null,
  cnpj text,
  responsavel text not null,
  whatsapp text not null,
  email text not null,
  bairro text,
  status public.status_empresa not null default 'pendente',
  consentimento_lgpd_em timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vagas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  titulo text not null,
  area text not null,
  quantidade integer not null default 1 check (quantidade between 1 and 999),
  bairro text,
  salario numeric(10, 2),
  entrevista_em timestamptz,
  descricao text,
  status public.status_vaga not null default 'pendente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index vagas_empresa_idx on public.vagas (empresa_id);
create index vagas_status_area_idx on public.vagas (status, area);

create table public.candidaturas (
  id uuid primary key default gen_random_uuid(),
  candidato_id uuid not null references public.candidatos (id) on delete cascade,
  vaga_id uuid not null references public.vagas (id) on delete cascade,
  status public.status_candidatura not null default 'inscrito',
  -- vira true na primeira vez que o status chega em "entrevista"
  chegou_entrevista boolean not null default false,
  indicada_por_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (candidato_id, vaga_id)
);
create index candidaturas_vaga_idx on public.candidaturas (vaga_id);

-- Linha do tempo de cada candidatura
create table public.candidatura_eventos (
  id bigint generated always as identity primary key,
  candidatura_id uuid not null references public.candidaturas (id) on delete cascade,
  status public.status_candidatura not null,
  created_at timestamptz not null default now()
);
create index candidatura_eventos_idx on public.candidatura_eventos (candidatura_id, created_at);

-- ---------------------------------------------------------------------------
-- Provas por área
-- ---------------------------------------------------------------------------
create table public.provas (
  id uuid primary key default gen_random_uuid(),
  area text not null unique,
  titulo text not null,
  ativa boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.questoes (
  id uuid primary key default gen_random_uuid(),
  prova_id uuid not null references public.provas (id) on delete cascade,
  ordem integer not null default 0,
  enunciado text not null,
  alternativas text[] not null check (cardinality(alternativas) between 2 and 6),
  correta smallint not null,
  check (correta >= 0 and correta < cardinality(alternativas))
);
create index questoes_prova_idx on public.questoes (prova_id, ordem);

create table public.respostas_prova (
  id uuid primary key default gen_random_uuid(),
  candidato_id uuid not null references public.candidatos (id) on delete cascade,
  prova_id uuid not null references public.provas (id) on delete cascade,
  respostas jsonb not null,
  acertos integer not null,
  total integer not null,
  nota numeric(4, 1) not null, -- 0 a 10
  created_at timestamptz not null default now(),
  unique (candidato_id, prova_id)
);

-- ---------------------------------------------------------------------------
-- Admin: anotações, log e configurações do site
-- ---------------------------------------------------------------------------
create table public.anotacoes (
  id bigint generated always as identity primary key,
  candidato_id uuid not null references public.candidatos (id) on delete cascade,
  autor_id uuid references public.profiles (id) on delete set null,
  texto text not null,
  created_at timestamptz not null default now()
);

create table public.admin_log (
  id bigint generated always as identity primary key,
  admin_id uuid references public.profiles (id) on delete set null,
  acao text not null,
  alvo_tipo text,
  alvo_id text,
  detalhes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index admin_log_created_idx on public.admin_log (created_at desc);

create table public.configuracoes (
  id smallint primary key default 1 check (id = 1),
  areas text[] not null default array[
    'Garçom / Garçonete', 'Cumim', 'Cozinheiro(a)', 'Auxiliar de cozinha', 'Atendimento', 'Outra'
  ],
  whatsapp text not null default '',
  email text not null default 'ylempregabilidade@gmail.com',
  telefone text not null default '',
  endereco text not null default '',
  mostrar_numeros boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into public.configuracoes (id) values (1);
