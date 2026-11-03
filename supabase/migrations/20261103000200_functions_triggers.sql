-- Funções auxiliares, triggers e RPCs

-- ---------------------------------------------------------------------------
-- Papéis
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.my_role()
returns public.papel
language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- true quando quem está executando é um usuário do site (não o servidor/postgres)
create or replace function public.is_site_user()
returns boolean
language sql stable
as $$
  select current_user in ('authenticated', 'anon');
$$;

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger candidatos_updated before update on public.candidatos
  for each row execute function public.set_updated_at();
create trigger empresas_updated before update on public.empresas
  for each row execute function public.set_updated_at();
create trigger vagas_updated before update on public.vagas
  for each row execute function public.set_updated_at();
create trigger candidaturas_updated before update on public.candidaturas
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Novo usuário → cria perfil + cadastro a partir dos dados do formulário.
-- O papel "admin" NUNCA vem do site: só candidato ou empresa.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  r text := m ->> 'role';
begin
  if r = 'candidato' then
    insert into public.profiles (id, role, nome) values (new.id, 'candidato', coalesce(m ->> 'nome', ''));
    insert into public.candidatos (
      id, nome, whatsapp, email, cidade, area_principal, outras_areas,
      pretensao_salarial, turnos, experiencias, consentimento_lgpd_em
    ) values (
      new.id,
      m ->> 'nome',
      m ->> 'whatsapp',
      new.email,
      m ->> 'cidade',
      m ->> 'area_principal',
      coalesce(array(select jsonb_array_elements_text(m -> 'outras_areas')), '{}'),
      nullif(m ->> 'pretensao_salarial', '')::numeric,
      coalesce(array(select jsonb_array_elements_text(m -> 'turnos')), '{}'),
      coalesce(m -> 'experiencias', '[]'::jsonb),
      case when (m ->> 'consentimento')::boolean then now() else null end
    );
  elsif r = 'empresa' then
    insert into public.profiles (id, role, nome) values (new.id, 'empresa', coalesce(m ->> 'responsavel', ''));
    insert into public.empresas (
      id, nome, cnpj, responsavel, whatsapp, email, bairro, consentimento_lgpd_em
    ) values (
      new.id,
      m ->> 'empresa',
      nullif(m ->> 'cnpj', ''),
      m ->> 'responsavel',
      m ->> 'whatsapp',
      new.email,
      nullif(m ->> 'bairro', ''),
      case when (m ->> 'consentimento')::boolean then now() else null end
    );
  end if;
  -- outros casos (ex.: admin criado pelo seed) não ganham perfil aqui
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Proteção de colunas sensíveis (vale mesmo que a RLS permita o UPDATE)
-- ---------------------------------------------------------------------------
-- security invoker: precisa enxergar o papel real de quem executa
create or replace function public.protect_profiles()
returns trigger language plpgsql set search_path = public as $$
begin
  if public.is_site_user() and new.role is distinct from old.role then
    raise exception 'Não é permitido alterar o papel pelo site' using errcode = '42501';
  end if;
  new.id := old.id;
  return new;
end $$;
create trigger profiles_protect before update on public.profiles
  for each row execute function public.protect_profiles();

-- security invoker: precisa enxergar o papel real de quem executa
create or replace function public.protect_candidatos()
returns trigger language plpgsql set search_path = public as $$
begin
  new.id := old.id;
  new.consentimento_lgpd_em := old.consentimento_lgpd_em;
  if public.is_site_user() and not public.is_admin() then
    new.status := old.status;
    new.email := old.email;
  end if;
  return new;
end $$;
create trigger candidatos_protect before update on public.candidatos
  for each row execute function public.protect_candidatos();

-- security invoker: precisa enxergar o papel real de quem executa
create or replace function public.protect_empresas()
returns trigger language plpgsql set search_path = public as $$
begin
  new.id := old.id;
  new.consentimento_lgpd_em := old.consentimento_lgpd_em;
  if public.is_site_user() and not public.is_admin() then
    new.status := old.status;
    new.email := old.email;
  end if;
  return new;
end $$;
create trigger empresas_protect before update on public.empresas
  for each row execute function public.protect_empresas();

-- security invoker: precisa enxergar o papel real de quem executa
create or replace function public.protect_vagas()
returns trigger language plpgsql set search_path = public as $$
begin
  if not public.is_site_user() or public.is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.empresa_id := auth.uid();
    new.status := 'pendente'; -- vaga nova sempre aguarda aprovação
  else
    new.empresa_id := old.empresa_id;
    -- a empresa só pode encerrar; não pode aprovar nem reabrir
    if new.status is distinct from old.status and new.status <> 'encerrada' then
      new.status := old.status;
    end if;
    if old.status = 'encerrada' then
      new.status := 'encerrada';
    end if;
  end if;
  return new;
