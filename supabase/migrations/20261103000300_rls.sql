-- Row Level Security: cada papel só enxerga o que precisa.

alter table public.profiles enable row level security;
alter table public.candidatos enable row level security;
alter table public.empresas enable row level security;
alter table public.vagas enable row level security;
alter table public.candidaturas enable row level security;
alter table public.candidatura_eventos enable row level security;
alter table public.provas enable row level security;
alter table public.questoes enable row level security;
alter table public.respostas_prova enable row level security;
alter table public.anotacoes enable row level security;
alter table public.admin_log enable row level security;
alter table public.configuracoes enable row level security;

-- Funções auxiliares (security definer) para evitar recursão entre políticas
create or replace function public.owns_vaga(p_vaga uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.vagas where id = p_vaga and empresa_id = auth.uid());
$$;
create or replace function public.applied_to(p_vaga uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.candidaturas where vaga_id = p_vaga and candidato_id = auth.uid());
$$;
create or replace function public.vaga_aberta(p_vaga uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.vagas where id = p_vaga and status = 'aberta');
$$;
create or replace function public.can_see_candidatura(p_candidatura uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.candidaturas c join public.vagas v on v.id = c.vaga_id
     where c.id = p_candidatura
       and (c.candidato_id = auth.uid() or v.empresa_id = auth.uid() or public.is_admin())
  );
$$;

-- Visitante (anon) não lê nem grava nada direto nas tabelas, exceto a configuração pública.
revoke all on all tables in schema public from anon;
grant select on public.configuracoes to anon;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- candidatos: o próprio candidato e o admin. Empresas NÃO leem esta tabela;
-- usam a view inscritos_empresa, que expõe só os campos necessários.
-- ---------------------------------------------------------------------------
create policy candidatos_select on public.candidatos for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy candidatos_update on public.candidatos for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
create policy candidatos_delete_admin on public.candidatos for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- empresas
-- ---------------------------------------------------------------------------
create policy empresas_select on public.empresas for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy empresas_update on public.empresas for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
create policy empresas_delete_admin on public.empresas for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- vagas
-- ---------------------------------------------------------------------------
-- candidato: só vagas abertas (+ as que ele já se candidatou, para o histórico)
create policy vagas_select_candidato on public.vagas for select to authenticated
  using (
    public.my_role() = 'candidato' and (
      status = 'aberta' or public.applied_to(id)
    )
  );
create policy vagas_select_empresa on public.vagas for select to authenticated
  using (empresa_id = auth.uid());
create policy vagas_select_admin on public.vagas for select to authenticated
  using (public.is_admin());
create policy vagas_insert on public.vagas for insert to authenticated
  with check (
    (public.my_role() = 'empresa' and empresa_id = auth.uid()
      and exists (select 1 from public.empresas e where e.id = auth.uid() and e.status <> 'bloqueada'))
    or public.is_admin()
  );
create policy vagas_update on public.vagas for update to authenticated
  using (empresa_id = auth.uid() or public.is_admin())
  with check (empresa_id = auth.uid() or public.is_admin());
create policy vagas_delete_admin on public.vagas for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- candidaturas
-- ---------------------------------------------------------------------------
create policy candidaturas_select on public.candidaturas for select to authenticated
  using (
    candidato_id = auth.uid()
    or public.is_admin()
    or public.owns_vaga(vaga_id)
  );
create policy candidaturas_insert_candidato on public.candidaturas for insert to authenticated
  with check (
    public.my_role() = 'candidato'
    and candidato_id = auth.uid()
    and public.vaga_aberta(vaga_id)
  );
create policy candidaturas_admin on public.candidaturas for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
-- empresa muda status só pela função empresa_mudar_status()

create policy eventos_select on public.candidatura_eventos for select to authenticated
  using (public.can_see_candidatura(candidatura_id));

-- ---------------------------------------------------------------------------
-- provas / questões / respostas
-- ---------------------------------------------------------------------------
create policy provas_select on public.provas for select to authenticated
  using (ativa or public.is_admin());
create policy provas_admin on public.provas for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- questões (com a resposta certa): só admin. Candidato usa get_prova().
create policy questoes_admin on public.questoes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy respostas_select on public.respostas_prova for select to authenticated
  using (candidato_id = auth.uid() or public.is_admin());
create policy respostas_admin on public.respostas_prova for delete to authenticated
  using (public.is_admin());
-- inserção só por enviar_prova()

-- ---------------------------------------------------------------------------
-- admin
-- ---------------------------------------------------------------------------
create policy anotacoes_admin on public.anotacoes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy log_select on public.admin_log for select to authenticated
  using (public.is_admin());
create policy log_insert on public.admin_log for insert to authenticated
  with check (public.is_admin() and admin_id = auth.uid());

create policy config_select on public.configuracoes for select to anon, authenticated
  using (true);
create policy config_update on public.configuracoes for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- View para a empresa: inscritos nas PRÓPRIAS vagas, só com os campos
-- necessários. WhatsApp aparece apenas a partir da etapa "entrevista".
-- (A view roda com os privilégios do dono e filtra por auth.uid().)
-- ---------------------------------------------------------------------------
create view public.inscritos_empresa
with (security_barrier = true)
as
select
  c.id as candidatura_id,
  c.vaga_id,
  c.status,
  c.created_at,
  ca.nome,
  ca.area_principal,
  ca.experiencias,
  (select r.nota from public.respostas_prova r
     join public.provas p on p.id = r.prova_id
    where r.candidato_id = ca.id and p.area = v.area
    limit 1) as nota_prova,
  case
    when c.status in ('entrevista', 'contratado')
      or (c.status = 'nao_selecionado' and c.chegou_entrevista)
    then ca.whatsapp
  end as whatsapp
from public.candidaturas c
join public.vagas v on v.id = c.vaga_id
join public.candidatos ca on ca.id = c.candidato_id
where v.empresa_id = auth.uid();

revoke all on public.inscritos_empresa from anon, public;
grant select on public.inscritos_empresa to authenticated;

-- RPCs
revoke execute on function public.empresa_mudar_status(uuid, public.status_candidatura) from anon, public;
revoke execute on function public.get_prova(uuid) from anon, public;
revoke execute on function public.enviar_prova(uuid, jsonb) from anon, public;
grant execute on function public.empresa_mudar_status(uuid, public.status_candidatura) to authenticated;
grant execute on function public.get_prova(uuid) to authenticated;
grant execute on function public.enviar_prova(uuid, jsonb) to authenticated;
grant execute on function public.public_stats() to anon, authenticated;