end $$;
create trigger vagas_protect before insert or update on public.vagas
  for each row execute function public.protect_vagas();

-- security invoker: precisa enxergar o papel real de quem executa
create or replace function public.protect_candidaturas()
returns trigger language plpgsql set search_path = public as $$
begin
  if tg_op = 'INSERT' and public.is_site_user() and not public.is_admin() then
    new.candidato_id := auth.uid();
    new.status := 'inscrito';
    new.indicada_por_admin := false;
    new.chegou_entrevista := false;
  end if;
  if tg_op = 'UPDATE' then
    new.candidato_id := old.candidato_id;
    new.vaga_id := old.vaga_id;
  end if;
  if new.status = 'entrevista' then
    new.chegou_entrevista := true;
  end if;
  return new;
end $$;
create trigger candidaturas_protect before insert or update on public.candidaturas
  for each row execute function public.protect_candidaturas();

create or replace function public.log_candidatura_evento()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.candidatura_eventos (candidatura_id, status) values (new.id, new.status);
  end if;
  return new;
end $$;
create trigger candidaturas_evento after insert or update on public.candidaturas
  for each row execute function public.log_candidatura_evento();

-- ---------------------------------------------------------------------------
-- RPC: empresa muda o status de um inscrito (só nas próprias vagas)
-- ---------------------------------------------------------------------------
create or replace function public.empresa_mudar_status(p_candidatura uuid, p_status public.status_candidatura)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if p_status = 'inscrito' then
    raise exception 'Status inválido' using errcode = '22023';
  end if;
  update public.candidaturas c
     set status = p_status
    from public.vagas v
   where c.id = p_candidatura
     and v.id = c.vaga_id
     and (v.empresa_id = auth.uid() or public.is_admin());
  if not found then
    raise exception 'Candidatura não encontrada' using errcode = '42501';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Provas: o candidato recebe as questões SEM a resposta certa e a correção
-- acontece no banco. Cada prova só pode ser feita uma vez.
-- ---------------------------------------------------------------------------
create or replace function public.get_prova(p_prova uuid)
returns table (prova_id uuid, titulo text, area text, questao_id uuid, ordem int, enunciado text, alternativas text[])
language sql stable security definer set search_path = public
as $$
  select p.id, p.titulo, p.area, q.id, q.ordem, q.enunciado, q.alternativas
    from public.provas p
    join public.questoes q on q.prova_id = p.id
   where p.id = p_prova
     and p.ativa
     and public.my_role() = 'candidato'
     and not exists (
       select 1 from public.respostas_prova r where r.prova_id = p.id and r.candidato_id = auth.uid()
     )
   order by q.ordem, q.id;
$$;

create or replace function public.enviar_prova(p_prova uuid, p_respostas jsonb)
returns numeric
language plpgsql security definer set search_path = public
as $$
declare
  v_total int;
  v_acertos int;
  v_nota numeric(4, 1);
begin
  if public.my_role() is distinct from 'candidato' then
    raise exception 'Apenas candidatos fazem a prova' using errcode = '42501';
  end if;
  if exists (select 1 from public.respostas_prova where prova_id = p_prova and candidato_id = auth.uid()) then
    raise exception 'Você já fez esta prova' using errcode = '23505';
  end if;
  select count(*),
         count(*) filter (where (p_respostas ->> q.id::text)::int = q.correta)
    into v_total, v_acertos
    from public.questoes q
    join public.provas p on p.id = q.prova_id and p.ativa
   where q.prova_id = p_prova;
  if v_total = 0 then
    raise exception 'Prova sem questões' using errcode = '22023';
  end if;
  v_nota := round(v_acertos::numeric * 10 / v_total, 1);
  insert into public.respostas_prova (candidato_id, prova_id, respostas, acertos, total, nota)
  values (auth.uid(), p_prova, p_respostas, v_acertos, v_total, v_nota);
  return v_nota;
end $$;

-- ---------------------------------------------------------------------------
-- Números públicos da landing (só quando o admin ligar)
-- ---------------------------------------------------------------------------
create or replace function public.public_stats()
returns jsonb
language sql stable security definer set search_path = public
as $$
  select case when (select mostrar_numeros from public.configuracoes where id = 1) then
    jsonb_build_object(
      'candidatos', (select count(*) from public.candidatos),
      'vagas', (select count(*) from public.vagas where status = 'aberta'),
      'contratacoes', (select count(*) from public.candidaturas where status = 'contratado'),
      'empresas', (select count(*) from public.empresas where status = 'aprovada')
    )
  else null end;
$$;
